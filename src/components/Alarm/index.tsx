import {Card, Content, List, Progress} from "rbx";
import React from "react";
import {ISettings, StationData} from "../../MqttManager";
import {StationStatusType} from '../MainLayout'
import {isstring, ToTimeFormat} from "../../Utils";
import PlaySound from "../PlaySound/index";
import "./styles.scss";

function calculateColor(time: number, settings?: ISettings) {
    if (settings === undefined) {
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

function RecordToArray(alarms: StationStatusType) {
    const data: StationData[] = [];
    alarms.forEach((v) => {
        if (v.IsActive && v.SlaLevel < 2) {
            v.timeElapsed = Math.abs(new Date().getTime() - new Date(v.InitiateTime).getTime()) / 1000;
            data.push(v);
        }
    });

    data.sort((a, b) => b.timeElapsed - a.timeElapsed);
    return data;
}

function AlarmList(props: {alarms: StationStatusType, settings?: ISettings}) {
    const val = RecordToArray(props.alarms);
    let loc = localStorage.getItem("SelectedLocations");
    let noActiveAndOn = "No eAndons currently active";
    if (isstring(loc) && loc !== "") {
        noActiveAndOn += ` for ${loc}`
    }
    if (val.length === 0) {
        return (
            <div className="allClear">
                {noActiveAndOn}
            </div>
        );
    }
    return (
        <div>
            <PlaySound playSound={true}/>
            <List className="alarmHead">
                {val.map((item) =>
                    <List.Item key={item.AlertId}>
                        <Card className="alarmCard">
                            <Card.Header>
                                <Card.Header.Title>
                                    <div className="headerTitle">
                                        <div className="msgTitle">{item.Location}</div>
                                    </div>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content className="alarmContent">
                                    <Progress value={item.timeElapsed} min={0}
                                              max={props.settings === undefined ? 60 : props.settings.MaxWaitTime}
                                              color={calculateColor(item.timeElapsed, props.settings)}/>
                                    <div>Initiated By: <span>{item.InitiatedBy}</span></div>
                                    <div>Alert Type: <span>{item.AlertType}</span></div>
                                    <div>Alert: <span>{item.Alert}</span></div>
                                    {/*<div>Time Elapsed: <time dateTime={ToTimeFormat(item.time)}>{ToTimeFormat(item.timeElapsed)}</time></div>*/}
                                    <div className="msgTime">Time Elapsed: <time
                                        dateTime={ToTimeFormat(item.timeElapsed)}>{ToTimeFormat(item.timeElapsed)}</time>
                                    </div>

                                </Content>
                            </Card.Content>
                        </Card>
                    </List.Item>,
                )}
            </List>
        </div>
    );
}

export default AlarmList;
