import React from 'react'
import { List, Progress } from 'antd';
import PlaySound from '../PlaySound/index';
import { Row, Col } from 'antd';
import { IDisplayMessage } from '../../MqttManager';


let timeout = 30;

interface IValueState {
    message:IDisplayMessage;
    diff:number;
}

function calculateColor(time: number){
    let g = 20;
    let r = Math.min((time/timeout), 1) * 255;
    let b = Math.max(0, 1- (time/timeout)) * 255;
    return `rgb(${r}, ${g}, ${b})`;
}

function appendzero(num: number){
    if(num >= 10){
        return num.toString();
    }

    return "0"+ num.toString();
}

function ToTimeFormat(diff: number) {
    let hours   = Math.floor(diff / 3600);
    let minutes = Math.floor((diff - (hours * 3600)) / 60);
    let seconds = Math.floor(diff - (hours * 3600) - (minutes * 60));
    
    return appendzero(hours) +':' + appendzero(minutes) +':'+ appendzero(seconds);
}

function timeDiff(utcSeconds: number){
    let diff = (Date.now()/1000) - utcSeconds;
    return diff;
}

function ShouldPlayAlarm(alarms: IValueState[]){
    return !alarms.every(x => x.diff < timeout);
}

let percentage = (time: number) => {
    return Math.min((time/timeout), 1) * 100;
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
            <List dataSource={this.state.value} itemLayout="horizontal" 
                renderItem={item => (
                    <List.Item style={{ background: calculateColor(item.diff), margin: '2px 3px', padding: '5px', minHeight:'100px', marginBottom:'10px'}}>
                        <List.Item.Meta
                            title={                               
                            <div>
                                <Row >
                                    <Col span={18} push={6}>
                                        <div style={{ fontSize:'33px', color:'white', textAlign:'center', marginBottom:'20px'}}>{item.message.title}</div>
                                        <Progress percent={percentage(Number(item.diff))} showInfo={false} status="active" strokeWidth={20} />
                                    </Col>
                                    <Col span={6} pull={18}>
                                        <div style={{ color:'white',  verticalAlign:'center', alignContent:'center', textAlign:'center'}}>
                                            <div style={{ fontSize:'20px', marginBottom:'20px'}}>Time elasped</div>
                                            <div style={{ fontSize:'40px'}}>{ToTimeFormat(item.diff)}</div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>}
                        />
                    </List.Item>
                )}
            />
        </div>
    )}
}

export default AlarmList
