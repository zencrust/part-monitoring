import React from 'react'
import { List } from 'antd';

export interface alarmType{
    title: string,
    time: string
};

const AlarmList = (props: {data: alarmType[]}) => {
    return (
        <div>
            <List dataSource={props.data} itemLayout="horizontal"
                renderItem={item => (
                    <List.Item style={{ background: "orange", margin: '2px 3px', padding: '5px' }}>
                        <List.Item.Meta
                            title={<div>{item.title}</div>}
                            description={<div>{item.time} seconds elasped</div>}
                        />
                    </List.Item>
                )}
            />
        </div>
    )
}

export default AlarmList
