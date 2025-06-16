import React, { useEffect, useRef, useState } from "react";
import "./Tickets.css";
import TicketCounter, { RatesProp, SelectedTicket } from "./TicketsCounter";
import { IEventData, IITickets } from "../GruveEventsWidget";
import SvgDropDown from "../../asset/DropdownIcon";

const supportedCurrency = ["NGN", "USD"];
interface TicketsProps {
  currentCurrency: string;
  setCurrentCurrency: (val: string) => void;
  setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
  tickets: IITickets;
  eventDetails: IEventData;
  selectedTickets: SelectedTicket[];
  rates: RatesProp;
  ticketBalances: number[];
}

const Tickets: React.FC<TicketsProps> = ({
  currentCurrency,
  setCurrentCurrency,
  tickets,
  eventDetails,
  rates,
  setSelectedTickets,
  selectedTickets,
  ticketBalances,
}) => {
  const dropdownRef = useRef<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (currency: string) => {
    setDropdownOpen(false);
    setCurrentCurrency(currency);
  };

  return (
    <div className="gruve-echo-tickets-container">
      <div className="gruve-echo-choose-ticket-box">
        <div className="choose-gruve-echo-ticket-header">
          <p className="gruve-echo-choose-ticket-title">Choose your ticket</p>
          <div ref={dropdownRef} className="">
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="gruve-echo-currency-select"
            >
              <span>{currentCurrency}</span>
              <SvgDropDown color="#111021" />
            </div>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  width: "60px",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  zIndex: 9999,
                  overflowY: "auto",
                  borderRadius: "8px",
                  marginTop: "4px",
                  marginLeft: "4px",
                }}
              >
                {supportedCurrency.map((currency, idx) => (
                  <div
                    key={idx}
                    className="gruve-echo-list-items"
                    onClick={() => handleChange(currency)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      display: "flex",
                      fontSize: "14px",
                      borderBottom: "1px solid #eee",
                      color: "#666481",
                    }}
                  >
                    <span>{currency}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <TicketCounter
          eventDetails={eventDetails}
          tickets={tickets}
          selectedTickets={selectedTickets}
          currentCurrency={currentCurrency}
          setSelectedTickets={setSelectedTickets}
          rates={rates}
          ticketBalances={ticketBalances}
        />
      </div>
    </div>
  );
};

export default Tickets;
