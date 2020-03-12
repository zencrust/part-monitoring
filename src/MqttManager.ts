import mqtt, {IClientOptions} from "mqtt";
import {ISettings, IValueFuntionType, ServerStatus, StationData} from "./types";

export default function MqttManager(settings: ISettings, setServerStatus: (val: ServerStatus) => void,
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

    setServerStatus({message: "Connecting ", color: "info"});

    const _registerChanges = (client: mqtt.MqttClient) => {
        console.log("_registerChanges");
        client.on("message", (topic, msg) => {
            // console.log(topic);
            const [, fn, machine_name] = topic.split("/");
            if (fn === "will_message" && machine_name === "emailParser1") {
                if (msg.toString() === "0") {
                    setServerStatus({message: "Email server connection failed", color: "danger"});
                } else {
                    setServerStatus({message: "Connection successful", color: "success"});
                }
            } else {
                let stationMsg: StationData = JSON.parse(msg.toString());
                setValues(stationMsg);
            }
        });
    };

    const _registerErrors = (client: mqtt.MqttClient) => {
        client.on("connect", () => {
            console.log("Connected");
            setServerStatus({message: "Connection Successful", color: "success"});
        });
        client.on("reconnect", () => {
            console.log("connecting error");
            if (!client.connected) {
                setServerStatus({message: "Connection Failed", color: "danger"});
            }
        });
        client.on("error", () => {
            console.log("connection error");
            setServerStatus({message: "Connection Failed ", color: "danger"});
        });
    };

    const val = settings;
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
    client.subscribe("partalarm2/will_message/#", {qos: 2});
    client.subscribe("partalarm2/eAndon/#", {qos: 2});

    console.log("connection sub", val.mqtt_server);
    setServerStatus({message: "Connecting ", color: "warning"});
    _registerErrors(client);
    _registerChanges(client);
    return () => {
        console.log("disconnecting");
        client.end(true);
    }
}
