import update from "immutability-helper"; // ES6
import React from 'react';
import "./styles.scss";

import {Button, Content, Dropdown, Footer, Icon, Message, Navbar, Progress} from "rbx";
import {BrowserRouter, Link, Route, Switch} from "react-router-dom";
import MqttManager from "../../MqttManager";
import {NotFound} from "../404";
import AlarmList from "../Alarm/index";
import ReportLayout from "../Report";
import {isstring} from "../../Utils";
import axios from "axios";
import {ISettings, ServerStatus, StationData, StationStatusType} from "../../types";

interface IState {
    status: ServerStatus;
    settings: ISettings | undefined;
    stationData: StationStatusType;
    slaSelection: number;
    groups: string[];
}

export default class MainLayout extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            status: {color: "info", message: "Initializing"},
            settings: undefined,
            stationData: new Map<string, StationData>(),
            slaSelection: 0,
            groups: []
        }
    }

    public componentDidMount() {
        const alertLocations = localStorage.getItem("SelectedLocations");
        if (isstring(alertLocations) && alertLocations !== "") {
            let loc = alertLocations.trim().split(",");
            this.setState({groups: loc});
        }

        axios.get<ISettings>("assets/config/settings.json")
            .then((settings) => {
                const mqttSub = MqttManager(settings.data, (val => {
                        this.setState({status: val});
                    }),
                    (data: StationData) => {
                        if (data.IsActive) {
                            let d = update(this.state.stationData, {[data.AlertId]: {$set: data}});
                            this.setState({stationData: d});
                        } else {
                            let d = update(this.state.stationData, {$remove: [data.AlertId]});
                            this.setState({stationData: d});
                        }
                    });
                this.setState({settings: settings.data});
            });
    }

    slaSelectionText = (sla: number) => {
        if (sla === 3) {
            return "ALL SLA";
        }

        return `SLA ${sla}`;
    };

    slaChangeHandler = (e: any, sla: number) => {
        e.preventDefault();
        this.setState({slaSelection: sla});
    };

    groupChangeHandler = (e: any, groupName: string) => {
        e.preventDefault();
        let index = this.state.groups.indexOf(groupName);
        let groupState = index !== -1 ?
            update(this.state.groups, {$splice: [[index, 1]]}) :
            update(this.state.groups, {$push: [groupName]});

        this.setState({groups: groupState});
        localStorage.setItem("SelectedLocations", groupState.join(","));
    };

    public render() {
        if (this.state.settings === undefined) {
            return (
                <Progress size="large" color="primary">
                    <div>Loading settings file ...</div>
                </Progress>
            );
        }

        const settings: ISettings = this.state.settings;
        return (
            <div>
                <BrowserRouter>
                    <Navbar color="dark">
                        <Navbar.Brand>
                            <Navbar.Item href="#">
                                <div className="title-header">
                                    eAndon Dashboard
                                </div>
                            </Navbar.Item>
                        </Navbar.Brand>
                        <Navbar.Menu>
                            <Navbar.Segment align="start">
                                <Link className="navbar-item" to={`/`}>Home</Link>
                                <Link className="navbar-item" to={`/report`}>Report</Link>
                            </Navbar.Segment>
                        </Navbar.Menu>
                        <Navbar.Brand>
                            <img src="assets/images/gelogo.png" alt="gelogo" width="50" height="10"/>
                            <h3 className="brand-header">
                                X-Ray
                            </h3>
                        </Navbar.Brand>
                        <Dropdown className="slaDropdown">
                            <Dropdown.Trigger>
                                <Button>
                                    <span>{this.slaSelectionText(this.state.slaSelection)}</span>
                                    <Icon size="small">
                                    </Icon>
                                </Button>
                            </Dropdown.Trigger>
                            <Dropdown.Menu>
                                <Dropdown.Content>
                                    {[0, 1, 2].map((num) =>
                                        <Dropdown.Item active={this.state.slaSelection === num}
                                                       key={num}
                                                       onClick={(e) => this.slaChangeHandler(e, num)}>
                                            SLA - {num}</Dropdown.Item>
                                    )}
                                </Dropdown.Content>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown className="groupDropdown">
                            <Dropdown.Trigger>
                                <Button>
                                    <span>Product Selection</span>
                                    <Icon size="small">
                                    </Icon>
                                </Button>
                            </Dropdown.Trigger>
                            <Dropdown.Menu>
                                <Dropdown.Content>
                                    {settings.groups.map((group) =>
                                        <Dropdown.Item key={group.groupName}
                                                       active={this.state.groups.includes(group.groupName)}
                                                       onClick={(e) => this.groupChangeHandler(e, group.groupName)}>
                                            {group.groupName}
                                        </Dropdown.Item>
                                    )}
                                </Dropdown.Content>
                            </Dropdown.Menu>
                        </Dropdown>
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
                                   render={() => <AlarmList alarms={this.state.stationData}
                                                            settings={settings}
                                                            locations={this.state.groups}
                                                            slaSelection={this.state.slaSelection}/>}/>
                            <Route path="/report" component={ReportLayout}/>
                            <Route component={NotFound}/>
                        </Switch>
                    </Content>
                    <Footer style={{textAlign: "center"}}>eAndon Dashboard 2020</Footer>
                </BrowserRouter>
            </div>
        );
    }
}