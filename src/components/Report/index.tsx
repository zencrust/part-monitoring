import React, { useState, useEffect } from 'react'
import { Card, List, Content } from 'rbx';
import { ToTimeFormat,ToDateTimeFormat } from '../../Utils/index'
import axios, { AxiosRequestConfig } from 'axios'
import "./styles.scss";
import { isUndefined } from 'util';


export interface ILog {
    id: number;
    name: string;
    start_time: string;
    duration: number;
    comments: string;
}

interface IState {
    logs: ILog[] | undefined;
    limit: number;
    offset: number;
    error: boolean;
}
export interface Props extends React.ComponentPropsWithoutRef<'div'>
{ }

let ReportLayout: React.FC<Props> = p => {
        const [logs, setLogs] = useState<ILog[] | undefined>(undefined);
        const [limit] = useState(100);
        const [offset] = useState(0);
        const [error, setError] = useState(false);
           
        useEffect(() =>
        {
            let uri = '/api/v1/getreport';
            let req: AxiosRequestConfig = {
                params: {
                    limit: limit,
                    offset: offset
                }
            };
            axios.get<ILog[]>(uri, req)
            .then(logs => {
                if(logs.headers["content-type"] !== "text/plain; charset=utf-8"){
                    setError(true);
                } else {
                    setLogs(logs.data);
                    setError(false);
                }
            })
            .catch(err => {
                setError(true);
            });
        }, [limit, offset]);
    
    if(error){
        return(
            <div className="errorText">
                Error occcured while fetching records. Try refreshing the page to retry
            </div>
        );
    }

    if(isUndefined(logs)){
        return(
            <div className="errorText">
                Please wait while fetching logs...
            </div>
        );
    }

    if(logs.length === 0){
        return(
            <div className="errorText">
                No logs found
            </div>
        );
    }

    return (
        <div>
            <List>
                {logs.map(item =>
                    <List.Item key={item.name + item.start_time}>
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
                                <div style={{ fontSize: '18px' }}>{item.name} was waiting for a duation of { ToTimeFormat(item.duration)}                                    
                                </div>
                            </Content>
                        </Card.Content>
                        </Card>
                    </List.Item>
                )}
            </List>                      
        </div>
    )
}

export default ReportLayout;