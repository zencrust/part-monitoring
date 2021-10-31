import update from "immutability-helper"; // ES6
import { useState, useEffect } from "react";
import "./styles.scss";
import { Content, Footer, Message, Navbar } from "rbx";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import MqttManager, { ISettings, IValueType, ServerStatus } from "../../MqttManager";
import { NotFound } from "../404";
import AlarmList from "../Alarm/index";
import ReportLayout from "../Report";
import StationStatus from "../Status";
import mqtt from "mqtt";

export type StationStatusType = Map<string, IStationStatus>;

export interface IStationStatus {
  time: number;
  name: string;
  lastUpdateTime?: number;
  wifiStrength: number;
  isConnected: boolean;
}

function CreateDefaultStationStatus(stationName: string, value: IValueType): IStationStatus {
  const v: IStationStatus =  {
    time: 0,
    name: stationName,
    lastUpdateTime: undefined,
    wifiStrength: 0,
    isConnected: true,
  };

  if (value.updateType === "IsConnected") {
      v.isConnected = value.value;
  } else if (value.updateType === "lastUpdateTime") {
      v.lastUpdateTime = value.value;
  } else if (value.updateType === "wifiStrength") {
      v.wifiStrength = value.value;
  } else if (value.updateType === "time") {
      v.time = value.value;
      v.isConnected = true;
  }

  return v;
}

const MainLayout = (props: any) => {
  const [status, setStatus] = useState<ServerStatus>({ color: "info", message: "Initializing" });
  const [stationStatus, setStationStatus] = useState<StationStatusType>(new Map());
  const [settings, setSettings] = useState<ISettings | undefined>(undefined);

  useEffect(() => {
  var client: mqtt.Client | undefined = undefined;

  MqttManager(setStatus,
    (stationName: string, value: IValueType) => {
      const stationUpdate = (status: StationStatusType) =>
      {
        let v = status.get(stationName);
        if (v === undefined) {
          return update(status, { [stationName] : { $set: CreateDefaultStationStatus(stationName, value) }})
        }
    
        const updatedVal = 
        value.updateType === "IsConnected" ? update(v, {$merge: {isConnected: value.value}}):
        value.updateType === "lastUpdateTime"? update(v, {$merge: {lastUpdateTime: value.value}}):
        value.updateType === "wifiStrength"? update(v, {$merge: {wifiStrength: value.value}}):
        value.updateType === "time"?update(v, {$merge: {time: value.value, isConnected: true}}):
        undefined;
    
        if(updatedVal !== undefined){
          return update(status, { [stationName] : { $set: updatedVal }});
        }

        return status;
      };

      setStationStatus(stationUpdate);
    }).then((val) =>
    {
      setSettings(val.settings);
      client = val.client;
    });

    return function cleanup()
    {
      if(client !== undefined){
        client.end(true);
      }
    };
  }, []);

  if(settings === undefined){
    return <div>"Loading"</div>;
  }

  return (
    <div>
    <BrowserRouter>
      <Navbar color="info">
        <Navbar.Brand>
          <Navbar.Item href="#">
            <div className="title-header">
              Kit Request Dashboard
            </div>
          </Navbar.Item>
        </Navbar.Brand>
        <Navbar.Menu>
          <Navbar.Segment align="start">
            <Link className="navbar-item" to={`/`}>Home</Link>
            <Link className="navbar-item" to={`/report`}>Report</Link>
            <Link className="navbar-item" to={`/status`}>Status</Link>
          </Navbar.Segment>
        </Navbar.Menu>
        <Navbar.Brand>
            <img src="assets/images/gelogo.png" width="50" height="10" alt="gelogo"/>
            <h3 className="brand-header">
                  X-Ray
            </h3>
        </Navbar.Brand>
        <Message color={status.color} className="Alert-banner">
              <Message.Header>
                {status.message}
              </Message.Header>
        </Message>
        {/* <h3>GE X-ray</h3> */}
        {/* <img src="assets/images/gelogo.png" width="65" height="20"/> */}
      </Navbar>

      <Content className="main-container">
        <Switch>
          <Route exact path="/" render={ (props) => <AlarmList alarms={stationStatus} settings={settings} {...props}/>} />
          <Route path="/report" component={ReportLayout} />
          <Route path="/status" render={ (props) => <StationStatus status={stationStatus} {...props}/> } />
          <Route component={NotFound} />
        </Switch>
      </Content>
      <Footer style={{ textAlign: "center" }}>Smart Dashboard 2021</Footer>
    </BrowserRouter>
  </div>);
};

export default MainLayout;
