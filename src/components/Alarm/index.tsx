import {Card, Content, List, Progress, Notification} from "rbx";
import React from "react";
import { isUndefined } from "util";
import { ISettings } from "../../MqttManager";
import { ToTimeFormat } from "../../Utils/index";
import {IStationStatus, StationStatusType} from "../MainLayout";
import PlaySound from "../PlaySound/index";
import "./styles.scss";

function calculateColor(time: number, settings?: ISettings) {
    if (isUndefined(settings)) {
        return "warning";
    }

    const t = time / settings.MaxWaitTime;
    if (t < 0.5) {
        return "success";
    }
    if (t < 1) {
        return "warning";
    }

    return "danger";
}

export interface ICurrentStatus {
    time: number;
    name: string;
}

function RecordToArray(alarms: StationStatusType, getTime: (val :IStationStatus) => number) {
    const retval: ICurrentStatus[] = [];
    alarms.forEach((v, k) => {
        if (v.isConnected && getTime(v) > 0) {
            retval.push({time:getTime(v), name:v.name});
        }
    });

    retval.sort((a, b) => b.time - a.time);
    return retval;
}

function AlarmListCard(props: {val: ICurrentStatus[], settings?: ISettings, message:string}){
    if(props.val.length === 0){
        return(
            <div className="allClear">
                No stations {props.message}
            </div>
        );
    }
    return(
        <List>
            {props.val.map((item) =>
                <List.Item key={item.name}>
                    <Card>
                        <Card.Header>
                            <Card.Header.Title>
                                <div className="headerTitle" style={{ fontSize: "33px"}}>
                                    <div className="msgTitle">{item.name}</div>
                                    <div className="msgTime">Time Elasped: <time
                                    dateTime={ToTimeFormat(item.time)}>{ToTimeFormat(item.time)}</time></div>
                                </div>
                            </Card.Header.Title>
                        </Card.Header>
                        <Card.Content>
                            <Content>
                                <Progress value={item.time} min={0} max={isUndefined(props.settings) ? 30 : props.settings.MaxWaitTime} color={calculateColor(item.time, props.settings)}/>
                            </Content>
                        </Card.Content>
                    </Card>
                </List.Item>,
            )}
        </List>
    )
}

function AlarmList(props: {alarms: StationStatusType, settings?: ISettings}) {
    const val = RecordToArray(props.alarms, (v:IStationStatus) => v.time);
    const val2 = RecordToArray(props.alarms, (v:IStationStatus) => v.time2);
    return (
        <>
            <PlaySound playSound={val.length > 0 || val2.length > 0}/>
            <div className="AlarmCardsColumn">
                <div>
                    <Notification color="warning" textAlign="centered">
                        <h4 className="AlertsectionHeader">New kit request</h4>
                    </Notification>
                    <Content>
                        <AlarmListCard val={val} settings={props.settings} message=" has requested for new kits"/>
                    </Content>
                </div>
                <div>
                    <Notification color="primary" textAlign="centered">
                        <h4 className="AlertsectionHeader">Assistance request</h4>
                    </Notification>
                    <Content>
                        <AlarmListCard val={val2} settings={props.settings} message=" has requested assistance" />
                    </Content>
                </div>
            </div>
        </>
    );
}

export default AlarmList;
