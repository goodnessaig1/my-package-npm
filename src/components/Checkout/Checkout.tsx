import React, { useEffect, useState } from "react";
import "./Checkout.css";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import { IEventType, QuestionList } from "../../types/event-types";
import TicketForm, {
  HandlePurchaseEventParams,
  ITicketListed,
  SubmittedTicket,
} from "./TicketForm";
import {
  createUserAnswerArray,
  PAYSTACK_KEY,
  randomizeLastFourDigits,
} from "../../utils/utils";
import paystackModal from "@paystack/inline-js";

interface CheckoutProps {
  handleCloseModal: () => void;
  setOpenCheckout: (value: boolean) => void;
  setOpenPaymentsModal: (value: boolean) => void;
  listedTickets: ITicketListed[];
  eventDetailsWithId: IEventType | null;
  questionsToDisplay: QuestionList;
  currentCurrency: string;
  openPaymentsModal: boolean;
  rates: Record<string, number>;
  selectedTickets: SelectedTicket[];
  setShowTicketPurchaseSuccess: (val: boolean) => void;
  setListedTickets: React.Dispatch<React.SetStateAction<ITicketListed[]>>;
  setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
  BACKEND_URL: string;
  BASE_URL: string;
}

const Checkout: React.FC<CheckoutProps> = ({
  handleCloseModal,
  setOpenCheckout,
  listedTickets,
  setListedTickets,
  selectedTickets,
  setSelectedTickets,
  questionsToDisplay,
  eventDetailsWithId,
  setShowTicketPurchaseSuccess,
  setOpenPaymentsModal,
  currentCurrency,
  rates,
  openPaymentsModal,
  BACKEND_URL,
  BASE_URL,
}) => {
  const [tickets, setTickets] = useState<ITicketListed[]>(listedTickets);
  const [isMultiple, setIsMultiple] = useState("yes");
  const [userAnswerArray, setUserAnswerArray] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const rate = rates[`NGN${currentCurrency}`];

  useEffect(() => {
    if (!tickets.length) return;

    const updatedTickets = tickets.map((eachTicket) => {
      const questions =
        isMultiple === "no"
          ? questionsToDisplay.slice(0, 1)
          : questionsToDisplay.filter(
              (q) => q.sectionName === eachTicket.ticketName
            );

      return {
        ...eachTicket,
        requiredQuestion: questions,
      };
    });

    setTickets(updatedTickets);
  }, [isMultiple, questionsToDisplay, listedTickets]);

  const handleFreeEventHandler = async ({
    walletAddress,
    eventId,
    eventAddress,
    email,
    tickets,
    userAnswerArray = [],
  }: HandlePurchaseEventParams): Promise<void> => {
    const data = {
      address: walletAddress,
      eventId,
      eventAddress,
      email,
      amount: 0,
      tickets,
      // discountCode, // make sure this is defined in scope
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/add_free_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowTicketPurchaseSuccess(true);
        await submitUserAnswers(userAnswerArray);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      const errorMessage =
        e?.response?.data?.message || e.message || "Something went wrong";
      setErrorMessage(errorMessage);
    }
  };

  const submitUserAnswers = async (userAnswerArray: any[]) => {
    if (!Array.isArray(userAnswerArray) || userAnswerArray.length === 0) return;

    try {
      const response = await fetch(`${BASE_URL}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAnswerArray }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit answers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting user answers:", error);
    }
  };

  useEffect(() => {
    if (!tickets) return;
    let totalPrice = 0;
    tickets?.forEach((eachTickets) => {
      totalPrice += eachTickets?.cost * eachTickets?.quantity;
    });
    setTotalPrice(totalPrice);
  }, [tickets]);

  const handleSubmit = async (data: SubmittedTicket[]): Promise<void> => {
    let totalPrice = 0;
    data?.forEach((eachTickets) => {
      totalPrice += eachTickets?.cost * eachTickets?.quantity;
    });

    const userAnswerArray = createUserAnswerArray(data);
    setUserAnswerArray(userAnswerArray);
    if (totalPrice === 0) {
      handleFreeEventHandler({
        walletAddress: randomizeLastFourDigits(
          "0x0000000000000000000000000000000000000002"
        ),
        eventId: eventDetailsWithId?.id,
        eventAddress: eventDetailsWithId?.eventAddress,
        email: "package@gmail.com",
        tickets: data,
        userAnswerArray,
      });
    } else {
      setOpenPaymentsModal(true);
    }
  };

  const coupon = "";

  const handleDeleteTicket = (indexToRemove: number) => {
    const removedTicket = listedTickets[indexToRemove];
    const updatedListedTickets = listedTickets.filter(
      (_, index) => index !== indexToRemove
    );
    setListedTickets(updatedListedTickets);

    if (updatedListedTickets.length === 0) {
      setOpenCheckout(false);
    }

    const updatedSelectedTickets = selectedTickets
      .map((ticket) => {
        if (
          ticket._ticketType === removedTicket._ticketType &&
          ticket.ticketName === removedTicket.ticketName
        ) {
          if (ticket.quantity > 1) {
            return {
              ...ticket,
              quantity: ticket.quantity - 1,
            };
          } else {
            return null;
          }
        }
        return ticket;
      })
      .filter((ticket): ticket is SelectedTicket => ticket !== null);

    setSelectedTickets(updatedSelectedTickets);

    const updatedTickets = tickets.filter(
      (_, index) => index !== indexToRemove
    );
    setTickets(updatedTickets);
  };

  const handlePaymentHandler = async ({
    walletAddress,
    eventId,
    email,
    eventAddress,
    tickets,
  }: HandlePurchaseEventParams): Promise<void> => {
    let newEmail: any = email?.split("++gruve");
    newEmail = newEmail[0] + newEmail[1];
    email = email?.includes("++gruve") ? newEmail : email;
    const payload = {
      address:
        walletAddress ??
        randomizeLastFourDigits("0x0000000000000000000000000000000000000002"),
      eventId,
      eventAddress,
      email,
      tickets,
      ...(coupon ? { discountCode: coupon } : {}),
    };

    let _request;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/paystack`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      _request = result?.data;

      const data = {
        email,
        amount: _request.amountToPay,
        tickets: tickets,
        eventAddress,
      };
      const amount = totalPrice * rate * 100;

      const _payStack = new paystackModal();

      _payStack.newTransaction({
        key: PAYSTACK_KEY,
        amount: amount.toString() === "0" ? 1 : amount,
        currency: "NGN",
        email,
        reference: _request.paystackOrder.reference,
        metadata: {
          custom_fields: [
            {
              display_name: "Email",
              variable_name: "email",
              value: email,
            },
            {
              display_name: "Amount",
              variable_name: "amount",
              value: amount,
            },
            {
              display_name: "Tickets",
              variable_name: "tickets",
              value: tickets?.length || 0,
            },
            {
              display_name: "Event Address",
              variable_name: "event_address",
              value: eventAddress,
            },
          ],
        },
        onLoad() {},
        onSuccess(transaction) {
          setShowTicketPurchaseSuccess(true);
          setOpenPaymentsModal(false);
        },
        onCancel() {
          setIsSubmitting(false);
        },
        onError() {
          setIsSubmitting(false);
        },
      });

      await submitUserAnswers(userAnswerArray);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    setOpenCheckout(false);
  };

  const handleClosePayment = () => {
    setOpenPaymentsModal(false);
  };

  return (
    <div className="">
      <div className="modal">
        <TicketForm
          rates={rates}
          handleSubmit={handleSubmit}
          handlePaymentHandler={handlePaymentHandler}
          handleCloseModal={handleCloseModal}
          eventDetailsWithId={eventDetailsWithId}
          isMultiple={isMultiple}
          setIsMultiple={setIsMultiple}
          goBack={handleGoBack}
          handleClosePayment={handleClosePayment}
          tickets={tickets}
          isSubmitting={isSubmitting}
          totalPrice={totalPrice}
          setErrorMessage={setErrorMessage}
          errorMessage={errorMessage}
          currentCurrency={currentCurrency}
          selectedTickets={selectedTickets}
          handleDeleteTicket={handleDeleteTicket}
          openPaymentsModal={openPaymentsModal}
        />
      </div>
    </div>
  );
};

export default Checkout;
