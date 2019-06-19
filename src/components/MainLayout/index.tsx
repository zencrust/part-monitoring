import React from 'react';
import './index.css';

import { Layout, Menu, Icon, Badge } from 'antd';
import AlarmList from '../Alarm/index';
import Report from '../Report/index';
import { Row, Col } from 'antd';

import { SelectParam } from 'antd/lib/menu';
import MqttManager, { ServerStatus, IDisplayMessage } from '../../MqttManager';

const { Header, Content, Footer, Sider } = Layout;

interface IState{
  collapsed: boolean,
  content: string,
  data: IDisplayMessage[],
  status: ServerStatus
}

export default class MainLayout extends React.Component<any, IState> {
  mqtt_sub: any;
  /**
   *
   */
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      content: "1",
      data: [],
      status: {color:"processing", message:"Initializing"}
    };
  }

  componentDidMount(){
    this.mqtt_sub = MqttManager((val:ServerStatus) => {
      this.setState({status: val});
    }, 
    (val : IDisplayMessage[]) => {
      this.setState({data: val});
      console.log(val);
    });
  }

  componentWillUnmount(){
    this.mqtt_sub();
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };
  
  onSelect = (param: SelectParam) => {
    this.setState({content: param.key});
  };

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
          <div className="logo">
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
            <Row>
              <Col span={18} push={4}>
                <h1 className="title-header">Part Monitoring</h1>
              </Col>
              <Col span={4} pull={18}>
                <Badge text={this.state.status.message} status={this.state.status.color} style={{textAlign: "left", fontSize:10}} />
              </Col>
            </Row>
          </div>
          </Header>
          <Content style={{ margin: '16px' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {(() => {
              switch (this.state.content) {
                case "1":   return <AlarmList data={this.state.data}/>;
                case "2": return <Report />;
                default: return <div>Unknown option selected</div>;
              }
            })()}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>part monitoring dashboard 2019 Created by Aimtech</Footer>
        </Layout>
      </Layout>
    );
  }
}
