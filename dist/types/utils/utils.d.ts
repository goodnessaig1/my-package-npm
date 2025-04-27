export declare const PAYSTACK_KEY = "pk_test_b9c556369fc74860f7f267257c0f92c872792fd7";
import { SelectedTicket } from "../components/Tickets/TicketsCounter";
type TimeDiffResult = {
    day: number;
    hour: number;
    minute: number;
    second: number;
};
export declare const timeDiff: (date: Date, now?: number) => TimeDiffResult;
export declare const sanitizeUrl: (url: string) => string;
export declare const formatCurrency: (valueInNumber: number) => string;
export declare function expandTickets(ticketArrays: SelectedTicket[]): SelectedTicket[];
export declare const arrangeByDate: (data: any[]) => any[];
export declare function randomizeLastFourDigits(walletAddress: string): string;
export declare const createUserAnswerArray: (tickets: any[]) => any[];
export declare function findTicketTypeIdWithHighestQuantity(tickets: any): null;
export declare function applyDiscount(tickets: any[], ticketTypeId: number, count: number, eventCurrency: string, discountAmount: number, discountType: "AMOUNT" | "PERCENT", cost: Record<number, number>): [any[], number];
export declare function updatedTickets(tickets: any[], eventDetails: any, coupons: any[]): any;
export {};
