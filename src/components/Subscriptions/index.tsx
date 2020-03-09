import {Button, Checkbox, Control, Field, Label, List} from "rbx";
import React, {useEffect, useState} from "react";
import "./styles.scss";
import {ISettings} from "../../MqttManager";
import update from "immutability-helper"; // ES6

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
    return returnValue;
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
            <form className="subscriptionHead">
                {props.settings.location.map(x =>
                    <Field horizontal key={removeSpace(x)}>
                        <Control>
                            <Label>
                                <Checkbox defaultChecked={preset.has(x)}
                                          onChange={(e) => setPreset(update(preset, {[x]: {$set: !preset.get(x)}}))}/>{x}
                            </Label>
                        </Control>
                    </Field>,
                )}
                <Field horizontal>
                    <Control>
                        <Button color="link"
                                onClick={(e) => localStorage.setItem("SelectedLocations", dictToStr(preset))}>Apply</Button>
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
