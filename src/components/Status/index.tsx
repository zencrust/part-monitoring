import { Card, Content } from "rbx";
import React from "react";
import { isUndefined } from "util";
import { IStationStatus, StationStatusType } from "../MainLayout";
import WifiIndicator, { WiFiSignalIndicator } from "../WifiIndicator";
import "./styles.scss";

function getDateTimeString(epochTime: number | undefined) {
    if (isUndefined(epochTime)) {
        return "never";
    }

    const date = new Date(0);
    date.setUTCSeconds(epochTime);
    return date.toLocaleString();
}

function calculateWifiSignal(isAlive: boolean, v: number): WiFiSignalIndicator {
    if (!isAlive) {
        return "DISCONNECTED";
    }
    if (v > 80) {
        return "EXCELLENT";
    }

    if (v > 65) {
        return "GREAT";
    }

    if (v > 40) {
        return "OKAY";
    }

    if (v > 25) {
        return "WEAK";
    }

    return "UNUSABLE";
}

interface Props extends React.ComponentPropsWithoutRef<"div"> {
    status: StationStatusType;
}

function RecordToArray(alarms: StationStatusType) {
    const retval: IStationStatus[] = [];
    alarms.forEach( (val, k) => {
        retval.push(val);
    });

    return retval;
}

function StationStatus(props: Props) {
    const val = RecordToArray(props.status);
    return(
    <div className="statushead">
        {val.map((item) =>
            <Card key={item.name} className="statusCard">
                <Card.Header>
                    <Card.Header.Title>
                        <div className="headerTitle">
                            <p className="statusTitle">{item.name}</p>
                            <WifiIndicator className="statusConected" strength={calculateWifiSignal(item.isConnected, item.wifiStrength)} />
                        </div>
                    </Card.Header.Title>
                </Card.Header>
                <Card.Content>
                    <Content>
                        <div>
                            <div>Last Seen:{getDateTimeString(item.lastUpdateTime)}</div>
                        </div>
                    </Content>
                </Card.Content>
            </Card>,
        )}
    </div>
    );
}

export default StationStatus;
