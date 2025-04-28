import React, { useState } from "react";
import EventDetails from "./EventDetails/EventDetails";
import {
  IEventType,
  QuestionList,
  TicketDiscountList,
} from "../../types/echo-test-goody";
import "./index.css";
import "../styles/global.css";
import Loader from "./Loader/Loader";

export interface TagsOptions {
  value: string;
  label: string;
}

export interface IEventInfo {
  eventImage: string;
  eventName: string;
  eventOrganizer: string;
  description: string;
  eventType: string;
  eventCategory: string;
  isOnlineEvent: boolean;
  eventLocation: Record<string, string>;
  tags: { value: string; label: string }[];
  _tags: string[];
  _eventName: string;
  eventLink?: any;
}

export interface IEventData {
  timeZone: any;
  Attendee?: any;
  tags?: TagsOptions[];
  currency?: string;
  info?: IEventInfo;
  schedules: {
    endDate: string | number | Date;
    startTime: any;
    endTime: any;
    timeZoneOffset: any;
    date: string;
    timeSlots: { startTime: string; endTime: string }[];
  }[];
  hosts: {
    name: string;
    image: string;
    bio: string;
  }[];
  guests: any[];
  tickets: IITickets;
}

export type IITickets = {
  _ticketType: string;
  sectionName: string;
  quantity: number;
  cost: number;
  description: string;
  minOrder: number;
  maxOrder: number;
  ticketType: string;
  isDisabled?: boolean;
}[];

export interface GruveEventWidgetsProps {
  eventAddress: string;
  isTest?: boolean;
  config?: {
    buttonColor: string;
  };
}

const GruveEventWidgets: React.FC<GruveEventWidgetsProps> = ({
  eventAddress,
  isTest = false,
  config,
}) => {
  const [eventDetails, setEventDetails] = useState<IEventData | null>(null);
  const [eventDetailsWithId, setEventDetailsWithId] =
    useState<IEventType | null>(null);
  const [questions, setQuestions] = useState<QuestionList>([]);
  const [coupons, setCoupons] = useState<any>([]);
  const [ticketBalances, setTicketBalances] = useState([]);
  const [couponData, setCouponData] = useState<TicketDiscountList>([]);

  const BASE_URL = isTest
    ? "http://localhost:3000"
    : "https://beta.gruve.events";

  const BACKEND_URL = isTest
    ? "https://backend.gruve.events"
    : "https://secure.gruve.events";

  const [rates, setRates] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchRates = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/fetch-rates`);

      const result = await response.json();
      setRates(result);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/api/fetch-event-details?eventAddress=${eventAddress}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setQuestions(result?.questions);
      setTicketBalances(result?.balances);
      setLoading(false);
      setEventDetails(result?.data);
      setEventDetailsWithId(result?.eventDetailsWithId);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupon = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/discount/check/${eventAddress.toLowerCase()}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setCouponData(result?.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = () => {
    fetchCoupon();
    setOpen(true);
    if (!eventDetails) {
      fetchEventDetails();
      fetchRates();
    }
  };

  const buttonColor = config?.buttonColor ? config?.buttonColor : "#ea445a";

  return (
    <div className="my-package-container">
      <div
        onClick={handleClick}
        style={{ background: buttonColor }}
        className="event-details-btn"
      >
        Get ticket
      </div>
      {loading ? (
        <div className="loader-container_">
          <Loader />
        </div>
      ) : (
        <EventDetails
          eventDetails={eventDetails}
          open={open}
          eventDetailsWithId={eventDetailsWithId}
          setOpen={setOpen}
          questions={questions}
          rates={rates}
          coupons={coupons}
          couponData={couponData}
          ticketBalances={ticketBalances}
          BACKEND_URL={BACKEND_URL}
          BASE_URL={BASE_URL}
          buttonColor={buttonColor}
        />
      )}
    </div>
  );
};

export default GruveEventWidgets;
