import update from "immutability-helper"; // ES6
import React, { useState } from 'react';
import "./styles.scss";

import { Content, Footer, Message, Navbar } from "rbx";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import MqttManager, { ISettings, StationData, ServerStatus } from "../../MqttManager";
import { NotFound } from "../404";
import AlarmList from "../Alarm/index";
import ReportLayout from "../Report";
export type IStationStatus = StationData;

export type StationStatusType = Map<string, IStationStatus>;

interface IState {
  collapsed: boolean;
  content: string;
  status: ServerStatus;
  settings?: ISettings;
  stationData: StationStatusType;
}

export function MainLayoutF(){
  const [status, setStatus] = useState<ServerStatus>({color:"info", message:"initializing"});
  const [settings, setSettings] = useState<ISettings?>(null);
  const [stationData, setStationData] = useState({});

  const mqttSub = MqttManager((val: ServerStatus) => {
    setStatus(val);
  },
  (data: StationData) => {
    setStationData(
      update(stationStatus, { [data.] : { $set: data }}));
  });
  let disconnect: VoidFunction? = null;
  mqttSub.then((x) => {
    setSettings(x.settings);
    disconnect = x.disconnect;
  });

    return (
      <div>
        <BrowserRouter>
          <Navbar color="info">
            <Navbar.Brand>
                  Kit Request Dashboard
              <Navbar.Item href="#">
                <div className="title-header">
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
                <img src="assets/images/gelogo.png" width="50" height="10"/>
                <h3 className="brand-header">
                      X-Ray
                </h3>
            </Navbar.Brand>
            <Message color={this.state.status.color} className="Alert-banner">
                  <Message.Header>
                    {this.state.status.message}
                  </Message.Header>
            </Message>
            {/* <h3>GE X-ray</h3> */}
            {/* <img src="assets/images/gelogo.png" width="65" height="20"/> */}
          </Navbar>

          <Content className="main-container">

            <Switch>
              <Route exact path="/" render={ (props) => <AlarmList alarms={this.state.stationStatus} settings={this.state.settings} />} />
              <Route path="/report" component={ReportLayout} />
              <Route path="/status" render={ (props) => <StationStatus status={this.state.stationStatus} /> } />
              <Route component={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: "center" }}>Smart Dashboard 2019</Footer>
        </BrowserRouter>
      </div>
    );
}