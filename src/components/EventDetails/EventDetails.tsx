import "./EventDetails.css";
import React, { useState } from "react";
import Modal from "./Modal";
import { IEventData } from "../GruveEventsWidget";
import ScheduleInfo from "../Schedule/Schedule";
import Location from "../Schedule/Location";
import Tickets from "../Tickets/Tickets";
import ArrowRight from "../../asset/ArrowRight";
import PoweredBy from "../../asset/PoweredBy";
import CloseIcon from "../../asset/CloseIcon";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import Checkout from "../Checkout/Checkout";
import { expandTickets } from "../../utils/utils";
import { IEventType, QuestionList } from "../../types/event-types";
import TicketPurchaseSuccessfulModal from "../Tickets/TicketPurchaseSuccessfulModal";
import { ITicketListed } from "../Checkout/TicketForm";

interface EventDetailsProps {
  eventDetails: IEventData | null;
  open: boolean;
  setOpen: (val: boolean) => void;
  rates: Record<string, number>;
  questions: QuestionList;
  eventDetailsWithId: IEventType | null;
  BACKEND_URL: string;
  BASE_URL: string;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  eventDetails,
  open,
  setOpen,
  rates,
  questions,
  eventDetailsWithId,
  BACKEND_URL,
  BASE_URL,
}) => {
  const [currentCurrency, setCurrentCurrency] = useState("NGN");
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [listedTickets, setListedTickets] = useState<ITicketListed[]>([]);
  const [openCheckout, setOpenCheckout] = useState(false);
  const [openPaymentsModal, setOpenPaymentsModal] = useState(false);
  const [showTicketPurchaseSuccess, setShowTicketPurchaseSuccess] =
    useState(false);

  const questionsIds: string[] =
    eventDetails?.tickets?.map((eachTicket) => eachTicket?.sectionName) || [];

  const questionsToDisplay = questions.filter((eachQuestion) =>
    questionsIds.includes(eachQuestion?.sectionName)
  );

  const handleClose = () => {
    setOpen(false);
    setOpenCheckout(false);
    setSelectedTickets([]);
    if (showTicketPurchaseSuccess) {
      setShowTicketPurchaseSuccess(false);
    }
  };

  const isSelected = selectedTickets.length > 0;

  const handleGetTickets = () => {
    if (isSelected) {
      setListedTickets(expandTickets(selectedTickets) as ITicketListed[]);
      setOpenCheckout(true);
    }
  };

  return (
    <Modal
      isOpen={open}
      openCheckout={openCheckout}
      openPaymentsModal={openPaymentsModal}
    >
      {showTicketPurchaseSuccess ? (
        <TicketPurchaseSuccessfulModal
          close={handleClose}
          setShowTicketPurchaseSuccess={setShowTicketPurchaseSuccess}
        />
      ) : (
        <>
          {openCheckout ? (
            <>
              <Checkout
                rates={rates}
                setOpenCheckout={setOpenCheckout}
                setOpenPaymentsModal={setOpenPaymentsModal}
                openPaymentsModal={openPaymentsModal}
                listedTickets={listedTickets}
                currentCurrency={currentCurrency}
                setListedTickets={setListedTickets}
                selectedTickets={selectedTickets}
                eventDetailsWithId={eventDetailsWithId}
                setShowTicketPurchaseSuccess={setShowTicketPurchaseSuccess}
                setSelectedTickets={setSelectedTickets}
                questionsToDisplay={questionsToDisplay}
                handleCloseModal={handleClose}
                BACKEND_URL={BACKEND_URL}
                BASE_URL={BASE_URL}
              />
            </>
          ) : (
            <>
              <div className="modal-top">
                <h3>Details</h3>
                <div onClick={handleClose} className="close-icon">
                  <CloseIcon />
                </div>
              </div>
              {eventDetails && Object.keys(eventDetails).length > 0 && (
                <div className="event-details-container">
                  <div className="event-img-container">
                    <img
                      className="event-img max-w-[400px] max-h-[400px] size-[400px] rounded-lg"
                      src={eventDetails?.info?.eventImage}
                      alt=""
                    />
                  </div>
                  <div className="details">
                    <h3 className=""> {eventDetails?.info?.eventName}</h3>
                    <div className="date-container">
                      <ScheduleInfo eventData={eventDetails} />
                      <Location
                        location={eventDetails?.info?.eventLocation.label}
                      />
                    </div>
                    <div className="">
                      <Tickets
                        currentCurrency={currentCurrency}
                        setCurrentCurrency={setCurrentCurrency}
                        tickets={eventDetails?.tickets}
                        eventDetails={eventDetails}
                        selectedTickets={selectedTickets}
                        rates={rates}
                        setSelectedTickets={setSelectedTickets}
                      />
                    </div>
                    <button
                      disabled={!isSelected}
                      className={`get-tickets-btn ${
                        !isSelected && "not-selected"
                      }`}
                      onClick={handleGetTickets}
                    >
                      Get Tickets
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      <div className="modal-footer">
        <div className="">
          <span className="">View Full Event Page</span>
          <ArrowRight />
        </div>
        <div className="">
          <PoweredBy />
        </div>
      </div>
    </Modal>
  );
};

export default EventDetails;
