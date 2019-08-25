import mqtt, { IClientOptions } from "mqtt";
import { isUndefined } from "util";

export interface ServerStatus {
    message: string;
    color: "info" | "success" | "warning" | "link" | "black" | "white" | "primary" | "danger" | "light" | "dark" | undefined;
}

export interface IMessage {
    time: number;
}

export interface IStationStatus {
    name: string;
    lastUpdateTime: number;
    wifiStrength: number;
    isConnected: boolean;
}

export interface IDisplayMessage {
    time: number;
    title: string;
}

export interface ISettings {
    mqtt_server: string;
    user_name?: string;
	protocol: "wss" | "ws" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs";
    password?: string;
    port: number;
    MaxWaitTime: number;
}

export default function MqttManager(setServerStatus: (val: ServerStatus) => void, setValues: (val: IDisplayMessage[]) => void, setSettings: (val: ISettings) => void, statusCallback: (val: IStationStatus[]) => void) {
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

    const data: { [id: string]: IMessage; } = {};
    const stationStatus: {[id: string]: IStationStatus; } = {};
    setServerStatus({ message: "Connecting ", color: "info" });

    const _registerChanges = (client: mqtt.MqttClient) => {
        console.log("_registerChanges");
        client.on("message", (topic, msg) => {
            // console.log(topic);

            const [, deviceId, func, ch] = topic.split("/");
            if (func === "dio" && ch === "Switch Pressed") {

                let utcSeconds = parseInt(msg.toString());
                utcSeconds = isNaN(utcSeconds) ? 0 : utcSeconds;
                data[deviceId] = { time: utcSeconds };
                CalculateAndSetValue(data, stationStatus, setValues);
            } else if (func === "heartbeat") {
                data[deviceId] = { time: 0 }; // disconnected. error out now
                const st = stationStatus[deviceId];
                if (isUndefined(st)) {
                    stationStatus[deviceId] = {
                        name: deviceId,
                        lastUpdateTime: 0,
                        wifiStrength: 0,
                        isConnected: false,
                    };
                } else {
                    stationStatus[deviceId].isConnected = false;
                }

                SendStatus(stationStatus, statusCallback);
            } else if (func === "telemetry") {
                const st = stationStatus[deviceId];
                if (isUndefined(st)) {
                    if (ch === "last update time") {
                        stationStatus[deviceId] = {
                            name: deviceId,
                            lastUpdateTime: parseInt(msg.toString()),
                            wifiStrength: 0,
                            isConnected: true,
                        };
                    } else if (ch === "wifi Signal Strength") {
                        stationStatus[deviceId] = {
                            name: deviceId,
                            lastUpdateTime: 0,
                            wifiStrength: parseInt(msg.toString()),
                            isConnected: true,
                        };
                    }

                } else {
                    if (ch === "last update time") {
                        stationStatus[deviceId].lastUpdateTime = parseInt(msg.toString());
                    } else if (ch === "wifi Signal Strength") {
                        stationStatus[deviceId].wifiStrength = parseInt(msg.toString());
                    }
                }

                SendStatus(stationStatus, statusCallback);
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

function SendStatus(data: {[id: string]: IStationStatus; }, callback: (val: IStationStatus[]) => void) {
    const val: IStationStatus[] = [];
    for (const i in data) {
        val.push(data[i]);
    }

    callback(val);
}

function CalculateAndSetValue(data: { [id: string]: IMessage; }, stationStatus: {[id: string]: IStationStatus }, setValues: (val: IDisplayMessage[]) => void) {
    const val: IDisplayMessage[] = [];
    for (const i in data) {
        const v = stationStatus[i].isConnected;
        if (v !== true) {
            continue;
        }

        if (data[i].time !== 0) {
            val.push({ title: i, time: data[i].time });
        }
    }
    val.sort((a, b) => b.time - a.time);
    setValues(val);
}
