import mqtt, { IClientOptions } from "mqtt";
import { isUndefined } from "util";

export interface ServerStatus {
    message: string;
    color: "info" | "success" | "warning" | "link" | "black" | "white" | "primary" | "danger" | "light" | "dark" | undefined;
}

export type IUpdateType = "IsConnected" | "time" | "lastUpdateTime" | "wifiStrength";
export type ValueType = boolean | number;

export interface IValueType {
    (stationName: string, update: IUpdateType, value: ValueType) : void;
}

export interface ISettings {
    mqtt_server: string;
    user_name?: string;
	protocol: "wss" | "ws" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs";
    password?: string;
    port: number;
    MaxWaitTime: number;
}

export default function MqttManager(setServerStatus: (val: ServerStatus) => void, setValues: IValueType, setSettings: (val: ISettings) => void) {
    const settings: Promise<ISettings> = fetch("assets/config/settings.json")
        .then((x) => x.json())
        .catch((x) => console.log(x));
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
                setValues(deviceId, 'time', timeDelay);
            } else if (func === "heartbeat") {
                setValues(deviceId, 'IsConnected', false);
            } else if (func === "telemetry") {
                if (ch === "last update time") {
                    setValues(deviceId, 'lastUpdateTime', parseInt(msg.toString()));                    
                } else if (ch === "wifi Signal Strength") {
                    setValues(deviceId, 'wifiStrength', parseInt(msg.toString()));    
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

    let unmount: any = null;
    settings.then((val) => {
        // console.log(val.mqtt_server, options);
        setSettings(val);
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

        unmount = () => {
            console.log("disconnecting");
            client.end(true);
        };
    })
        .catch((e) => {
            console.log("error reading status file", e);
        });

    return unmount;
}