import {Card, Content, List, Progress} from "rbx";
import React from "react";
import {isUndefined} from "util";
import {ISettings, StationData} from "../../MqttManager";
import {StationStatusType, IStationStatus} from '../MainLayout'
import {ToTimeFormat} from "../../Utils/index";
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

interface StationDataTime extends StationData {
    timeElasped: number;
}

function RecordToArray(alarms: StationStatusType) {
    const retval: StationData[] = [];
    alarms.forEach((v, k) => {
        if (v.IsActive && v.SlaLevel < 2) {
            v.timeElasped = Math.abs(new Date().getTime() - new Date(v.InitiateTime).getTime()) / 1000;
            retval.push(v);
        }
    });

    retval.sort((a, b) => b.timeElasped - a.timeElasped);
    return retval;
}

function AlarmList(props: {alarms: StationStatusType, settings?: ISettings}) {
    const val = RecordToArray(props.alarms);
    if (val.length === 0) {
        return (
            <div className="allClear">
                No eAndons currently active
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
                                    <Progress value={item.timeElasped} min={0}
                                              max={isUndefined(props.settings) ? 60 : props.settings.MaxWaitTime}
                                              color={calculateColor(item.timeElasped, props.settings)}/>
                                    <div>Initiated By: <span>{item.InitiatedBy}</span></div>
                                    <div>Alert Type: <span>{item.AlertType}</span></div>
                                    <div>Alert: <span>{item.Alert}</span></div>
                                    {/*<div>Time Elapsed: <time dateTime={ToTimeFormat(item.time)}>{ToTimeFormat(item.timeElasped)}</time></div>*/}
                                    <div className="msgTime">Time Elapsed: <time
                                        dateTime={ToTimeFormat(item.timeElasped)}>{ToTimeFormat(item.timeElasped)}</time>
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
