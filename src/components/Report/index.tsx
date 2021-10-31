import axios, { AxiosRequestConfig } from "axios";
import { Field, Label, Control, Button } from "rbx";
import React, { useEffect, useState, useCallback } from "react";
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

export interface Props extends React.ComponentPropsWithoutRef<"div"> { }

const ReportLayout: React.FC<Props> = (p) => {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const setDate = (date: Date | null, option: "start" | "end" ) => {
        if(date != null && date !== undefined){
            if(option === "start"){
                setStartDate(date);
            }else if(option === "end"){
                setEndDate(date);
            }

        }
    }
    
    useEffect(
        () =>
        {
            var stdate = new Date();
            stdate.setDate(stdate.getDate() - 30);
            setStartDate(stdate);
            setEndDate(new Date());
        }
    , []);

    const handleSubmit = useCallback((e : any) => 
    {
        e.preventDefault();
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

    }, [startDate, endDate]);

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
                                    onChange={date => setDate(date as Date, "start")}
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
                            onChange={date => setDate(date as Date, "end")}
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
