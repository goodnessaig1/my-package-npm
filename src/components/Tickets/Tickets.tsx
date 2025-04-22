import React from "react";
import "./Tickets.css";
import TicketCounter, { RatesProp, SelectedTicket } from "./TicketsCounter";
import { IEventData, IITickets } from "../GruveEventsWidget";

const supportedCurrency = ["NGN", "USD"];
interface TicketsProps {
  currentCurrency: string;
  setCurrentCurrency: (val: string) => void;
  setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
  tickets: IITickets;
  eventDetails: IEventData;
  selectedTickets: SelectedTicket[];
  rates: RatesProp;
}

const Tickets: React.FC<TicketsProps> = ({
  currentCurrency,
  setCurrentCurrency,
  tickets,
  eventDetails,
  rates,
  setSelectedTickets,
  selectedTickets,
}) => {
  return (
    <div className="tickets-container">
      <div className="choose-ticket-box">
        <div className="choose-ticket-header">
          <p className="choose-ticket-title">Choose your ticket</p>

          <div className=""></div>
          <select
            className="currency-select"
            value={currentCurrency}
            disabled={Object.keys(rates).length === 0}
            onChange={(e) => setCurrentCurrency(e.target.value)}
          >
            {supportedCurrency.map((eachCurrency) => (
              <option
                value={eachCurrency}
                className="option"
                key={`desk-${eachCurrency}`}
              >
                {eachCurrency}
              </option>
            ))}
          </select>
        </div>
        <TicketCounter
          eventDetails={eventDetails}
          tickets={tickets}
          selectedTickets={selectedTickets}
          currentCurrency={currentCurrency}
          setSelectedTickets={setSelectedTickets}
          rates={rates}
        />
      </div>
    </div>
  );
};

export default Tickets;
