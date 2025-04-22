export const PAYSTACK_KEY = "pk_test_b9c556369fc74860f7f267257c0f92c872792fd7";

import { v4 as uuidv4 } from "uuid";
import { SelectedTicket } from "../components/Tickets/TicketsCounter";

type TimeDiffResult = {
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export const timeDiff = (date: Date, now?: number): TimeDiffResult => {
  const currentTime = now ?? Date.now();

  if (currentTime > date.getTime()) {
    return {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
    };
  }

  let d = Math.abs(currentTime - date.getTime()) / 1000;

  const r: TimeDiffResult = {
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  };

  const s: Record<keyof TimeDiffResult, number> = {
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  (Object.keys(s) as (keyof TimeDiffResult)[]).forEach((key) => {
    r[key] = Math.floor(d / s[key]);
    d -= r[key] * s[key];
  });

  return r;
};

export const sanitizeUrl = (url: string) => {
  if (!url) return "";

  url = url.replace(/^(https?:\/\/)+/, "https://");
  url = url.replace(/^(www\.)+/, "www.");

  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  return url;
};

export const formatCurrency = (valueInNumber: number) => {
  const roundedValue = Math.ceil(valueInNumber * 100) / 100;

  return roundedValue.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function expandTickets(
  ticketArrays: SelectedTicket[]
): SelectedTicket[] {
  const newTickArray: SelectedTicket[] = [];

  ticketArrays.forEach((eachTickets) => {
    if (eachTickets.quantity > 1) {
      new Array(eachTickets.quantity).fill(1).map(() =>
        newTickArray.push({
          ...eachTickets,
          quantity: 1,
          id: uuidv4().replace("-", ""),
        })
      );
      return;
    }
    newTickArray.push(eachTickets);
  });

  return newTickArray;
}

export const arrangeByDate = (data: any[]) =>
  data.sort((a, b) => a.ticketId - b.ticketId);

export function randomizeLastFourDigits(walletAddress: string): string {
  const addressString = String(walletAddress);

  let randomHex = "";
  for (let i = 0; i < 8; i++) {
    randomHex += Math.floor(Math.random() * 16).toString(16);
  }

  const randomizedAddress =
    addressString.slice(0, -randomHex.length) + randomHex;

  return randomizedAddress;
}

export const createUserAnswerArray = (tickets: any[]) => {
  return tickets.flatMap((ticket) =>
    ticket.questions.map((question: any) => ({
      answer: question.answer ?? "",
      userAddress: randomizeLastFourDigits(
        "0x0000000000000000000000000000000000000002"
      ),
      eventQuestionsId: question.id,
    }))
  );
};
