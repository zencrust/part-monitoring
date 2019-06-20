import React from 'react';
import './index.css';

import { Layout, Menu, Icon, Badge, Alert } from 'antd';
import AlarmList from '../Alarm/index';
import Report from '../Report/index';

import { SelectParam } from 'antd/lib/menu';
import MqttManager, { ServerStatus, IDisplayMessage } from '../../MqttManager';

const { Header, Content, Footer, Sider } = Layout;

interface IState{
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
      status: {color:"info", message:"Initializing"}
    };
  }

  componentDidMount(){
    this.mqtt_sub = MqttManager((val:ServerStatus) => {
      this.setState({status: val});
    }, 
    (val : IDisplayMessage[]) => {
      this.setState({alarms: val});
      console.log(val);
    });
  }

  componentWillUnmount(){
    this.mqtt_sub();
  }

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
  };
  
  onSelect = (param: SelectParam) => {
    this.setState({content: param.key});
  };

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <div className="logo" style={{margin:'5px 10px'}}>
            <Alert message={this.state.status.message} type={this.state.status.color} showIcon style={{textAlign: "left", fontSize:15, textOverflow:'ellipsis', textJustify:'inter-word', textTransform:'capitalize'}} />
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" onSelect={this.onSelect}>
            <Menu.Item key="1">
              <Icon type="warning" />
              <span>Alarms</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="database" />
              <span>Report</span>
            </Menu.Item>            
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0, textAlign: "center", fontSize:20}}>
          <div>
              <h1 className="title-header" style={{ textTransform: 'uppercase', textOverflow:'ellipsis' }}>Smart Dashboard</h1>
          </div>
          </Header>
          <Content style={{ margin: '16px' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {(() => {
              switch (this.state.content) {
                case "1":   return <AlarmList alarms={this.state.alarms}/>;
                case "2": return <Report />;
                default: return <div>Unknown option selected</div>;
              }
            })()}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Smart Dashboard 2019 Created by Aimtech</Footer>
        </Layout>
      </Layout>
    );
  }
}
