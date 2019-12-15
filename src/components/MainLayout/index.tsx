import update from "immutability-helper"; // ES6
import React from "react";
import "./styles.scss";

import { Content, Footer, Message, Navbar } from "rbx";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { isUndefined } from "util";
import MqttManager, { ISettings, IValueType, ServerStatus } from "../../MqttManager";
import { NotFound } from "../404";
import AlarmList from "../Alarm/index";
import ReportLayout from "../Report";
import StationStatus from "../Status";

export type StationStatusType = Map<string, IStationStatus>;

interface IState {
  collapsed: boolean;
  content: string;
  status: ServerStatus;
  settings?: ISettings;
  stationStatus: StationStatusType;
}

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

export default class MainLayout extends React.Component<any, IState> {
  public disconnect: VoidFunction | undefined;
  /**
   *
   */
  constructor(props: any) {
    super(props);
    this.state = {
      collapsed: false,
      content: "1",
      status: { color: "info", message: "Initializing" },
      settings: undefined,
      stationStatus: new Map(),
    };
  }

  public componentDidMount() {
    const mqtt_sub = MqttManager((val: ServerStatus) => {
      this.setState({ status: val });
    },
      (stationName: string, value: IValueType) => {
        let v = this.state.stationStatus.get(stationName);

        if (v === undefined) {
          v = CreateDefaultStationStatus(stationName, value);
          this.setState({
            stationStatus: update(this.state.stationStatus, { [stationName] : { $set: v }}),
          });
        }

        if (value.updateType === "IsConnected") {
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set:
                update(v, {$merge: {isConnected: value.value}}),
            }})});
        } else if (value.updateType === "lastUpdateTime") {
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set:
                update(v, {$merge: {lastUpdateTime: value.value}}),
            }})});
        } else if (value.updateType === "wifiStrength") {
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set:
                update(v, {$merge: {wifiStrength: value.value}}),
            }})});
        } else if (value.updateType === "time") {
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set:
                update(v, {$merge: {time: value.value, isConnected: true}}),
            }})});
        }
      });

    mqtt_sub.then((x) => {
        this.setState({ settings: x.settings });
        this.disconnect = x.disconnect;
      });
  }

  public componentWillUnmount() {
    if (!isUndefined(this.disconnect)) {
      this.disconnect();
    }
  }

  public render() {
    return (
      <div>
        <BrowserRouter>
          <Navbar color="info">
            <Navbar.Brand>
                {/*  */}
                <h2 className="title-header">
                      Kit Tracker
                </h2>
                <Navbar.Burger />
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
                <Navbar.Burger />
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
}
