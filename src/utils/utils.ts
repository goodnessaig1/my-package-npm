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

// export function updatedTickets(
//   tickets: any[],
//   eventDetails: any,
//   coupons: any[]
// ) {
//   if (eventDetails) {
//     return eventDetails.map((detail: any, index: number) => {
//       const ticket = tickets.find((t) => t.ticketName === detail.sectionName);

//       const ticketTypeId = ticket ? ticket.ticketTypeId : index + 1;
//       const coupon = coupons.find(
//         (c) => c.ticketType === ticketTypeId && c.isEnabled
//       );

//       const originalCost = ticket?.cost ?? detail.cost;
//       let discountedCost = originalCost;

//       if (coupon) {
//         if (coupon.discountType === "PERCENT") {
//           discountedCost =
//             originalCost - originalCost * (coupon.discountValue / 100);
//         } else {
//           discountedCost = Math.max(0, originalCost - coupon.discountValue);
//         }
//       }

//       return {
//         ...detail,
//         ...(ticket || {}),
//         quantity: detail?.quantity ?? 0,
//         cost: originalCost,
//         discountedCost,
//         ticketName: ticket?.ticketName ?? detail.sectionName,
//         ticketTypeId: ticketTypeId,
//       };
//     });
//   }
// }

export function updatedTickets(
  tickets: any[],
  eventDetails: any,
  coupons: any[]
) {
  if (eventDetails) {
    return eventDetails.map((detail: any, index: number) => {
      const ticket = tickets.find((t) => t.ticketName === detail.sectionName);

      const ticketTypeId = ticket ? ticket.ticketTypeId : index + 1;
      const coupon = coupons.find(
        (c) => c.ticketType === ticketTypeId && c.isEnabled
      );

      const originalCost = ticket?.cost ?? detail.cost;
      let discountedCost = originalCost;

      if (coupon && isEarlyBirdActive(coupon.expireAt)) {
        if (coupon.discountType === "PERCENT") {
          discountedCost =
            originalCost - originalCost * (coupon.discountValue / 100);
        } else {
          discountedCost = Math.max(0, originalCost - coupon.discountValue);
        }
      } else {
        discountedCost = originalCost;
      }

      return {
        ...detail,
        ...(ticket || {}),
        quantity: detail?.quantity ?? 0,
        cost: originalCost,
        discountedCost,
        ticketName: ticket?.ticketName ?? detail.sectionName,
        ticketTypeId: ticketTypeId,
      };
    });
  }
}

export function isEarlyBirdActive(timestamp: string) {
  if (!timestamp) {
    return false;
  }

  const currentTime = Date.now();
  return currentTime <= Number(timestamp);
}
