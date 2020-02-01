import axios, { AxiosRequestConfig } from "axios";
import { Field, Label, Control, Button } from "rbx";
import React, { useEffect, useState } from "react";
import { isUndefined } from "util";
import { ToDateTimeFormat, ToTimeFormat } from "../../Utils/index";
import "./styles.scss";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export interface ILog {
    id: number;
    name: string;
    start_time: string;
    duration: number;
    comments: string;
}

interface IState {
    logs: ILog[] | undefined;
    limit: number;
    offset: number;
    error: boolean;
}
export interface Props extends React.ComponentPropsWithoutRef<"div"> { }

const ReportLayout: React.FC<Props> = (p) => {
    var stdate = new Date();
    stdate.setDate(stdate.getDate() - 30);
    const [startDate, setStartDate] = useState(stdate);
    const [endDate, setEndDate] = useState(new Date());

    const setDate = (date: Date | null, f: React.Dispatch<React.SetStateAction<Date>> ) => {
        if(date != null){
            f(date);
        }
    }

    const handleSubmit = (event : any) => 
    {
        event.preventDefault();
        const uri = "/api/v1/getTimereport";
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        const req: AxiosRequestConfig = {
            params: {
                from: startDate,
                to : endDate,
            },
            cancelToken: source.token,
        };
        axios.get<string>(uri, req)
            .then((logs) => {
                var blob = new Blob([logs.data], { type: 'text/csv;charset=utf-8;' });
                var link = document.createElement("a");
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", "part_log_export.csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((err) => {
                if (err.message !== "component unmounted") {
                }
            });
        return () => {
            // clean up
            source.cancel("component unmounted");
        };

        // if (error) {
        //     return (
        //         <div className="errorText">
        //             Error occcured while fetching records. Try refreshing the page to retry
        //         </div>
        //     );
        // }

        // if (isUndefined(logs)) {
        //     return (
        //         <div className="errorText">
        //             Please wait while fetching logs...
        //         </div>
        //     );
        // }

        // if (logs.length === undefined) {
        //     return (
        //         <div className="errorText">
        //             No logs found
        //         </div>
        //     );
        // }
    }

    return (
            <form onSubmit={handleSubmit} className="center">
                <Field horizontal>
                    <Field.Label size="normal">
                        <Label>From: </Label>
                    </Field.Label>
                    <Field.Body>
                        <Field>
                            <Control>
                                <DatePicker
                                    selected={startDate}
                                    onChange={date => setDate(date, setStartDate)}
                                    showTimeSelect
                                    timeFormat="HH"
                                    timeIntervals={60}
                                    selectsStart
                                    timeCaption="time"
                                    dateFormat="MMMM d, yyyy h aa"
                                    endDate={endDate}
                                    />
                            </Control>
                        </Field>
                    </Field.Body>

                </Field>
                <Field horizontal>
                    <Field.Label size="normal">
                        <Label>To: </Label>
                    </Field.Label>
                    <Field.Body>
                        <Field>

                    <Control>
                        <DatePicker
                            selected={endDate}
                            onChange={date => setDate(date, setEndDate)}
                            showTimeSelect
                            timeFormat="HH"
                            timeIntervals={60}
                            timeCaption="time"
                            selectsEnd
                            dateFormat="MMMM d, yyyy h aa"
                            endDate={endDate}
                            minDate={startDate}
                        />
                    </Control>
                    </Field>
                    </Field.Body>
                </Field>
                <Field horizontal>
                <Field.Label /> {/* Left empty for spacing  */}
                <Field.Body>
                <Field>
                    <Control>
                        <Button color="link">Submit</Button>
                        </Control>
                </Field>
                </Field.Body>
            </Field>
            </form>
    );
};

export default ReportLayout;
