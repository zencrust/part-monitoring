import React from 'react'
import { Card, List, Content } from 'rbx';
import { ToTimeFormat,ToDateTimeFormat } from '../../Utils/index'
import axios, { AxiosRequestConfig } from 'axios'
import "./styles.scss";

export interface ILog {
    id: number;
    name: string;
    start_time: string;
    duration: number;
    comments: string;
}

interface IState {
    logs: ILog[];
    limit: number;
    offset: number;
}


export default class MainLayout extends React.Component<any, IState> {

    constructor(props: any) {
        super(props);
        this.state = {
            logs: [],
            limit: 100,
            offset: 0
        };
        let uri = '/api/v1/getreport'
        let req: AxiosRequestConfig = {
            params: {
                limit: this.state.limit,
                offset: this.state.offset
            }
        };
        axios.get<ILog[]>(uri, req)
        .then(logs => {
            this.setState({ logs: logs.data });
        });
    }

    render() {
        return (
            <div>
                <List>
                    {this.state.logs.map(item =>
                        <List.Item>
                            <Card>
                            <Card.Header>
                                <Card.Header.Title>
                                    <div className="headerTitle">
                                        <time className="reportTime" dateTime={item.start_time}>{ToDateTimeFormat(item.start_time)}</time>
                                        <p className="reportTitle">{item.name}</p>  
                                    </div>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content>
                                    <div style={{ fontSize: '18px' }}>{item.name} was waiting for a duation of : 
                                        { ToTimeFormat(item.duration)}                                    
                                    </div>
                                </Content>
                            </Card.Content>
                            </Card>
                        </List.Item>
                    )};
                </List>                      
            </div>
        )
    }
}
