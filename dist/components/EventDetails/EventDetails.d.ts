import "./EventDetails.css";
import React from "react";
import { IEventData } from "../GruveEventsWidget";
import { IEventType, QuestionList, TicketDiscountList } from "../../../types/echo-test-goody";
interface EventDetailsProps {
    eventDetails: IEventData | null;
    open: boolean;
    setOpen: (val: boolean) => void;
    rates: Record<string, number>;
    questions: QuestionList;
    eventDetailsWithId: IEventType | null;
    coupons: any[];
    ticketBalances: number[];
    couponData: TicketDiscountList;
    BACKEND_URL: string;
    BASE_URL: string;
    buttonColor: string;
    buttonTextColor: string;
}
declare const EventDetails: React.FC<EventDetailsProps>;
export default EventDetails;
