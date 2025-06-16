import React from "react";
import "./OrderSummary.css";
import { formatCurrency } from "../../utils/utils";

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

const OrderSummary: React.FC<Props> = ({
  ticketsArray,
  total,
  currentCurrency,
  rates,
  couponAppliedAmount,
  defaultCurrency,
}) => {
  return (
    <div className="gruve-echo-order-summary">
      <h2 className="gruve-echo-order-summary-title">Order Summary</h2>

      {ticketsArray &&
        ticketsArray?.map((ticket, index) => {
          const hasDiscount = ticket.cost !== ticket.discountedCost;
          const ticketCost = hasDiscount ? ticket.discountedCost : ticket.cost;
          return (
            <div
              className="gruve-echo-summary-row"
              key={`ticketsArray-summary-${index}`}
            >
              <span>
                {ticket.quantity} {ticket.ticketName}
              </span>
              <span>
                {ticket.cost === 0 ? (
                  "free"
                ) : (
                  <>
                    {currentCurrency === "USD" ? "$" : "₦"}
                    {formatCurrency(
                      ticketCost *
                        ticket.quantity *
                        (rates[`${currentCurrency}${defaultCurrency}`] ?? 1) ||
                        0
                    )}
                  </>
                )}
              </span>
            </div>
          );
        })}

      <hr className="divider" />

      <div className="gruve-echo-summary-row">
        <span>Subtotal</span>

        <span>
          {`${currentCurrency === "USD" ? "$" : "₦"}${formatCurrency(
            total +
              couponAppliedAmount *
                (rates[`${currentCurrency}${defaultCurrency}`] ?? 1) || 0
          )}
`}
        </span>
      </div>

      <hr className="divider" />

      {couponAppliedAmount > 0 && (
        <>
          <div className="gruve-echo-summary-row">
            <span>Discount</span>

            <span className="gruve-echo-discount">
              -
              {`${currentCurrency === "USD" ? "$" : "₦"}${
                formatCurrency(
                  +couponAppliedAmount *
                    (rates[`${currentCurrency}${defaultCurrency}`] ?? 1)
                ) ?? 0
              }`}
            </span>
          </div>

          <hr className="divider" />
        </>
      )}

      <div className="gruve-echo-summary-row total">
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
