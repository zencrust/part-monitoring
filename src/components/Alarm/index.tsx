import {Card, Content, List, Progress} from "rbx";
import React from "react";
import { isUndefined } from "util";
import { ISettings } from "../../MqttManager";
import { ToTimeFormat } from "../../Utils/index";
import { StationStatusType } from "../MainLayout";
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

function CreateTile({}){

}

function AlarmList(props: {alarms: StationStatusType, settings?: ISettings}) {
    // const val = RecordToArray(props.alarms);
    if (StationStatusType.length === 0) {
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
                                    <Progress value={item.time} min={0} max={isUndefined(props.settings) ? 30 : props.settings.MaxWaitTime} color={calculateColor(item.time, props.settings)}/>
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
