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
  setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
  selectedTickets: SelectedTicket[];
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
  requiredQuestion?: Question[];
}

export type ITicket = {
  _ticketType: string;
  sectionName: string;
  quantity: number;
  cost: number;
  description: string;
  minOrder: number;
  maxOrder: number;
  isDisabled: boolean;
  questions: any[];
  ticketType: string;
};

export default function TicketCounter({
  tickets,
  currentCurrency,
  eventDetails,
  rates,
  setSelectedTickets,
  selectedTickets,
}: TicketCounterPorps) {
  const handleTicketQuantityChange = (newValue: number, ticket: ITicket) => {
    setSelectedTickets((prev) => {
      const exists = prev.find((t) => t._ticketType === ticket._ticketType);

      if (exists) {
        if (newValue === 0) {
          return prev.filter((t) => t._ticketType !== ticket._ticketType);
        }
        return prev.map((t) =>
          t._ticketType === ticket._ticketType
            ? { ...t, quantity: newValue }
            : t
        );
      } else {
        return [
          ...prev,
          {
            _ticketType: ticket._ticketType,
            ticketName: ticket.sectionName,
            cost: ticket.cost,
            quantity: newValue,
          },
        ];
      }
    });
  };
  return (
    <div className="ticket-counter-container">
      {tickets &&
        tickets.map((ticket: any, index: number) => {
          const selected = selectedTickets.find(
            (t) => t._ticketType === ticket._ticketType
          );
          const selectedQuantity = selected?.quantity || 0;

          return (
            <div className="ticket-row" key={index}>
              <div className="ticket-top">
                <div className="ticket-top-left">
                  <h4 className="">{ticket.sectionName}</h4>
                  <span className="">
                    {ticket.cost === 0 ? (
                      "Free"
                    ) : (
                      <>
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
                          <>{ticket?.cost.toLocaleString("en-NG")}</>
                        )}
                      </>
                    )}
                  </span>
                </div>
                <CustomInput
                  max={ticket.quantity}
                  value={selectedQuantity}
                  onChange={(val: any) =>
                    handleTicketQuantityChange(val, ticket)
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
