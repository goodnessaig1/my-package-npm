import { v4 as uuidv4 } from "uuid";
import type { SelectedTicket } from "../components/Tickets/TicketsCounter";

export const GET_PAYSTACK_KEY = (isTest: boolean) =>
  isTest
    ? "pk_test_b9c556369fc74860f7f267257c0f92c872792fd7"
    : "pk_live_9ad4baa113f026b2507c13522e05fd2dda0e871c";

export const GET_BASE_URL = (isTest: boolean) =>
  isTest ? "https://test.gruve.vercel.app" : "https://beta.gruve.events";

export const GET_BACKEND_URL = (isTest: boolean) =>
  isTest ? "https://backend.gruve.events" : "https://secure.gruve.events";

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

export function findTicketTypeIdWithHighestQuantity(tickets: any) {
  let highestQuantity = 0;
  let highestQuantityTicketTypeId = null;

  tickets.forEach((ticket: any) => {
    if (ticket.quantity > highestQuantity) {
      highestQuantity = ticket.quantity;
      highestQuantityTicketTypeId = ticket._ticketType;
    }
  });

  return highestQuantityTicketTypeId;
}

export function applyDiscount(
  tickets: any[],
  ticketTypeId: number,
  count: number,
  eventCurrency: string,
  discountAmount: number,
  discountType: "AMOUNT" | "PERCENT",
  cost: Record<number, number>
): [any[], number] {
  let discountApplied = 0;
  let discountAmountApplied = 0;

  const updatedTickets = tickets.map((ticket) => ({ ...ticket }));

  for (let i = 0; i < updatedTickets.length && discountApplied < count; i++) {
    const ticket = updatedTickets[i];
    const currentType = ticket.ticketTypeId;

    if (
      (currentType === ticketTypeId || ticketTypeId === 0) &&
      !ticket.isDiscounted
    ) {
      const ticketCost = cost[currentType];
      const calculatedDiscount =
        discountType === "AMOUNT"
          ? discountAmount
          : (ticketCost * discountAmount) / 100;

      ticket.appliedDiscount = calculatedDiscount;

      ticket.discountAmount =
        discountType === "PERCENT"
          ? discountAmount
          : `${eventCurrency === "USD" ? "$" : "₦"}${discountAmount}`;

      ticket.isDiscounted = true;

      discountAmountApplied += calculatedDiscount;
      discountApplied++;
    }
  }

  return [updatedTickets, discountAmountApplied];
}

export function updatedTickets(tickets: any[], eventDetails: any) {
  if (eventDetails) {
    return eventDetails.map((detail: any, index: number) => {
      const ticket = tickets.find((t) => t.sectionName === detail.sectionName);

      const ticketTypeId = ticket ? ticket._ticketType : index + 1;
      const originalCost = ticket?.cost ?? detail.cost;

      let discountedCost = originalCost;

      if (detail?.earlyBird && isEarlyBirdActive(detail?.earlyBird)) {
        discountedCost =
          detail.discountedPrice !== undefined
            ? detail.discountedPrice
            : originalCost;
      }

      return {
        ...detail,
        ...(ticket || {}),
        quantity: detail?.quantity ?? 0,
        cost: originalCost,
        discountedCost,
        ticketName: ticket?.sectionName ?? detail.sectionName,
        ticketTypeId: ticketTypeId,
      };
    });
  }
}

export function isEarlyBirdActive(earlyBird: {
  endDate: string;
  endTime: string;
}) {
  if (!earlyBird?.endDate || !earlyBird?.endTime) return false;

  const endDate = new Date(earlyBird.endDate);

  const [time, period] = earlyBird.endTime.split(" ");
  const [hours, minutes] = time.split(":").map(Number);

  let hours24 = hours;
  if (period.toUpperCase() === "PM" && hours !== 12) hours24 += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours24 = 0;

  endDate.setUTCHours(hours24, minutes, 0, 0);

  const now = new Date();

  return now <= endDate;
}
