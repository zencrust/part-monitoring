import {Card, Content, List, Progress} from "rbx";
import React, { FC } from "react";
import { ISettings } from "../../MqttManager";
import { ToTimeFormat } from "../../Utils/index";
import {IStationStatus, StationStatusType} from "../MainLayout";
import PlaySound from "../PlaySound/index";
import "./styles.scss";

function calculateColor(time: number, settings: ISettings) {
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
    const retval: IStationStatus[] = [];
    alarms.forEach((v, k) => {
        if (v.isConnected && v.time > 0) {
            retval.push(v);
        }
    });

    retval.sort((a, b) => b.time - a.time);
    return retval;
}

interface AlarmProps {
    alarms: StationStatusType;
    settings: ISettings;
};

const AlarmList: FC<AlarmProps> = ({ alarms, settings }) => {

    const val = RecordToArray(alarms);
    if (val.length === 0) {
        return(
            <div className="allClear">
                No stations requested new kits
            </div>
        );
    }
    return (
        <div>
            <PlaySound playSound={true}/>
            <List>
                {val.map((item) =>
                    <List.Item key={item.name}>
                        <Card>
                            <Card.Header>
                                <Card.Header.Title>
                                    <div className="headerTitle" style={{ fontSize: "33px"}}>
                                        <div className="msgTitle">{item.name} has requested for new kits.</div>
                                        <div className="msgTime">Time Elasped: <time
                                        dateTime={ToTimeFormat(item.time)}>{ToTimeFormat(item.time)}</time></div>
                                    </div>
                                </Card.Header.Title>
                            </Card.Header>
                            <Card.Content>
                                <Content>
                                    <Progress value={item.time} min={0} max={settings.MaxWaitTime} color={calculateColor(item.time, settings)}/>
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
