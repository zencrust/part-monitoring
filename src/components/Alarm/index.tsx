import {Card, Content, List, Progress} from "rbx";
import React from "react";
import {isstring, ToTimeFormat} from "../../Utils";
import PlaySound from "../PlaySound/index";
import "./styles.scss";
import {ISettings, StationData, StationStatusType} from "../../types";

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

function getGroupName(settings: ISettings, location: string) {
    const ret = settings.groups.find((x) => {
        return x.locations.includes(location);
    });

    if (ret === undefined) {
        return undefined;
    }

    return ret.groupName;
}

function RecordToArray(alarms: StationStatusType, slaSelection: number, groups: string[], settings: ISettings) {
    const data = new Map<string, StationData[]>();
    let count = 0;
    alarms.forEach((v) => {
        if (v.IsActive && v.SlaLevel >= slaSelection) {
            let groupName = getGroupName(settings, v.Location) || "Misc";
            if (groups.length === 0 || (groupName !== undefined && groups.includes(groupName))) {
                v.timeElapsed = Math.abs(new Date().getTime() - new Date(v.InitiateTime).getTime()) / 1000;
                let groupArray: StationData[] | undefined = data.get(groupName);
                if (groupArray === undefined) {
                    groupArray = []
                }

                groupArray.push(v);
                count += 1;
                data.set(groupName, groupArray);
            }
        }
    });

    data.forEach((v, k) => v.sort((a, b) => b.timeElapsed - a.timeElapsed));
    return [data, count];
}

function AlarmList(props: { alarms: StationStatusType, settings: ISettings, slaSelection: number, locations: string[] }) {
    const [dataMap, count] = RecordToArray(props.alarms, props.slaSelection, props.locations, props.settings);
    const dataArray = Array.from(dataMap as Map<string, StationData[]>);

    let loc = localStorage.getItem("SelectedLocations");
    let noActiveAndOn = "No eAndons currently active for";
    if (props.slaSelection === 3) {
        noActiveAndOn += " any SLAs"
    } else {
        noActiveAndOn += ` SLA${props.slaSelection}`;
    }
    if (isstring(loc) && loc !== "") {
        noActiveAndOn += ` and ${loc}`
    }
    if (count === 0) {
        return (
            <div className="allClear">
                {noActiveAndOn}
            </div>
        );
    }
    return (
        <div>
            <PlaySound playSound={true}/>
            {dataArray.map((groups) =>
                <div>
                    <List className="alarmHead" key={groups[0]}>
                        <h2 className="groupTitle">
                            <span>{groups[0]}</span>
                        </h2>
                        {groups[1].map((item) =>
                            <List.Item key={item.AlertId}>
                                <Card className="alarmCard">
                                    <Card.Header>
                                        <Card.Header.Title>
                                            <div className="headerTitle">
                                                <div className="msgTitle">
                                                    <span>{item.Location} SLA: <span>{item.SlaLevel}</span></span>
                                                </div>
                                            </div>
                                        </Card.Header.Title>
                                    </Card.Header>
                                    <Card.Content>
                                        <Content className="alarmContent">
                                            <Progress value={item.timeElapsed} min={0}
                                                      max={props.settings.MaxWaitTime}
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
                </div>)}
        </div>
    );
}

export default AlarmList;
