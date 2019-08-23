import React from 'react';
import './styles.scss';

import AlarmList from '../Alarm/index';
import { Footer, Content, Message, Navbar } from 'rbx';
import MqttManager, { ServerStatus, IDisplayMessage, ISettings, IStationStatus } from '../../MqttManager';
import ReportLayout from '../Report';
import { Route, Switch, BrowserRouter, Link } from 'react-router-dom';
import { NotFound } from '../404';
import StationStatus from '../Status';

interface IState {
  collapsed: boolean,
  content: string,
  alarms: IDisplayMessage[],
  status: ServerStatus,
  settings?: ISettings,
  stationStatus: IStationStatus[]
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
      alarms: [],
      status: { color: "info", message: "Initializing" },
      settings: undefined,
      stationStatus: []
    };
  }

  componentDidMount() {
    this.mqtt_sub = MqttManager((val: ServerStatus) => {
      this.setState({ status: val });
    },
      (val: IDisplayMessage[]) => {
        this.setState({ alarms: val });
        //console.log(val);
      },
      (val: ISettings) => {
        this.setState({ settings: val });
      },
      (val: IStationStatus[]) => {
        this.setState({ stationStatus: val });
      })
  }

  componentWillUnmount() {
    // this.mqtt_sub();
  }

  render() {
    let MainComponent = () => {
      return (
        <AlarmList alarms={this.state.alarms} settings={this.state.settings} />
      )
    };

    let StatusComponent = () => {
      return (
        <StationStatus status={this.state.stationStatus} />
      )
    }

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
              <Route exact path="/" component={MainComponent} />
              <Route path="/report" component={ReportLayout} />
              <Route path="/status" component={StatusComponent} />
              <Route component={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Smart Dashboard 2019</Footer>
        </BrowserRouter>
      </div>
    );
  }
}
