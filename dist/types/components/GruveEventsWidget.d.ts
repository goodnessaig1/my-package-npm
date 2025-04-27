import React from "react";
import "./index.css";
import "../styles/global.css";
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
    tags: {
        value: string;
        label: string;
    }[];
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
        timeSlots: {
            startTime: string;
            endTime: string;
        }[];
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
declare const GruveEventWidgets: React.FC<GruveEventWidgetsProps>;
export default GruveEventWidgets;
