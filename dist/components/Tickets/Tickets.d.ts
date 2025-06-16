import React from "react";
import "./Tickets.css";
import { RatesProp, SelectedTicket } from "./TicketsCounter";
import { IEventData, IITickets } from "../GruveEventsWidget";
interface TicketsProps {
    currentCurrency: string;
    setCurrentCurrency: (val: string) => void;
    setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
    tickets: IITickets;
    eventDetails: IEventData;
    selectedTickets: SelectedTicket[];
    rates: RatesProp;
    ticketBalances: number[];
}
declare const Tickets: React.FC<TicketsProps>;
export default Tickets;
