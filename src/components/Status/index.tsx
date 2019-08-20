import React, { FunctionComponent } from 'react';
import { IStationStatus } from '../../MqttManager';
import { Card, Content } from 'rbx';
import "./styles.scss";
import WifiIndicator, { WiFiSignalIndicator } from '../WifiIndicator';

function getDateTimeString(epochTime:number){
    let date = new Date(0);
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

let StationStatus: FunctionComponent<{ status: IStationStatus[] }> = ({status}) => {
    return(
    <div className="statushead">
        {status.map(item =>
            <Card key={item.name} className="card">
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
            </Card>
        )}
    </div>
    );
}

export default StationStatus;