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
    mainTopic: string;
    panelHeader: string;
}

const clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);

const registerChanges = (client: mqtt.Client, setValues: IValueFuntionType) => {
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

const registerErrors = (client: mqtt.Client, setServerStatus: (val: ServerStatus) => void) => {
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


const MqttManager = async (setServerStatus: (val: ServerStatus) => void, setValues: IValueFuntionType) =>
{
    const clientOptions: IClientOptions = {
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
    setServerStatus({ message: "Connecting ", color: "warning" });

    const v = await axios.get<ISettings>("assets/config/settings.json");
    const settings = v.data;

    // console.log(val.mqtt_server, options);
    clientOptions.username = settings.user_name;
    clientOptions.password = settings.password;
    clientOptions.protocol = settings.protocol;
    clientOptions.clean = true;
    clientOptions.servers = [{
        host: settings.mqtt_server,
        port: settings.port,
        protocol: settings.protocol,
    }];
    
    // console.log(val);
    const client = mqtt.connect(clientOptions);
    client.subscribe(`${settings.mainTopic}/#`, { qos: 2 });
    console.log("connection sub", settings.mqtt_server);
    registerErrors(client, setServerStatus);
    registerChanges(client, setValues);
    return {client, settings};
};

export default MqttManager;
