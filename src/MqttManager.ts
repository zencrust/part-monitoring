import mqtt, { IClientOptions } from "mqtt"

export interface ServerStatus{
    message: string;
    color: "success" | "processing" | "default" | "error" | "warning";
}

export interface IMessage{
    time: string,
    value: number,
}

export interface IDisplayMessage{
    time: string,
    title: string
}

export default function MqttManager(setServerStatus:(val: ServerStatus) => void, setValues:(val: IDisplayMessage[]) => void){
    let settings = fetch('assets/config/settings.json')
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

    var data: { [id: string] : IMessage; } = {};

    setServerStatus({message:'connecting to server... ', color: "default"});

    let _registerChanges = (client:mqtt.MqttClient) => {
        console.log('_registerChanges');
        client.on('message', (topic, msg) => {
            console.log(topic);

            let tp = topic.split('/');
            let json:IMessage = JSON.parse(msg.toString());            
            data[tp[1]] = {time: json.time, value: json.value};
            let val:IDisplayMessage[] = []
            for(let i in data){
                if(data[i].value === 0){
                    val.push({title: i, time: data[i].time});
                }
            }
            
            val.sort((a, b) => Number(b.time) - Number(a.time));
            setValues(val);
        });
    }

    let _registerErrors = (client: mqtt.MqttClient) => {
        client.on('connect', () => {
            console.log('connection successful');
            setServerStatus({ message: 'server connected', color: "success" });
        });
        client.on('reconnect', () => {
            console.log('connection error reconnecting...');
            if(!client.connected){
                setServerStatus({ message: 'Server connection lost', color: "warning" });
            }
        });
        client.on('error', () => {
            console.log('connection error');
            setServerStatus({ message: 'Server connection error ', color: "error" });
        });
    }

    let unmount: any = null;
    settings.then(val =>{
        //console.log(val.mqtt_server, options);
        let client  = mqtt.connect(val.mqtt_server, options);
        client.subscribe("dio/#", {qos: 2});
        console.log('connection sub', val.mqtt_server);
        setServerStatus({message:'connecting to server... ', color: "processing"})
        _registerErrors(client);
        _registerChanges(client);

        unmount = () => {
            console.log('disconnecting');
            client.end(true)};
    });

    return unmount;
}