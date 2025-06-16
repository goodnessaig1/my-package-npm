import React from "react";
import "./Schedule.css";
import { IEventData } from "../GruveEventsWidget";
declare const ScheduleInfo: ({ eventData }: {
    eventData: IEventData;
}) => React.JSX.Element | null;
export default ScheduleInfo;
