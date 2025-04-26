import React, { Component, ChangeEvent } from "react";

export interface ComponentProps {
  eventAddress: string;
  isTest?: boolean;
}

export type QuestionItem = {
  id: string;
  sectionName: string;
  question: string;
  isRequired: string;
  answerType: string | null;
  options: string | null;
  eventAddress: string;
  ticketId: number;
  createdAt: string;
  updatedAt: string;
};

type SavedEvent = {
  accountAddress: string;
};

type DiscountType = "PERCENT" | "FIXED";

export interface TicketDiscount {
  utilityLeft: number;
  isEnabled: boolean;
  limitPerUser: number;
  ticketType: number;
  discountValue: number;
  discountType: DiscountType;
  code: string;
  expireAt: string;
}

export type TicketDiscountList = TicketDiscount[];

export type IEventType = {
  id: string;
  eventAddress: string;
  eventName: string;
  createdAt: string; // ISO date string
  startAt: string; // ISO date string
  endAt: string; // ISO date string
  eventImg: string;
  organiser: string;
  tags: string[]; // assuming array of strings
  category: string;
  hosts: string; // appears to be a serialized array (e.g., "[]"), clarify if otherwise
  location: string;
  ticketTypeCount: number;
  ticketsCount: number;
  creator: string;
  minPrice: number;
  maxPrice: number;
  eventType: number;
  currency: string;
  eventLink: string;
  savedEvents: SavedEvent[];
};

// Array type:
export type QuestionList = QuestionItem[];

// Declartion file for types and exports from npm-package
declare module "event-types" {
  export interface TextInputProps {
    type?: string;
    label?: string;
    value?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    name?: string;
    placeholder?: string;
    id?: any;
  }

  export interface ComponentProps {
    eventAddress: string;
    isTest?: boolean;
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

  export interface SelectedTicket {
    _ticketType: string;
    quantity: number;
    cost: number;
    ticketName: string;
  }

  export interface IEventInfo {
    eventImage: string;
    eventName: string;
    eventOrganizer: string;
    description: string;
    eventType: string;
    eventCategory: string;
    isOnlineEvent: boolean;
    eventLocation: Record<string, string>; // empty object
    tags: { value: string; label: string }[];
    _tags: string[];
    _eventName: string;
    eventLink?: any;
  }

  export type TagsOptions = {
    value: string;
    label: string;
  };

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

  export const GruveEventWidgets: React.FC<ComponentProps>;
  export const Textbox: React.FC<TextInputProps>;

  export interface DatePickerProps {
    placeholder?: string;
    value?: Date;
    onChange?: (event: any) => void;
    className?: string;
  }

  export const DatePicker: React.FC<DatePickerProps>;

  export interface CustomDropdownProps {
    dataSource?: any[] | any;
    fields?: { text: any; value: any };
    placeholder?: string;
    value?: string;
    onChange?: (event: any) => void;
    className?: string;
    name?: string;
    label?: string;
    id?: any;
  }

  export const CustomDropdown: React.FC<CustomDropdownProps>;

  export interface CheckboxProps {
    className?: string;
    id?: any;
    label?: string;
  }

  export const CheckBox: React.FC<CheckboxProps>;

  export interface SelectorProps {
    label?: string;
    action?: any[];
    onSelect?: (value: any) => void;
    className?: string;
  }

  export const Selector: React.FC<SelectorProps>;

  export interface MultiSelectComponentProps {
    dataSource?: any[];
    placeholder?: string;
    fields?: object;
    onChange?: (selectedItems: any) => void;
    className?: string;
  }

  export const MultiSelectDropdown: React.FC<MultiSelectComponentProps>;

  interface TimePickerProps {
    placeholder?: string | undefined;
    className?: string | undefined;
    minTime?: Date | undefined;
    maxTime?: Date | undefined;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  }

  export const TimePicker: React.FC<TimePickerProps>;

  export interface FileSelectEventArgs {
    filesData: any[];
  }

  interface UploaderProps {
    fileTypes?: any[];
    fileCount?: number;
    onFilesChange?: (files: any[]) => void;
  }

  export const Uploader: React.FC<UploaderProps>;

  interface GridProps {
    pageSize?: number;
    dataSource?: any[];
    allowPaging?: boolean;
    columns?: any[] | undefined;
    columnName?: string;
    className?: string;
  }

  export const Grid: React.FC<GridProps>;
}
