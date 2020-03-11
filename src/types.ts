export interface ServerStatus {
    message: string;
    color: "info" | "success" | "warning" | "link" | "black" | "white" | "primary" | "danger" | "light" | "dark" | undefined;
}

export interface StationData {
    AlertId: string;
    Alert: string;
    AlertType: string;
    Location: string;
    InitiatedBy: string;
    AcknowledgeBy: string;
    ResolvedBy: string;
    InitiateTime: string;
    IsActive: boolean;
    AcknowledgeTime: string;
    ResolvedTime: string;
    SlaLevel: number;
    timeElapsed: number;
}

export type IValueFuntionType = (stationData: StationData) => void;

export interface LocationGroup {
    groupName: string;
    locations: string[];
}

export interface ISettings {
    mqtt_server: string;
    user_name?: string;
    protocol: "wss" | "ws" | "mqtt" | "mqtts" | "tcp" | "ssl" | "wx" | "wxs";
    password?: string;
    port: number;
    MaxWaitTime: number;
    groups: LocationGroup[];
}

export type IStationStatus = StationData;
export type StationStatusType = Map<string, IStationStatus>;