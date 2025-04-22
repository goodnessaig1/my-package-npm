import React, { useState, useEffect } from "react";
import EventDetails from "./EventDetails/EventDetails";
import { ComponentProps, IEventType, QuestionList } from "../types/event-types";
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
  guests: any[]; // No given structure for guests
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

const GruveEventWidgets: React.FC<ComponentProps> = ({
  eventAddress,
  isTest = false,
}) => {
  const [eventDetails, setEventDetails] = useState<IEventData | null>(null);
  const [eventDetailsWithId, setEventDetailsWithId] =
    useState<IEventType | null>(null);
  const [questions, setQuestions] = useState<QuestionList>([]);

  const BASE_URL = isTest
    ? "http://localhost:3000/api"
    : "https://beta.gruve.events/api";

  const BACKEND_URL = isTest
    ? "https://backend.gruve.events"
    : "https://secure.gruve.events";

  const [rates, setRates] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchRates = async () => {
    try {
      const response = await fetch(`${BASE_URL}/fetch-rates`);

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
        `${BASE_URL}/fetch-event-details?eventAddress=${eventAddress}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const balances = await result?.balances;
      setQuestions(result?.questions);
      setLoading(false);
      setEventDetails(result?.data);
      setEventDetailsWithId(result?.eventDetailsWithId);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setOpen(true);
    if (!eventDetails) {
      fetchEventDetails();
      fetchRates();
    }
  };

  return (
    <div className="">
      <div onClick={handleClick} className="event-details-btn">
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
          BACKEND_URL={BACKEND_URL}
          BASE_URL={BASE_URL}
        />
      )}
    </div>
  );
};

export default GruveEventWidgets;
