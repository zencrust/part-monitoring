import React from 'react';
import './index.css';

import { Layout, Alert } from 'antd';
import AlarmList from '../Alarm/index';

import MqttManager, { ServerStatus, IDisplayMessage } from '../../MqttManager';

const { Header, Content, Footer } = Layout;

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
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout>
          <Header style={{ background: '#fff', padding: 0, textAlign: "center", fontSize: 20 }}>
            <div style={{marginBottom:'10px'}}>
              <h1 className="title-header" style={{ textTransform: 'uppercase', textOverflow: 'ellipsis' }}>Smart Dashboard</h1>
              <Alert message={this.state.status.message} type={this.state.status.color} showIcon style={{ textAlign: "left", fontSize: 15, textOverflow: 'ellipsis', textJustify: 'inter-word', textTransform: 'capitalize' }} />
            </div>
          </Header>
          <Content style={{ margin: '16px' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360, marginTop:'20px' }}>
              <AlarmList alarms={this.state.alarms} />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Smart Dashboard 2019 Created by Aimtech</Footer>
        </Layout>
      </Layout>
    );
  }
}
