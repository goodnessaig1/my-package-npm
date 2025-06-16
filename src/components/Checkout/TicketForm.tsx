import React, { useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import DeleteIcon from "../../asset/DeleteIcon";
import { v4 as uuidv4 } from "uuid";
import { IEventType } from "../../../types/echo";
import OrderSummary from "../Payment/OrderSummary";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import BackArrow from "../../asset/BackArrow";
import CloseIcon from "../../asset/CloseIcon";
import Payment from "../Payment/Payment";
import { randomizeLastFourDigits } from "../../utils/utils";
import ClearErrorOnAnyChange from "./ClearError";
import WhatsAppInput from "./WhatsappInput";
import CancelIcon from "../../asset/CancelIcon";
import { ToggleSwitchOn } from "../../asset/ToggleOn";
import Tooltip from "../Tooltip/Tooltip";

interface Question {
  id: string;
  question: string;
  sectionName: string;
  isRequired: string;
}

export interface ITicketListed {
  discountedCost: number;
  _ticketType: string;
  ticketName: string;
  cost: number;
  quantity: number;
  ticketTypeId: number;
  id: string;
  requiredQuestion: Question[];
}

export interface SubmittedTicket {
  id: string;
  fullName: string;
  email: string;
  whatsAppNumber: string;
  cost: number;
  ticketName: string;
  quantity: number;
  answers: { id: string; answer: string; isRequired: string }[];
  ticketTypeId: number;
}

interface Props {
  selectedTickets: SelectedTicket[];
  currentCurrency: string;
  rates: Record<string, number>;
  eventDetailsWithId: IEventType | null;
  isMultiple: string;
  setIsMultiple: (val: string) => void;
  setDiscountCode: (val: string) => void;
  handlePaymentHandler: (val: any) => void;
  handleSubmit: (data: SubmittedTicket[]) => void;
  setErrorMessage: (val: string) => void;
  handleClosePayment: () => void;
  handleCloseModal: () => void;
  handleDeleteTicket: (index: number) => void;
  goBack: () => void;
  totalPrice: number;
  errorMessage: string;
  buttonColor: string;
  buttonTextColor: string;
  isSubmitting: boolean;
  openPaymentsModal: boolean;
  showApplyCoupon: boolean;
  handleCoupon: any;
  discountCode: any;
  coupon: any;
  couponAppliedAmount: any;
  tickets: ITicketListed[];
  couponError: string;
  setCouponError: (val: string) => void;
}

type UserAnswer = {
  questionId: string;
  answer: string;
};

export interface HandlePurchaseEventParams {
  walletAddress: string;
  eventId?: string;
  eventAddress?: string;
  email: string;
  tickets: any[];
  currency?: string;
  total?: number;
  userAnswerArray?: UserAnswer[];
}

const TicketForm: React.FC<Props> = ({
  eventDetailsWithId,
  selectedTickets,
  currentCurrency,
  rates,
  goBack,
  tickets,
  isMultiple,
  setIsMultiple,
  handleSubmit,
  totalPrice,
  isSubmitting,
  handleCloseModal,
  openPaymentsModal,
  handleClosePayment,
  handleDeleteTicket,
  handlePaymentHandler,
  setErrorMessage,
  errorMessage,
  handleCoupon,
  discountCode,
  showApplyCoupon,
  setDiscountCode,
  coupon,
  couponAppliedAmount,
  couponError,
  setCouponError,
  buttonColor,
  buttonTextColor,
}) => {
  const [data, setData] = useState<any>([]);
  const eventAddress = eventDetailsWithId?.eventAddress;

  const validateData = (data: SubmittedTicket[]) => {
    for (let entry of data) {
      if (!entry.fullName || !entry.email) {
        return "Please fill all user details.";
      }
      for (let q of entry.answers) {
        if (q.isRequired === "True" && (!q.answer || q.answer.trim() === "")) {
          return "Please answer all required questions.";
        }
      }
    }
    return "";
  };

  const uniqueQuestions = Array.from(
    new Map(
      tickets
        .flatMap((ticket) => ticket.requiredQuestion || [])
        .map((q) => [q.id, q])
    ).values()
  );

  const [appliedToggles, setAppliedToggles] = useState<any>({});
  const [answerError, setAnswerError] = useState("");

  const handleToggle = (questionId: any, value: any, setFieldValue: any) => {
    setAppliedToggles((prev: any) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));

    if (!value) return;

    tickets.forEach((ticket, idx) => {
      const hasSameQuestion = ticket.requiredQuestion?.some(
        (q) => q.id === questionId
      );
      if (hasSameQuestion) {
        setFieldValue(
          `question_${idx}_${questionId}`,
          !appliedToggles[questionId] ? value : ""
        );
      }
    });
  };

  const groupedTicketInfo = useMemo(() => {
    const map: Record<string, { count: number; firstIndex: number }> = {};

    tickets.forEach((ticket: ITicketListed, idx) => {
      const name = ticket.ticketName;
      if (!map[name]) {
        map[name] = { count: 0, firstIndex: idx };
      }
      map[name].count += 1;
    });

    return map;
  }, [tickets]);

  const initialValues =
    isMultiple === "yes"
      ? tickets.reduce((acc, _, index) => {
          acc["is_multiple"] = isMultiple;
          acc[`fullName_${index}`] = "";
          acc[`email_${index}`] = "";
          acc[`whatsAppNumber_${index}`] = "";
          return acc;
        }, {} as Record<string, string>)
      : {
          is_multiple: isMultiple,
          fullName: "",
          email: "",
          whatsAppNumber: "",
        };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={(values: any) => {
        let data: SubmittedTicket[] = [];

        if (isMultiple === "no") {
          const answers =
            uniqueQuestions.map((q) => ({
              questionId: q.id,
              answer: values[`quickQuestion_${q.id}`] || "",
              isRequired: q.isRequired,
              question: q?.question,
            })) || [];

          data = tickets.map((ticket) => ({
            id: ticket?.id ? ticket?.id : uuidv4().replace("-", ""),
            fullName: values.fullName,
            email: values.email,
            ...(values?.whatsAppNumber && {
              whatsAppNumber: values.whatsAppNumber,
            }),
            cost: ticket?.cost,
            quantity: ticket?.quantity,
            ticketName: ticket?.ticketName,
            ticketTypeId: ticket.ticketTypeId,
            answers: answers.filter((a) =>
              ticket.requiredQuestion?.some((rq) => rq.id === a.questionId)
            ),
          }));
        } else {
          data = tickets.map((ticket, index) => {
            const answers =
              ticket.requiredQuestion?.map((q) => ({
                answer: values[`question_${index}_${q.id}`] || "",
                isRequired: q.isRequired,
                question: q.question,
                questionId: q.id,
              })) || [];

            return {
              id: ticket?.id ? ticket?.id : uuidv4().replace("-", ""),
              fullName: values[`fullName_${index}`],
              cost: ticket?.cost,
              quantity: ticket?.quantity,
              ticketName: ticket?.ticketName,
              ticketTypeId: ticket.ticketTypeId,
              email: values[`email_${index}`],
              ...(values[`whatsAppNumber_${index}`] && {
                whatsAppNumber: values[`whatsAppNumber_${index}`],
              }),
              answers,
            };
          });
        }
        const isError = validateData(data);
        if (!isError) {
          setData(data);
          handleSubmit(data);
        } else {
          setErrorMessage(isError);
        }
      }}
    >
      {({ values, setFieldValue }) => (
        <Form>
          <div className="">
            {openPaymentsModal ? (
              <div className="">
                <Payment goBack={handleClosePayment} />
              </div>
            ) : (
              <div className="">
                <div className="gruve-echo-modal-top">
                  <div className="gruve-echo-back-arrow" onClick={goBack}>
                    <BackArrow />
                  </div>
                  <h3>Checkout</h3>
                  <div
                    onClick={handleCloseModal}
                    className="gruve-echo-close-icon"
                  >
                    <CloseIcon />
                  </div>
                </div>
                {tickets && tickets.length > 1 && (
                  <div className="gruve-echo-form-group gruve-echo-form-gr-t">
                    <label>Send tickets separately?</label>
                    <span>
                      Tickets will be emailed separately to each attendee based
                      on the quantity purchased.
                    </span>

                    <div className="gruve-echo-radio-options">
                      <label>
                        <Field
                          type="radio"
                          name="is_multiple"
                          value="yes"
                          className="custom-radio"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setIsMultiple(e.target.value);
                          }}
                        />
                        <span>Yes</span>
                      </label>
                      <label>
                        <Field
                          type="radio"
                          name="is_multiple"
                          value="no"
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setIsMultiple(e.target.value);
                          }}
                          className="custom-radio"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                )}
                {isMultiple === "no" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      className="gruve-echo-form-group gruve-echo-ticket-section"
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="gruve-echo-form-items">
                        <div className="gruve-echo-form-cont">
                          <label htmlFor="fullName">Receiver's Full Name</label>
                          <Field name="fullName" placeholder="Full Name" />
                        </div>
                        <div className="gruve-echo-form-cont">
                          <label htmlFor="email">Receiver's Email</label>
                          <Field name="email" placeholder="Email" />
                        </div>
                        <WhatsAppInput
                          index={null}
                          fieldName={`whatsAppNumber`}
                        />
                      </div>

                      {uniqueQuestions && uniqueQuestions?.length > 0 && (
                        <div className="gruve-echo-questions-container">
                          <h3 className="">Quick Questions</h3>
                          <div className="gruve-echo-questionss">
                            {uniqueQuestions.map((q, i) => (
                              <div
                                className="gruve-echo-question-card"
                                key={q.id + i}
                              >
                                <label>
                                  {q.question}
                                  {q?.isRequired === "True" && (
                                    <span className="">*</span>
                                  )}
                                </label>
                                <Field
                                  name={`quickQuestion_${q.id}`}
                                  placeholder="Answer here"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {errorMessage && (
                      <div className="gruve-echo-error-msg">{errorMessage}</div>
                    )}
                  </div>
                )}
                {isMultiple === "yes" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {tickets.map((ticket, index) => {
                      const group = groupedTicketInfo[ticket.ticketName];
                      const isFirstOfType =
                        group?.firstIndex === index && group?.count > 1;
                      return (
                        <div
                          key={
                            ticket.id
                              ? `${ticket.id}-${index}`
                              : `ticket-${index}`
                          }
                          className="gruve-echo-ticket-section"
                          style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <div className="gruve-echo-form-items">
                            <div className="gruve-echo-ticket-header">
                              <strong>
                                {ticket.ticketName} {index + 1}
                              </strong>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteTicket(index);
                                  setFieldValue(`fullName_${index}`, "");
                                  setFieldValue(`email_${index}`, "");
                                  setFieldValue(`whatsAppNumber_${index}`, "");
                                }}
                                className="gruve-echo-delete-btn"
                              >
                                <DeleteIcon />
                                <span>Delete</span>
                              </button>
                            </div>
                            <div className="gruve-echo-form-cont">
                              <label>Owners Fullname</label>
                              <Field
                                name={`fullName_${index}`}
                                placeholder="Full Name"
                              />
                            </div>
                            <div className="gruve-echo-form-cont">
                              <label>Email</label>
                              <Field
                                name={`email_${index}`}
                                placeholder="Email"
                              />
                            </div>
                            <WhatsAppInput
                              index={index}
                              fieldName={`whatsAppNumber_${index}`}
                            />
                          </div>

                          {ticket?.requiredQuestion?.length > 0 && (
                            <div className="gruve-echo-questions-container">
                              <h3 className="">Quick Questions</h3>
                              <div className="gruve-echo-questionss">
                                {ticket.requiredQuestion.map(
                                  (question, qIndex) => {
                                    const fieldName = `question_${index}_${question.id}`;
                                    const answerValue = values[fieldName];
                                    return (
                                      <div
                                        className="gruve-echo-question-card"
                                        key={question.id + qIndex}
                                      >
                                        <label>
                                          {question.question}
                                          {question.isRequired === "True" && (
                                            <span>*</span>
                                          )}
                                        </label>
                                        <Field
                                          name={fieldName}
                                          placeholder="Answer here"
                                        />

                                        {isFirstOfType && (
                                          <div
                                            className="gruve-echo-toggle-wrapper"
                                            style={{ marginTop: "8px" }}
                                          >
                                            <Tooltip
                                              text="Please provide an answer first"
                                              show={!answerValue}
                                              position="top"
                                            >
                                              <label className="gruve-echo-toggle-switch">
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    !!appliedToggles[
                                                      question.id
                                                    ]
                                                  }
                                                  onChange={() => {
                                                    answerValue &&
                                                      handleToggle(
                                                        question.id,
                                                        answerValue,
                                                        setFieldValue
                                                      );
                                                  }}
                                                />
                                                <span className="gruve-echo-slider">
                                                  <span className="gruve-echo-knob">
                                                    <span
                                                      className={`gruve-echo-icon-wrapper`}
                                                    >
                                                      {!!appliedToggles[
                                                        question.id
                                                      ] ? (
                                                        <ToggleSwitchOn
                                                          width="1rem"
                                                          height=".8rem"
                                                        />
                                                      ) : (
                                                        <CancelIcon />
                                                      )}
                                                    </span>
                                                  </span>
                                                </span>
                                              </label>
                                            </Tooltip>
                                            <span>
                                              Apply answer to all ticket
                                              questions
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {errorMessage && (
                      <div className="error">
                        <div className="gruve-echo-error-msg">
                          {errorMessage}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="gruve-echo-coupon-container">
                  <div className="gruve-echo-coupon-top">
                    <h3>
                      Coupon Code <span className="">(Optional)</span>
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="gruve-echo-coupon-input">
                      <Field
                        id="coupon"
                        name="coupon"
                        value={discountCode}
                        onChange={(e: any) => {
                          setDiscountCode(e.target.value);
                          setCouponError("");
                        }}
                        placeholder="Enter coupon"
                      />
                      <div
                        onClick={async () => {
                          if (discountCode) {
                            await handleCoupon(
                              eventAddress,
                              discountCode,
                              tickets
                            );
                          }
                        }}
                        className={`apply ${
                          !discountCode && "gruve-echo-disable"
                        }`}
                      >
                        {showApplyCoupon ? (
                          <div className="gruve-echo-loading-btn">
                            <div className="gruve-event-loader-spinner"></div>
                          </div>
                        ) : (
                          <>Apply</>
                        )}
                      </div>
                    </div>
                    {couponError && (
                      <div className="error">
                        <div className="gruve-echo-error-msg">
                          {couponError}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {totalPrice > 0 && (
            <OrderSummary
              rates={rates}
              currentCurrency={currentCurrency ?? "USD"}
              ticketsArray={selectedTickets}
              total={totalPrice}
              coupon={coupon}
              couponAppliedAmount={couponAppliedAmount}
              defaultCurrency={eventDetailsWithId?.currency}
            />
          )}

          {openPaymentsModal ? (
            <div className="gruve-echo-ctn-container">
              <div
                onClick={handleClosePayment}
                className="gruve-echo-go-back-btn"
              >
                Back
              </div>
              {isSubmitting ? (
                <div className="gruve-echo-loading-btn gruve-event-loader-container-order">
                  <div className="gruve-event-loader-spinner"></div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    handlePaymentHandler({
                      walletAddress: randomizeLastFourDigits(
                        "0x0000000000000000000000000000000000000002"
                      ),
                      eventId: eventDetailsWithId?.id,
                      eventAddress: eventDetailsWithId?.eventAddress,
                      email: "package@gmail.com",
                      tickets: data,
                    })
                  }
                  style={{ background: buttonColor, color: buttonTextColor }}
                  className="gruve-echo-submit-btn"
                >
                  Finalize payment
                </button>
              )}
            </div>
          ) : (
            <div className="gruve-echo-ctn-container">
              <div onClick={goBack} className="gruve-echo-go-back-btn">
                Back
              </div>
              {isSubmitting ? (
                <div className="gruve-echo-loading-btn gruve-event-loader-container-order">
                  <div className="gruve-event-loader-spinner"></div>
                </div>
              ) : (
                <button
                  style={{ background: buttonColor, color: buttonTextColor }}
                  type="submit"
                  className="gruve-echo-submit-btn"
                >
                  Proceed to Payment
                </button>
              )}
            </div>
          )}
          <ClearErrorOnAnyChange
            clearError={() => {
              setErrorMessage(""), setCouponError(""), setAnswerError("");
            }}
          />
        </Form>
      )}
    </Formik>
  );
};

export default TicketForm;
