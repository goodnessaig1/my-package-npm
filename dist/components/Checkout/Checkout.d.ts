import React from "react";
import "./Checkout.css";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import { IEventType, QuestionList } from "../../../types/echo-test-goody";
import { ITicketListed } from "./TicketForm";
interface CheckoutProps {
    handleCloseModal: () => void;
    setOpenCheckout: (value: boolean) => void;
    setOpenPaymentsModal: (value: boolean) => void;
    listedTickets: ITicketListed[];
    eventDetailsWithId: IEventType | null;
    questionsToDisplay: QuestionList;
    currentCurrency: string;
    openPaymentsModal: boolean;
    rates: Record<string, number>;
    selectedTickets: SelectedTicket[];
    setShowTicketPurchaseSuccess: (val: boolean) => void;
    setListedTickets: React.Dispatch<React.SetStateAction<ITicketListed[]>>;
    setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
    coupons: any[];
    updatedTicketsData: ITicketListed[];
    buttonColor: string;
    BACKEND_URL: string;
    BASE_URL: string;
}
declare const Checkout: React.FC<CheckoutProps>;
export default Checkout;
