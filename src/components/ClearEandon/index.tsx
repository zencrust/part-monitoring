import React, {useState} from 'react';
import "./styles.scss";
import {Button, Control, Field, Label, Radio} from "rbx";

type SlaFunction = (sla: number) => void;

export default function ClearEandon(props: { clearSla: SlaFunction }) {
    const [sla, setSla] = useState(2);

    let handleChange = (e: Event) => {
        e.preventDefault();
        props.clearSla(sla);
    };
    return (
        <div className="content center">
            <form>
                <Field horizontal>
                    <Field.Label>
                        <Label>SLAs to be cleared</Label>
                    </Field.Label>
                    <Field.Body>
                        <Field narrow>
                            <Control>
                                {[0, 1, 2].map(value => (
                                    <Label key={value}>
                                        <Radio name="member" value={value} checked={sla === value}
                                               onChange={(e) => setSla(value)}/> {value}
                                    </Label>
                                ))}
                            </Control>
                        </Field>
                    </Field.Body>
                </Field>
                <Field horizontal>
                    <Field.Label/> {/* Left empty for spacing  */}
                    <Field.Body>
                        <Field>
                            <Control>
                                <Button color="danger" onClick={handleChange}>Clear</Button>
                            </Control>
                        </Field>
                    </Field.Body>
                </Field>

            </form>
        </div>
    )
}