import React from 'react';
import './styles.scss';
import update from 'immutability-helper'; // ES6

import AlarmList from '../Alarm/index';
import { Footer, Content, Message, Navbar } from 'rbx';
import MqttManager, { ServerStatus, ISettings, IUpdateType, ValueType } from '../../MqttManager';
import ReportLayout from '../Report';
import { Route, Switch, BrowserRouter, Link } from 'react-router-dom';
import { NotFound } from '../404';
import StationStatus from '../Status';
import { isBoolean,isNumber, isUndefined } from 'util';
import PlaySound from '../PlaySound/index';


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

function CreateDefaultStationStatus(stationName: string, updateType: IUpdateType, value: ValueType): IStationStatus{
  let v: IStationStatus =  {
    time: 0,
    name: stationName,
    lastUpdateTime: undefined,
    wifiStrength:0,
    isConnected: true,
  };

  if(updateType === "IsConnected"){
    if(isBoolean(value)){
      v.isConnected = value;
    }
  } else if(updateType === "lastUpdateTime"){
    if(isNumber(value)){
      v.lastUpdateTime = value;
    }
  } else if(updateType === "wifiStrength"){
    if(isNumber(value)){
      v.wifiStrength = value;
    }
  } else if(updateType === "time"){
    if(isNumber(value)){
      v.time = value;
      v.isConnected = true;
    }
  }

  return v;
}

function ShouldPlayAlarm(alarms: StationStatusType, settings?:ISettings){
  if(isUndefined(settings)){
      return false; 
  }

  let retval = false;
  alarms.forEach((v, k) => {
    if(v.isConnected && v.time > 0){
      retval = true;
      return true;
    }
  })

  return retval;
}

export default class MainLayout extends React.Component<any, IState> {
  mqtt_sub: any;
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

  componentDidMount() {
    this.mqtt_sub = MqttManager((val: ServerStatus) => {
      this.setState({ status: val });
    },
      (stationName: string, updateType: IUpdateType, value: ValueType) => {
        let v = this.state.stationStatus.get(stationName);

        if(v === undefined){
          v = CreateDefaultStationStatus(stationName, updateType, value);
          this.setState({
            stationStatus: update(this.state.stationStatus, { [stationName] : { $set: v }})
          });
        }

        if(updateType === "IsConnected"){
          if(isBoolean(value)){
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set: 
                update(v, {$merge:{isConnected: value}})
            }})});
          } 
        } 
        else if(updateType === "lastUpdateTime"){
          if(isNumber(value)){
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set: 
                update(v, {$merge:{lastUpdateTime: value}})
            }})});          
          }
        } else if(updateType === "wifiStrength"){
          if(isNumber(value)){
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set: 
                update(v, {$merge:{wifiStrength: value}})
            }})});
          }
        } else if(updateType === "time"){
          if(isNumber(value)){
            this.setState({
              stationStatus: update(this.state.stationStatus, { [stationName] : { $set: 
                update(v, {$merge:{time: value, isConnected: true}})
            }})});
          }
        }

        // this.setState({ alarms: val });
        //console.log(val);
      },
      (val: ISettings) => {
        this.setState({ settings: val });
      });
  }

  componentWillUnmount() {
    // this.mqtt_sub();
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <Navbar color="info">
            <Navbar.Brand>
              <Navbar.Item href="#">
                <div className="title-header">
                  Smart Dashboard
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
          </Navbar>
          <Content className="main-container">
            <Message color={this.state.status.color} className="Alert-banner">
              <Message.Header>
                {this.state.status.message}
              </Message.Header>
            </Message>
            <Switch>
              <Route exact path="/" render={ props => <AlarmList alarms={this.state.stationStatus} settings={this.state.settings} />} />
              <Route path="/report" component={ReportLayout} />
              <Route path="/status" render={ props => <StationStatus status={this.state.stationStatus} /> } />
              <Route component={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Smart Dashboard 2019</Footer>
        </BrowserRouter>
      </div>
    );
  }
}
