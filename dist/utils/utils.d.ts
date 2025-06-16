import type { SelectedTicket } from "../components/Tickets/TicketsCounter";
export declare const GET_PAYSTACK_KEY: (isTest: boolean) => "pk_test_b9c556369fc74860f7f267257c0f92c872792fd7" | "pk_live_9ad4baa113f026b2507c13522e05fd2dda0e871c";
export declare const GET_BASE_URL: (isTest: boolean) => "https://test.gruve.vercel.app" | "https://beta.gruve.events";
export declare const GET_BACKEND_URL: (isTest: boolean) => "https://backend.gruve.events" | "https://secure.gruve.events";
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
export declare function updatedTickets(tickets: any[], eventDetails: any): any;
export declare function isEarlyBirdActive(earlyBird: {
    endDate: string;
    endTime: string;
}): boolean;
export {};
