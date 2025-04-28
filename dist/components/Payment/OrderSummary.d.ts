import React from "react";
import "./OrderSummary.css";
interface Ticket {
    quantity: number;
    ticketName: string;
    cost: number;
    discountedCost: number;
}
interface Coupon {
    discountType?: "PERCENT" | "FLAT";
    discountValue?: number;
}
interface Props {
    ticketsArray: Ticket[];
    total: number;
    currentCurrency: string | undefined;
    rates: Record<string, number>;
    defaultCurrency: string | undefined;
    coupon?: Coupon;
    couponAppliedAmount: any;
}
declare const OrderSummary: React.FC<Props>;
export default OrderSummary;
