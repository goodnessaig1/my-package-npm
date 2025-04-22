import React, { useContext } from "react";
// import { useTranslation } from "react-i18next";
// import { Context } from "../../utils/context";
// import { formatCurrency } from "../../utils/formatCurrency";
// import { useExchangeRate } from "../../utils/hooks";
// import { useStoreState } from "easy-peasy";
import "./OrderSummary.css";
import { formatCurrency } from "../../utils/utils";

interface Ticket {
  quantity: number;
  ticketName: string;
  cost: number;
}

interface Coupon {
  discountType?: "PERCENT" | "FLAT";
  discountValue?: number;
}

interface Props {
  ticketsArray: Ticket[];
  total: number;
  currentCurrency: string;
  rates: Record<string, number>;
  defaultCurrency: string | undefined;
  //   coupon?: Coupon;
  //   couponAppliedAmount: number;
}

const OrderSummary: React.FC<Props> = ({
  ticketsArray,
  total,
  currentCurrency,
  rates,
  defaultCurrency,
}) => {
  return (
    <div className="order-summary">
      <h2 className="order-summary-title">Order Summary</h2>

      {ticketsArray &&
        ticketsArray?.map((ticket, index) => (
          <div className="summary-row" key={`ticketsArray-summary-${index}`}>
            <span>
              {ticket.quantity} {ticket.ticketName}
            </span>
            <span>
              {/* {currentCurrency === "USD" ? "$" : "₦"}
            {formatCurrency(
              ticket.cost * ticket.quantity * conversionRate || 0
            )} */}
            </span>
          </div>
        ))}

      <hr className="divider" />

      <div className="summary-row">
        <span>Subtotal</span>

        <span>
          {`${currentCurrency === "USD" ? "$" : "₦"}${
            formatCurrency(
              total * (rates[`${currentCurrency}${defaultCurrency}`] ?? 1)
            ) ?? 0
          }`}
        </span>
      </div>

      <hr className="divider" />

      <div className="summary-row total">
        <span>Total</span>
        <span>
          {currentCurrency === "USD" ? "$" : "₦"}
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
