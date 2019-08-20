import React from 'react';
import './styles.scss';

import AlarmList from '../Alarm/index';
import { Footer, Content, Message, Navbar } from 'rbx';
import MqttManager, { ServerStatus, IDisplayMessage } from '../../MqttManager';
import Report from '../Report';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import { NotFound } from '../404';

interface IState {
  collapsed: boolean,
  content: string,
  alarms: IDisplayMessage[],
  status: ServerStatus
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
      status: { color: "info", message: "Initializing" }
    };
  }

  componentDidMount() {
    this.mqtt_sub = MqttManager((val: ServerStatus) => {
      this.setState({ status: val });
    },
      (val: IDisplayMessage[]) => {
        this.setState({ alarms: val });
        //console.log(val);
      });
  }

  componentWillUnmount() {
    this.mqtt_sub();
  }

  render() {
    let MainComponent = () => {
      return (
        <AlarmList alarms={this.state.alarms} />
      )
    };

    return (
      <div>
        <Navbar color="dark">
          <Navbar.Brand>
            <Navbar.Item href="#">
              <div className="title-header">
                Smart Dashboard
                </div>
            </Navbar.Item>
          </Navbar.Brand>
          <Navbar.Menu>
            <Navbar.Segment align="end">
              <Navbar.Item href="/">Home</Navbar.Item>
              <Navbar.Item href="/report">Report</Navbar.Item>
            </Navbar.Segment>
          </Navbar.Menu>
        </Navbar>
        <BrowserRouter>
          <Content>
            <Message color={this.state.status.color} className="Alert-banner">
              <Message.Header>
                {this.state.status.message}
              </Message.Header>
            </Message>
            <Switch>
              <Route exact path="/" component={MainComponent} />
              <Route path="/report" component={Report} />
              <Route component={NotFound} />
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Smart Dashboard 2019</Footer>
        </BrowserRouter>
      </div>
    );
  }
}
