import React from 'react'
import {List, Card, Content, Progress} from 'rbx';
import PlaySound from '../PlaySound/index';
import { IDisplayMessage, ISettings } from '../../MqttManager';
import { ToTimeFormat } from '../../Utils/index'
import "./styles.scss";
import { isUndefined } from 'util';


interface IValueState {
    message:IDisplayMessage;
    diff:number;
}

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

function timeDiff(utcSeconds: number){
    let diff = (Date.now()/1000) - utcSeconds;
    return diff;
}

function ShouldPlayAlarm(alarms: IValueState[], settings?:ISettings){
    if(isUndefined(settings)){
        return false; 
    }

    return !alarms.every(x => x.diff < 1);
}

function calculateState(alarms : IDisplayMessage[]){
    return alarms.map(x =>
        {
            return {
                message:x, diff: x.time
            }
        }
    )
}

class AlarmList extends React.Component<{alarms : IDisplayMessage[], settings? : ISettings},{value: IValueState[]}> {
    interval : any;
    constructor(props : {alarms : IDisplayMessage[]}){
        super(props);
        this.state = {
            value:calculateState(props.alarms)
        }
    } 

    render() {
    if(this.state.value.length === 0){
        return(
            <div className="allClear">
                No stations requested new kits
            </div>
        )
    }
    return (
        <div>
            <PlaySound playSound={ShouldPlayAlarm(this.state.value, this.props.settings)}/>
            <List>
                {this.state.value.map(item => 
                    <List.Item key={item.message.title}>
                        <Card>
                            <Card.Header>
                                <Card.Header.Title>
                                    <div className="headerTitle" style={{ fontSize:'33px'}}>
                                        <div className="msgTitle">{item.message.title} has requested for new kits.</div>
                                        <div className="msgTime">Time Elasped: <time
                                        dateTime={ToTimeFormat(item.diff)}>{ToTimeFormat(item.diff)}</time></div>
                                    </div>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content>
                                    <Progress value={item.diff} min={0} max={isUndefined(this.props.settings)? 30 : this.props.settings.MaxWaitTime} color={calculateColor(item.diff, this.props.settings)}/>
                                </Content>
                            </Card.Content>
                        </Card>
                    </List.Item>
                )}
            </List>
        </div>
    )}
}

export default AlarmList
