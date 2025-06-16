import React, { useEffect, useState } from "react";
import "./Checkout.css";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import { IEventType, QuestionList } from "../../../types/echo";
import TicketForm, {
  HandlePurchaseEventParams,
  ITicketListed,
  SubmittedTicket,
} from "./TicketForm";
import {
  applyDiscount,
  createUserAnswerArray,
  findTicketTypeIdWithHighestQuantity,
  GET_BACKEND_URL,
  GET_BASE_URL,
  GET_PAYSTACK_KEY,
  isEarlyBirdActive,
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
  setIsFree: (val: boolean) => void;
  setOnSuccess: (val: boolean) => void;
  setListedTickets: React.Dispatch<React.SetStateAction<ITicketListed[]>>;
  setSelectedTickets: React.Dispatch<React.SetStateAction<SelectedTicket[]>>;
  coupons: any[];
  updatedTicketsData: ITicketListed[];
  buttonColor: string;
  buttonTextColor: string;
  isTest: boolean;
  setIsListening: any;
  setOpenConfirmationModal: any;
  setPaymentDetails: any;
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
  coupons,
  updatedTicketsData,
  isTest,
  buttonColor,
  buttonTextColor,
  setIsListening,
  setOpenConfirmationModal,
  setPaymentDetails,
  setIsFree,
  setOnSuccess,
}) => {
  const [tickets, setTickets] = useState<ITicketListed[]>(listedTickets);
  const [isMultiple, setIsMultiple] = useState("yes");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [showApplyCoupon, setShowApplyCoupon] = useState(false);
  const [discountCodeRes, setDiscountCodeRes] = useState<{
    [key: string]: any;
  }>({});

  const [couponError, setCouponError] = useState<string>("");

  const max = findTicketTypeIdWithHighestQuantity(tickets);

  const rate = rates[`NGN${currentCurrency}`];
  const defaultCoupon =
    coupons.find((elem) => elem.ticketType === max) ?? coupons[0];
  const isTicketSupportAutoDis =
    defaultCoupon?.ticketTypeId > 0
      ? listedTickets.filter(
          (eachticket) => eachticket?._ticketType == defaultCoupon?.ticketType
        )?.length > 0
      : listedTickets.filter((eachticket) => eachticket?.cost > 0)?.length > 0;

  const [couponAppliedAmount, setCouponAppliedAmount] = useState(0);

  const [discountCode, setDiscountCode] = useState<string>(
    isTicketSupportAutoDis === true ? defaultCoupon?.code : ""
  );

  useEffect(() => {
    if (!tickets.length) return;

    const updatedTickets = tickets.map((eachTicket) => {
      let questions: any[] = [];

      if (isMultiple === "no") {
        questions = questionsToDisplay.filter(
          (q) => q.ticketId === eachTicket.ticketTypeId
        );
      } else {
        questions = questionsToDisplay.filter(
          (q) => q.sectionName === eachTicket.ticketName
        );
      }

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
  }: HandlePurchaseEventParams): Promise<void> => {
    const data = {
      address: walletAddress,
      eventId,
      eventAddress,
      email,
      amount: 0,
      tickets,
      discountCode,
    };

    setIsSubmitting(true);
    setTimeout(() => {
      setIsFree(true);
      setIsListening(true);
      setOpenConfirmationModal(true);
    }, 2000);
    try {
      const res = await fetch(`${GET_BACKEND_URL(isTest)}/api/add_free_event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setOnSuccess(true);
        setPaymentDetails(result);
        setShowTicketPurchaseSuccess(true);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      const errorMessage =
        e?.response?.data?.message || e.message || "Something went wrong";
      setErrorMessage(errorMessage);
    }
  };

  const handleSubmit = async (data: SubmittedTicket[]): Promise<void> => {
    let totalPrice = 0;
    data?.forEach((eachTickets) => {
      totalPrice += eachTickets?.cost * eachTickets?.quantity;
    });

    if (totalPrice === 0) {
      handleFreeEventHandler({
        walletAddress: randomizeLastFourDigits(
          "0x0000000000000000000000000000000000000002"
        ),
        eventId: eventDetailsWithId?.id,
        eventAddress: eventDetailsWithId?.eventAddress,
        email: "package@gmail.com",
        tickets: data,
      });
    } else {
      setOpenPaymentsModal(true);
    }
  };

  const coupon = couponAppliedAmount === 0 ? "" : discountCode;

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
      const res = await fetch(
        `${GET_BACKEND_URL(isTest)}/api/payment/paystack`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      _request = result?.data;
      setPaymentDetails(_request);
      setIsListening(true);
      // const data = {
      //   email,
      //   amount: _request.amountToPay,
      //   tickets: tickets,
      //   eventAddress,
      // };
      const amount = totalPrice * rate * 100;

      const _payStack = new paystackModal();

      _payStack.newTransaction({
        key: GET_PAYSTACK_KEY(isTest),
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
          setOpenConfirmationModal(true);
          setOpenPaymentsModal(false);
        },
        onCancel() {
          setIsSubmitting(false);
          setIsListening(false);
        },
        onError() {
          setIsSubmitting(false);
        },
      });

      // await submitUserAnswers(userAnswerArray);
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

  const handleCoupon = async (eventAddress: string, code: string) => {
    try {
      setShowApplyCoupon(true);
      const res = await fetch(`${GET_BACKEND_URL(isTest)}/api/discount/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventAddress,
          code: code.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setShowApplyCoupon(false);
      setDiscountCodeRes({});
      const coupon = data?.data as {
        utilityLeft: number;
        isEnabled: boolean;
        limitPerUser: number;
        ticketType: number;
        discountValue: number;
        discountType: "PERCENT" | "AMOUNT";
      };

      const eventCurrency = eventDetailsWithId?.currency
        ? eventDetailsWithId?.currency
        : "NGN";
      const costMap: any =
        updatedTicketsData &&
        updatedTicketsData
          .map((elem: any, index) => {
            const earlyBirdActive = isEarlyBirdActive(elem?.earlyBird);
            const finalCost = earlyBirdActive
              ? elem?.discountedPrice ?? elem?.cost ?? 0
              : elem?.cost ?? 0;

            return {
              ...elem,
              _ticketType: index + 1,
              cost: finalCost,
            };
          })
          .reduce(
            (result, value) => ({
              ...result,
              [value._ticketType]: value.cost,
            }),
            {}
          );

      const [modifiedTickets, discountAmountApplied] = applyDiscount(
        tickets.map((elem: any) => ({
          ...elem,
          discountAmount: 0,
          isDiscounted: false,
        })),
        coupon.ticketType,
        Math.min(coupon.utilityLeft, coupon.limitPerUser),
        eventCurrency,
        coupon.discountValue,
        coupon.discountType,
        costMap
      );

      setCouponAppliedAmount(discountAmountApplied);
      setTickets(modifiedTickets);
    } catch (e: any) {
      setDiscountCodeRes({
        ...discountCodeRes,
        message: e?.response?.data.message,
      });
      setShowApplyCoupon(false);
      setCouponError(e.message);
    }
    return;
  };

  const generateTicketTypes = (
    ticketArray: ITicketListed[],
    currentCurrency: string
  ) => {
    if (!ticketArray || ticketArray.length === 0) return;

    let totalPrice = 0;

    ticketArray.forEach((eachTicket) => {
      const ticketCost =
        eachTicket.discountedCost !== eachTicket.cost
          ? eachTicket.discountedCost
          : eachTicket.cost;

      totalPrice += ticketCost * eachTicket.quantity;
    });

    const defaultCurrency = eventDetailsWithId?.currency ?? "NGN";

    setTotalPrice(
      (totalPrice - couponAppliedAmount) *
        (rates[`${currentCurrency}${defaultCurrency}`] ?? 1)
    );
  };

  useEffect(() => {
    if (tickets) {
      generateTicketTypes(tickets, currentCurrency);
    }
  }, [tickets, currentCurrency, couponAppliedAmount]);

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
          handleCoupon={handleCoupon}
          handleDeleteTicket={handleDeleteTicket}
          openPaymentsModal={openPaymentsModal}
          discountCode={discountCode}
          setDiscountCode={setDiscountCode}
          showApplyCoupon={showApplyCoupon}
          coupon={coupon}
          couponError={couponError}
          buttonColor={buttonColor}
          buttonTextColor={buttonTextColor}
          setCouponError={setCouponError}
          couponAppliedAmount={couponAppliedAmount}
        />
      </div>
    </div>
  );
};

export default Checkout;
