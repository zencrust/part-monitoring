import React from 'react'
import { List, Progress } from 'antd';
import { number } from 'prop-types';
import { max, min } from 'moment';

export interface alarmType{
    title: string,
    time: string
};

function calculate(time: number){
    let r = 0;
    let g = 100;
    let b = 20;
    let c = 500;
    r = Math.min((time/c), 1) * 255;
    g = Math.max(0, 1- (time/c)) * 255;
    return `rgb(${r}, ${g}, ${b})`;
}

function percentage(time: number){
    let c = 500;
    return Math.min((time/c), 1) * 100;
}

const AlarmList = (props: {data: alarmType[]}) => {
    return (
        <div>
            <List dataSource={props.data} itemLayout="horizontal"
                renderItem={item => (
                    <List.Item style={{ background: calculate(Number(item.time)), margin: '2px 3px', padding: '5px' }}>
                        <List.Item.Meta
                            title={<div>{item.title}</div>}
                            description={
                            <div>
                                <div>{item.time} seconds elasped</div>
                                <Progress percent={percentage(Number(item.time))} showInfo={false} status="active" />    
                            </div>
                            }
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default AlarmList
