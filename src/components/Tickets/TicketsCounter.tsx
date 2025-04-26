import React from "react";
import { formatCurrency } from "../../utils/utils";
import TruncatedText from "./TruncatedText";
import MinusIcon from "../../asset/MinusIcon";
import AddIcon from "../../asset/AddIcon";

function CustomInput({ max, value, onChange, ticket }: any) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1, ticket);
    }
  };

  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1, ticket);
    }
  };

  return (
    <div className="counter-wrapper">
      <button className="counter-btn" onClick={handleDecrement}>
        <MinusIcon />
      </button>
      <span className="counter-value">{value}</span>
      <button className="counter-btn" onClick={handleIncrement}>
        <AddIcon />
      </button>
    </div>
  );
}
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

export default function TicketCounter({
  tickets,
  currentCurrency,
  eventDetails,
  rates,
  setSelectedTickets,
  selectedTickets,
  ticketBalances,
}: TicketCounterPorps) {
  const handleTicketQuantityChange = (
    newValue: number,
    index: number,
    ticket: ITicket
  ) => {
    setSelectedTickets((prev: any) => {
      const updated = [...prev];

      const ticketToUpdateIndex = prev.findIndex(
        (t: any) =>
          t.ticketName === ticket.sectionName && t.cost === ticket.cost
      );

      if (newValue === 0) {
        if (ticketToUpdateIndex !== -1) {
          updated.splice(ticketToUpdateIndex, 1);
        }
      } else {
        const updatedTicket = {
          _ticketType: ticket._ticketType,
          ticketName: ticket.sectionName,
          cost: ticket.cost,
          ticketType: ticket?.ticketTypeId,
          ticketTypeId: ticket?.ticketTypeId,
          discountedCost: ticket.discountedCost,
          discountedPrice: ticket.discountedPrice ?? 0,
          quantity: newValue,
        };

        if (ticketToUpdateIndex !== -1) {
          updated[ticketToUpdateIndex] = updatedTicket;
        } else {
          updated.push(updatedTicket);
        }
      }

      return updated;
    });
  };

  return (
    <div className="ticket-counter-container">
      {tickets.map((ticket: ITicket, index: number) => {
        const hasDiscount = ticket.cost !== ticket.discountedCost;
        const selectedTicket = selectedTickets.find(
          (t) => t.ticketName === ticket.sectionName && t.cost === ticket.cost
        );

        const selectedQuantity = selectedTicket?.quantity ?? 0;

        return (
          <div className="ticket-row" key={index}>
            <div className="ticket-top">
              <div className="ticket-top-left">
                <div className="ticket-name-holder">
                  <h4 className="">{ticket.sectionName} </h4>
                  {hasDiscount && <div className="early-bird">Early bird</div>}
                </div>
                <span className="">
                  {ticket.cost === 0 ? (
                    "Free"
                  ) : (
                    <>
                      {hasDiscount ? (
                        <div className="early-bird-prices">
                          <h5>
                            {currentCurrency === "USD" ? "$" : "₦"}
                            {ticket?.discountedCost &&
                            Object.keys(rates).length > 0 ? (
                              <>
                                {formatCurrency(
                                  ticket.discountedCost *
                                    (rates[
                                      `${currentCurrency}${
                                        eventDetails?.currency ?? "USD"
                                      }`
                                    ] ?? 1)
                                )}
                              </>
                            ) : (
                              <>
                                {ticket?.discountedCost?.toLocaleString(
                                  "en-NG"
                                )}
                              </>
                            )}
                          </h5>
                          <span>
                            {currentCurrency === "USD" ? "$" : "₦"}
                            {ticket?.cost && Object.keys(rates).length > 0 ? (
                              <>
                                {formatCurrency(
                                  ticket.cost *
                                    (rates[
                                      `${currentCurrency}${
                                        eventDetails?.currency ?? "USD"
                                      }`
                                    ] ?? 1)
                                )}
                              </>
                            ) : (
                              <>{ticket?.cost?.toLocaleString("en-NG")}</>
                            )}
                          </span>
                        </div>
                      ) : (
                        <>
                          {ticket?.cost && Object.keys(rates).length > 0 ? (
                            <>
                              {formatCurrency(
                                ticket.cost *
                                  (rates[
                                    `${currentCurrency}${
                                      eventDetails?.currency ?? "USD"
                                    }`
                                  ] ?? 1)
                              )}
                            </>
                          ) : (
                            <>{ticket?.cost.toLocaleString("en-NG")}</>
                          )}
                        </>
                      )}
                    </>
                  )}
                </span>
              </div>
              <CustomInput
                max={Math.min(ticket.quantity, ticketBalances[index])}
                value={selectedQuantity}
                onChange={(val: any) =>
                  handleTicketQuantityChange(val, index, ticket)
                }
                ticket={ticket}
              />
            </div>
            <div className="ticket-info">
              <TruncatedText text={ticket?.description} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
