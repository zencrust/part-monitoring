import axios from "axios";
import mqtt, { IClientOptions } from "mqtt";

export interface ServerStatus {
    message: string;
    color: "info" | "success" | "warning" | "link" | "black" | "white" | "primary" | "danger" | "light" | "dark" | undefined;
}

export interface StationData{
    AlertId : string;
    Alert : string;
    AlertType: string;
    Location: string;
    InitiatedBy: string;
    AcknowledgeBy: string;
    ResolvedBy: string;
    InitiateTime: string;
    IsActive: boolean;
    AcknowledgeTime: string;
    ResolvedTime: string;
    Slalevel: number;
}

export type IValueFuntionType = (stationData: StationData) => void;

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

            let stationMsg: StationData = JSON.parse(msg.toString());
            setValues(stationMsg);
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
                setServerStatus({ message: "connection failed", color: "error" });
            }
        });
        client.on("error", () => {
            console.log("connection error");
            setServerStatus({ message: "connection failed ", color: "error" });
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
                client.subscribe("partalarm2/#", { qos: 2 });
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
