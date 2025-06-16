import React from "react";
export type RatesProp = {
    [key: string]: any;
};
interface TicketCounterPorps {
    tickets: any;
    currentCurrency: string;
    rates: RatesProp;
    eventDetails: any;
    setSelectedTickets: any;
    selectedTickets: SelectedTicket[];
    ticketBalances: number[];
}
interface Question {
    id: string;
    question: string;
    sectionName: string;
}
export interface SelectedTicket {
    _ticketType: string;
    quantity: number;
    cost: number;
    ticketName: string;
    id?: string;
    discountedCost: number;
    discountedPrice?: number;
    requiredQuestion?: Question[];
}
export type ITicket = {
    discountedCost: number;
    ticketTypeId: number;
    _ticketType: string;
    sectionName: string;
    quantity: number;
    cost: number;
    description: string;
    minOrder: number;
    maxOrder: number;
    isDisabled: boolean;
    questions: any[];
    ticketType: number;
    isOnSale?: boolean;
    earlyBird?: {
        endDate?: string;
        endTime?: string;
    };
    discountedPrice?: number;
};
export default function TicketCounter({ tickets, currentCurrency, eventDetails, rates, setSelectedTickets, selectedTickets, ticketBalances, }: TicketCounterPorps): React.JSX.Element;
export {};
