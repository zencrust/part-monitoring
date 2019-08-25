import React from 'react'
import {List, Card, Content, Progress} from 'rbx';
import PlaySound from '../PlaySound/index';
import {IStationStatus, StationStatusType} from '../MainLayout';
import { ISettings } from '../../MqttManager';
import { ToTimeFormat } from '../../Utils/index'
import "./styles.scss";
import { isUndefined } from 'util';

function calculateColor(time: number, settings?:ISettings){
    if(isUndefined(settings)){
        return "warning"; 
    }

    let t = time / settings.MaxWaitTime;
    if(t < 0.5){
        return "success";
    }
    if(t < 1){ 
        return "warning";
    }

    return "danger";
}

function RecordToArray(alarms: StationStatusType){
    let retval: IStationStatus[] = []
    alarms.forEach((v, k) =>
    {
        if(v.isConnected && v.time > 0){
            retval.push(v);
        }    
    });

    retval.sort((a, b) => b.time - a.time);
    return retval;
}

function AlarmList(props: {alarms : StationStatusType, settings? : ISettings}) {
    const val = RecordToArray(props.alarms);
    if(val.length === 0){
        return(
            <div className="allClear">
                No stations requested new kits
            </div>
        )
    }
    return (
        <div>
            <PlaySound playSound={true}/>
            <List>
                {val.map(item => 
                    <List.Item key={item.name}>
                        <Card>
                            <Card.Header>
                                <Card.Header.Title>
                                    <div className="headerTitle" style={{ fontSize:'33px'}}>
                                        <div className="msgTitle">{item.name} has requested for new kits.</div>
                                        <div className="msgTime">Time Elasped: <time
                                        dateTime={ToTimeFormat(item.time)}>{ToTimeFormat(item.time)}</time></div>
                                    </div>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content>
                                    <Progress value={item.time} min={0} max={isUndefined(props.settings)? 30 : props.settings.MaxWaitTime} color={calculateColor(item.time, props.settings)}/>
                                </Content>
                            </Card.Content>
                        </Card>
                    </List.Item>
                )}
            </List>
        </div>
    )
}

export default AlarmList
