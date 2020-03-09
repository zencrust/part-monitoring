import update from "immutability-helper"; // ES6
import React, {useEffect, useState} from 'react';
import "./styles.scss";

import {Content, Footer, Message, Navbar} from "rbx";
import {BrowserRouter, Link, Route, Switch} from "react-router-dom";
import MqttManager, {ISettings, StationData, ServerStatus} from "../../MqttManager";
import {NotFound} from "../404";
import AlarmList from "../Alarm/index";
import ReportLayout from "../Report";
import Subscription from "../Subscriptions";
import queryString from "query-string";
import {isstring} from "../../Utils";

export type IStationStatus = StationData;

export type StationStatusType = Map<string, IStationStatus>;

interface IState {
    status: ServerStatus;
    settings?: ISettings;
    stationData: StationStatusType;
}

export default class MainLayout extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            status: {color: "info", message: "Initializing"},
            settings: undefined,
            stationData: new Map<string, StationData>(),
        }
    }

    public componentDidMount() {
        const alertLocations = localStorage.getItem("SelectedLocations");
        let loc = [];
        if (isstring(alertLocations)) {
            loc = alertLocations.split(",");
        }

        const mqttSub = MqttManager(loc, (val => {
                this.setState({status: val});
            }),
            (data: StationData) => {
                if (data.IsActive && data.SlaLevel < 2) {
                    let d = update(this.state.stationData, {[data.AlertId]: {$set: data}});
                    this.setState({stationData: d});
                } else {
                    let d = update(this.state.stationData, {$remove: [data.AlertId]});
                    this.setState({stationData: d});
                }
            });

        mqttSub.then((x) => {
            this.setState({settings: x.settings});
            // setDisconnect(x.disconnect);
        });
    }

    public render() {
        return (
            <div>
                <BrowserRouter>
                    <Navbar color="black">
                        <Navbar.Brand>
                            <Navbar.Item href="#">
                                <div className="title-header">
                                    eAndOn Dashboard
                                </div>
                            </Navbar.Item>
                        </Navbar.Brand>
                        <Navbar.Menu>
                            <Navbar.Segment align="start">
                                <Link className="navbar-item" to={`/`}>Home</Link>
                                <Link className="navbar-item" to={`/report`}>Report</Link>
                                <Link className="navbar-item" to={`/subscription`}>Subscription</Link>
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
                            <Route exact path="/"
                                   render={(props) => <AlarmList alarms={this.state.stationData}
                                                                 settings={this.state.settings}/>}/>
                            <Route path="/report" component={ReportLayout}/>
                            <Route path="/subscription"
                                   render={(props) => <Subscription settings={this.state.settings}/>}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </Content>
                    <Footer style={{textAlign: "center"}}>eAndOn Dashboard 2020</Footer>
                </BrowserRouter>
            </div>
        );
    }
}