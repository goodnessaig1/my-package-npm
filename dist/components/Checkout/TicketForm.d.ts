import React from "react";
import { IEventType } from "../../../types/echo-test-goody";
import { SelectedTicket } from "../Tickets/TicketsCounter";
interface Question {
    id: string;
    question: string;
    sectionName: string;
    isRequired: string;
}
export interface ITicketListed {
    discountedCost: number;
    _ticketType: string;
    ticketName: string;
    cost: number;
    quantity: number;
    ticketTypeId: number;
    id: string;
    requiredQuestion: Question[];
}
export interface SubmittedTicket {
    id: string;
    fullName: string;
    email: string;
    whatsAppNumber: string;
    cost: number;
    ticketName: string;
    quantity: number;
    questions: {
        id: string;
        answer: string;
        isRequired: string;
    }[];
    ticketTypeId: number;
}
interface Props {
    selectedTickets: SelectedTicket[];
    currentCurrency: string;
    rates: Record<string, number>;
    eventDetailsWithId: IEventType | null;
    isMultiple: string;
    setIsMultiple: (val: string) => void;
    setDiscountCode: (val: string) => void;
    handlePaymentHandler: (val: any) => void;
    handleSubmit: (data: SubmittedTicket[]) => void;
    setErrorMessage: (val: string) => void;
    handleClosePayment: () => void;
    handleCloseModal: () => void;
    handleDeleteTicket: (index: number) => void;
    goBack: () => void;
    totalPrice: number;
    errorMessage: string;
    buttonColor: string;
    isSubmitting: boolean;
    openPaymentsModal: boolean;
    showApplyCoupon: boolean;
    handleCoupon: any;
    discountCode: any;
    coupon: any;
    couponAppliedAmount: any;
    tickets: ITicketListed[];
    couponError: string;
    setCouponError: (val: string) => void;
}
type UserAnswer = {
    questionId: string;
    answer: string;
};
export interface HandlePurchaseEventParams {
    walletAddress: string;
    eventId?: string;
    eventAddress?: string;
    email: string;
    tickets: any[];
    currency?: string;
    total?: number;
    userAnswerArray?: UserAnswer[];
}
declare const TicketForm: React.FC<Props>;
export default TicketForm;
