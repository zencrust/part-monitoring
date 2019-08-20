import React from 'react'
import {List, Card, Content, Progress} from 'rbx';
import PlaySound from '../PlaySound/index';
import { IDisplayMessage } from '../../MqttManager';
import { ToTimeFormat } from '../../Utils/index'
import "./styles.scss";


let timeout = 30;

interface IValueState {
    message:IDisplayMessage;
    diff:number;
}

function calculateColor(time: number){
    let t = time/timeout;
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

function ShouldPlayAlarm(alarms: IValueState[]){
    return !alarms.every(x => x.diff < timeout);
}

function calculateState(alarms : IDisplayMessage[]){
    return alarms.map(x =>
        {
            return {
                message:x, diff: timeDiff(x.time)
            }
        }
    )
}

class AlarmList extends React.Component<{alarms : IDisplayMessage[]},{value: IValueState[]}> {
    interval : any;
    constructor(props : {alarms : IDisplayMessage[]}){
        super(props);
        this.state = {
            value:calculateState(props.alarms)
        }
    } 

    tick() {
        let c = calculateState(this.props.alarms);
        if(this.state.value.length === 0 &&  c.length === 0) {
            return;
        }
        this.setState({
            value: c            
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
    return (
        <div>
            <PlaySound playSound={ShouldPlayAlarm(this.state.value)}/>
            <List>
                {this.state.value.map(item => 
                    <List.Item key={item.message.title}>
                        <Card>
                            <Card.Header>
                                <Card.Header.Title>
                                    {/* <div style={{ background: calculateColor(item.diff) }}> */}
                                        <div className="headerTitle" style={{ fontSize:'33px'}}>
                                            <div className="msgTitle">{item.message.title} has requested for new kits.</div>
                                            <div className="msgTime">Time Elasped: <time
                                            dateTime={ToTimeFormat(item.diff)}>{ToTimeFormat(item.diff)}</time></div>
                                        </div>
                                    {/* </div> */}
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content>
                                    <Progress value={item.diff} min={0} max={timeout} color={calculateColor(item.diff)}/>
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
