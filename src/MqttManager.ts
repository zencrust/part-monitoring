import axios from "axios";
import mqtt, { IClientOptions } from "mqtt";

export interface ServerStatus {
    message: string;
    color: "info" | "success" | "warning" | "link" | "black" | "white" | "primary" | "danger" | "light" | "dark" | undefined;
}

export interface IBaseValueType<T1, T2> {
    updateType: T1;
    value: T2;
}

export type IBooleanValueType = IBaseValueType<"IsConnected", boolean>;
export type NumberUpdateType = "time" | "lastUpdateTime" | "wifiStrength";
export type INumericValueType = IBaseValueType<NumberUpdateType, number>;
export type ISetServerStatusType = IBaseValueType<"setServerStatus", ServerStatus>;
export type ISetSettingsType = IBaseValueType<"Settings", ISettings>;

export type IValueType = IBooleanValueType | INumericValueType;
export type IValueFuntionType = (stationName: string, value: IValueType) => void;

function CreateBooleanValueType(value: boolean): IBooleanValueType {
    return {
        updateType: "IsConnected",
        value,
    };
}

function CreateNumericValueType(updateType: NumberUpdateType, value: number): INumericValueType {
    return {
        updateType,
        value,
    };
}

export interface ISettings {
    mqtt_server: string;
    user_name?: string;
    protocol: "wss" | "ws" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs";
    password?: string;
    port: number;
    MaxWaitTime: number;
}

export interface IMqttConstructed {
    disconnect: VoidFunction;
    settings: ISettings;
}

function CreateMqttValue(disconnect: VoidFunction, settings: ISettings): IMqttConstructed {
    return { disconnect, settings };
}

export default function MqttManager(setServerStatus: (val: ServerStatus) => void,
                                    setValues: IValueFuntionType) {

    const clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);

    const options: IClientOptions = {
        keepalive: 10,
        clientId,
        protocolId: "MQTT",
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 5000,
        will: {
            topic: "WillMsg",
            payload: "Connection Closed abnormally..!",
            qos: 0,
            retain: false,
        },
        rejectUnauthorized: false,
    };

    setServerStatus({ message: "Connecting ", color: "info" });

    const _registerChanges = (client: mqtt.MqttClient) => {
        console.log("_registerChanges");
        client.on("message", (topic, msg) => {
            // console.log(topic);

            const [, deviceId, func, ch] = topic.split("/");
            if (func === "dio" && ch === "Switch Pressed") {

                let timeDelay = parseInt(msg.toString());
                timeDelay = isNaN(timeDelay) ? 0 : timeDelay;
                setValues(deviceId, CreateNumericValueType("time", timeDelay));
            } else if (func === "heartbeat") {
                setValues(deviceId, CreateBooleanValueType(false));
            } else if (func === "telemetry") {
                if (ch === "last update time") {
                    setValues(deviceId, CreateNumericValueType("lastUpdateTime", parseInt(msg.toString())));
                } else if (ch === "wifi Signal Strength") {
                    setValues(deviceId, CreateNumericValueType("wifiStrength", parseInt(msg.toString())));
                }
            }
        });
    };

    const _registerErrors = (client: mqtt.MqttClient) => {
        client.on("connect", () => {
            console.log("Connected");
            setServerStatus({ message: "Connection succeessful", color: "success" });
        });
        client.on("reconnect", () => {
            console.log("connecting error");
            if (!client.connected) {
                setServerStatus({ message: "connection failed", color: "danger" });
            }
        });
        client.on("error", () => {
            console.log("connection error");
            setServerStatus({ message: "connection failed ", color: "danger" });
        });
    };

    const returnPromise = new Promise<IMqttConstructed>((resolve, reject) => {
        axios.get<ISettings>("assets/config/settings.json")
            .then((v) => {
                const val = v.data;
                // console.log(val.mqtt_server, options);
                options.username = val.user_name;
                options.password = val.password;
                options.protocol = val.protocol;
                options.clean = true;
                options.servers = [{
                    host: val.mqtt_server,
                    port: val.port,
                    protocol: val.protocol,
                }];
                // console.log(val);
                const client = mqtt.connect(options);
                client.subscribe("partalarm/#", { qos: 2 });
                console.log("connection sub", val.mqtt_server);
                setServerStatus({ message: "Connecting ", color: "warning" });
                _registerErrors(client);
                _registerChanges(client);
                resolve(CreateMqttValue(() => {
                    console.log("disconnecting");
                    client.end(true);
                }, val));
            })
            .catch((e) => {
                reject(e);
                console.log("error reading status file", e);
            });
    });

    return returnPromise;
}
