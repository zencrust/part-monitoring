import mqtt, { IClientOptions } from "mqtt"

export interface ServerStatus{
    message: string;
    color: "success" | "error" | "warning" | "info" | undefined;
}

export interface IMessage{
    time: number,
}

export interface IDisplayMessage{
    time: number,
    title: string
}

export interface ISettings{
    mqtt_server: string;
    user_name?: string;
    password?: string;
    port: number;
}

export default function MqttManager(setServerStatus:(val: ServerStatus) => void, setValues:(val: IDisplayMessage[]) => void){
    let settings: Promise<ISettings> = fetch('assets/config/settings.json')
                    .then(x => x.json())
                    .catch(x => console.log(x));
    let clientId = 'mqttjs_' + Math.random().toString(16).substr(2, 8);

    let options:IClientOptions = {
        keepalive: 10,
        clientId: clientId,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 5000,
        will: {
            topic: 'WillMsg',
            payload: 'Connection Closed abnormally..!',
            qos: 0,
            retain: false
        },
        rejectUnauthorized: false
    }

    let data: { [id: string] : IMessage; } = {};

    setServerStatus({message:'Connecting ', color: "info"});

    let _registerChanges = (client:mqtt.MqttClient) => {
        console.log('_registerChanges');
        client.on('message', (topic, msg) => {
            //console.log(topic);

            let [, deviceId, func ] = topic.split('/');
            if(func === 'dio'){

                let utcSeconds = parseInt(msg.toString());
                data[deviceId] = {time:utcSeconds};    
                CalculateAndSetValue(data, setValues);
            }
            else if (func === 'heartbeat') {
                data[deviceId] = {time:0}; //disconnected. error out now
                CalculateAndSetValue(data, setValues);
            }
        });
    }

    let _registerErrors = (client: mqtt.MqttClient) => {
        client.on('connect', () => {
            console.log('Connected');
            setServerStatus({ message: 'Connection succeessful', color: "success" });
        });
        client.on('reconnect', () => {
            console.log('connecting error');
            if(!client.connected){
                setServerStatus({ message: 'connection failed', color: "error" });
            }
        });
        client.on('error', () => {
            console.log('connection error');
            setServerStatus({ message: 'connection failed ', color: "error" });
        });
    }

    let unmount: any = null;
    settings.then(val =>{
        //console.log(val.mqtt_server, options);
        options.username = val.user_name;
        options.password = val.password;
        options.protocol = "wss";
        options.servers = [{
            host: val.mqtt_server,
            port: val.port,
            protocol: "wss"
        }];
        //console.log(val);
        let client  = mqtt.connect(options);
        client.subscribe("partalarm/#", {qos: 2});
        console.log('connection sub', val.mqtt_server);
        setServerStatus({message:'Connecting ', color: "warning"})
        _registerErrors(client);
        _registerChanges(client);

        unmount = () => {
            console.log('disconnecting');
            client.end(true)};
    })
    .catch(e => {
        console.log("error reading status file", e);
    });

    return unmount;
}
function CalculateAndSetValue(data: { [id: string]: IMessage; }, setValues: (val: IDisplayMessage[]) => void) {
    let val: IDisplayMessage[] = [];
    for (let i in data) {
        if (data[i].time !== 0) {
            val.push({ title: i, time: data[i].time });
        }
    }
    val.sort((a, b) => Number(b.time) - Number(a.time));
    setValues(val);
}

