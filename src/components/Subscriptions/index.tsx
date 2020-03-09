import {Button, Checkbox, Control, Field, Label} from "rbx";
import React, {useEffect, useState} from "react";
import "./styles.scss";
import {ISettings} from "../../MqttManager";
import update from "immutability-helper"; // ES6
import {Redirect} from 'react-router-dom';

function initializeCheckBox(location: string[], settings: ISettings) {
    const returnValue: Map<string, boolean> = new Map<string, boolean>();
    settings.location.forEach((v, k) => {
        if (location.length === 0) {
            returnValue.set(v, false);
        } else {
            returnValue.set(v, location.includes(v));
        }
    });

    return returnValue;
}

function dictToStr(value: Map<string, boolean>) {
    let returnValue = "";
    value.forEach((v, k) => {
        if (v) {
            returnValue = returnValue + k + ",";
        }
    });
    return returnValue.substring(0, Math.max(0, returnValue.length - 1));
}

function removeSpace(str: string) {
    return str.replace(/\s/g, '')
}

const Subscription = (props: { settings?: ISettings }) => {

    const [preset, setPreset] = useState<Map<string, boolean>>(new Map());

    useEffect(() => {
        if (props.settings === undefined || props.settings === null) {
            return;
        }

        const locationStr = localStorage.getItem("SelectedLocations");
        let loc: string[] = [];
        if (locationStr !== null) {
            loc = locationStr.split(",");
        }
        let _preset = initializeCheckBox(loc, props.settings);
        setPreset(_preset);
    }, [props.settings]);

    if (props.settings === undefined || props.settings === null) {
        return (
            <div>
            </div>
        );
    }

    return (
        <div>
            <form>
                <div className="subscriptionHead">
                    {props.settings.location.map(x =>
                        <Field horizontal key={removeSpace(x)} className="subscriptionItem">
                            <Control>
                                <Label>
                                    <Checkbox checked={preset.get(x) === true}
                                              onChange={(e) => setPreset(update(preset, {[x]: {$set: !preset.get(x)}}))}/>
                                    <span>{x}</span>
                                </Label>
                            </Control>
                        </Field>,
                    )}
                </div>
                <Field kind="group" className="SubscriptionButtonGroup">
                    <Control>
                        <Button color="link"
                                onClick={(e) => {
                                    localStorage.setItem("SelectedLocations", dictToStr(preset));
                                    e.preventDefault();
                                }}>Apply</Button>
                    </Control>
                    <Control>
                        <Button color="danger">Cancel</Button>
                    </Control>
                </Field>
            </form>
        </div>
    )
};

export default Subscription;
