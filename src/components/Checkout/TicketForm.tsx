import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import DeleteIcon from "../../asset/DeleteIcon";
import { v4 as uuidv4 } from "uuid";
import { IEventType } from "../../types/event-types";
import OrderSummary from "../Payment/OrderSummary";
import { SelectedTicket } from "../Tickets/TicketsCounter";
import BackArrow from "../../asset/BackArrow";
import CloseIcon from "../../asset/CloseIcon";
import Payment from "../Payment/Payment";
import { randomizeLastFourDigits } from "../../utils/utils";
import ClearErrorOnAnyChange from "./ClearError";

interface Question {
  id: string;
  question: string;
  sectionName: string;
  isRequired: string;
}

export interface ITicketListed {
  _ticketType: string;
  ticketName: string;
  cost: number;
  quantity: number;
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
  questions: { id: string; answer: string }[];
  ticketTypeId: number;
}

interface Props {
  selectedTickets: SelectedTicket[];
  currentCurrency: string;
  rates: Record<string, number>;
  eventDetailsWithId: IEventType | null;
  isMultiple: string;
  setIsMultiple: (val: string) => void;
  handlePaymentHandler: (val: any) => void;
  handleSubmit: (data: SubmittedTicket[]) => void;
  setErrorMessage: (val: string) => void;
  handleClosePayment: () => void;
  handleCloseModal: () => void;
  handleDeleteTicket: (index: number) => void;
  goBack: () => void;
  totalPrice: number;
  errorMessage: string;
  isSubmitting: boolean;
  openPaymentsModal: boolean;
  tickets: ITicketListed[];
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
}) => {
  const [data, setData] = useState<any>([]);

  const validateData = (data: SubmittedTicket[]) => {
    for (let entry of data) {
      if (!entry.fullName || !entry.email || !entry.whatsAppNumber) {
        return "Please fill all user details.";
      }
      for (let q of entry.questions) {
        if (!q.answer) return "Please answer all required questions.";
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

  return (
    <Formik
      initialValues={{ is_multiple: isMultiple }}
      enableReinitialize
      onSubmit={(values: any) => {
        let data: SubmittedTicket[] = [];

        if (isMultiple === "no") {
          const answers =
            uniqueQuestions.map((q) => ({
              id: q.id,
              answer: values[`quickQuestion_${q.id}`] || "",
            })) || [];

          data = tickets.map((ticket) => ({
            id: ticket?.id ? ticket?.id : uuidv4().replace("-", ""),
            fullName: values.fullName,
            email: values.email,
            whatsAppNumber: values.whatsAppNumber,
            cost: ticket?.cost,
            quantity: ticket?.quantity,
            ticketName: ticket?.ticketName,
            ticketTypeId: Number(ticket?._ticketType),
            questions: answers.filter((a) =>
              ticket.requiredQuestion?.some((rq) => rq.id === a.id)
            ),
          }));
        } else {
          data = tickets.map((ticket, index) => {
            const questions =
              ticket.requiredQuestion?.map((q) => ({
                id: q.id,
                answer: values[`question_${index}_${q.id}`] || "",
              })) || [];

            return {
              id: ticket?.id ? ticket?.id : uuidv4().replace("-", ""),
              fullName: values[`fullName_${index}`],
              cost: ticket?.cost,
              quantity: ticket?.quantity,
              ticketName: ticket?.ticketName,
              ticketTypeId: Number(ticket?._ticketType),
              email: values[`email_${index}`],
              whatsAppNumber: values[`whatsAppNumber_${index}`],
              questions,
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
                <div className="modal-top">
                  <div className="back-arrow" onClick={goBack}>
                    <BackArrow />
                  </div>
                  <h3>Checkout</h3>
                  <div onClick={handleCloseModal} className="close-icon">
                    <CloseIcon />
                  </div>
                </div>
                <div className="form-group form-gr-t">
                  <label>Send tickets separately?</label>
                  <span>
                    Tickets will be emailed separately to each attendee based on
                    the quantity purchased.
                  </span>

                  <div className="radio-options">
                    <label>
                      <Field
                        type="radio"
                        name="is_multiple"
                        value="yes"
                        className="custom-radio"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setIsMultiple(e.target.value);
                        }}
                        className="custom-radio"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                {isMultiple === "no" && (
                  <div
                    className="form-group ticket-section"
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div className="form-cont">
                      <label htmlFor="fullName">Receiver's Full Name</label>
                      <Field name="fullName" placeholder="Full Name" />
                    </div>
                    <div className="form-cont">
                      <label htmlFor="email">Receiver's Email</label>
                      <Field name="email" placeholder="Email" />
                    </div>
                    <div className="form-cont">
                      <label>Receiver's WhatsApp No</label>
                      <Field name="whatsAppNumber" placeholder="Phone" />
                    </div>

                    {uniqueQuestions && uniqueQuestions?.length > 0 && (
                      <div className="questions-container">
                        <h3 className="">Quick Questions</h3>
                        {uniqueQuestions.map((q, i) => (
                          <div className="question-card" key={q.id + i}>
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
                    )}
                    {errorMessage && (
                      <div className="error-msg">{errorMessage}</div>
                    )}
                  </div>
                )}
                {isMultiple === "yes" &&
                  tickets.map((ticket, index) => (
                    <div
                      key={ticket.id + index}
                      className="ticket-section"
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <div className="ticket-header">
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
                          className="delete-btn"
                        >
                          <DeleteIcon />
                          <span>Delete</span>
                        </button>
                      </div>
                      <div className="form-cont">
                        <label>Owners Fullname</label>
                        <Field
                          name={`fullName_${index}`}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="form-cont">
                        <label>Email</label>
                        <Field name={`email_${index}`} placeholder="Email" />
                      </div>
                      <div className="form-cont">
                        <label>WhatsApp No</label>
                        <Field
                          name={`whatsAppNumber_${index}`}
                          placeholder="Phone"
                        />
                      </div>

                      {ticket?.requiredQuestion &&
                        ticket?.requiredQuestion.length > 0 && (
                          <div className="questions-container">
                            <h3 className="">Quick Questions</h3>
                            {ticket.requiredQuestion?.map((question, i) => (
                              <div
                                className="question-card"
                                key={question.id + i}
                              >
                                <label>
                                  {question.question}
                                  {question?.isRequired === "True" && (
                                    <span className="">*</span>
                                  )}
                                </label>
                                <Field
                                  name={`question_${index}_${question.id}`}
                                  placeholder="Answer here"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      {errorMessage && (
                        <div className="error">
                          <div className="error-msg">{errorMessage}</div>
                        </div>
                      )}
                    </div>
                  ))}
                <div className="coupon-container">
                  <div className="coupon-top">
                    <h3>
                      Coupon Code <span className="">(Optional)</span>
                    </h3>
                  </div>
                  <div className="coupon-input">
                    <Field
                      id="coupon"
                      name="coupon"
                      placeholder="Enter coupon"
                    />
                    <div className="apply">Apply</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {totalPrice > 0 && (
            <OrderSummary
              rates={rates}
              currentCurrency={currentCurrency}
              ticketsArray={selectedTickets}
              total={totalPrice}
              defaultCurrency={eventDetailsWithId?.currency}
            />
          )}

          {openPaymentsModal ? (
            <div className="ctn-container">
              <div onClick={handleClosePayment} className="go-back-btn">
                Back
              </div>
              {isSubmitting ? (
                <div className="loading-btn">
                  <div className="loader-spinner"></div>
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
                  className="submit-btn"
                >
                  Finalize payment
                </button>
              )}
            </div>
          ) : (
            <div className="ctn-container">
              <div onClick={goBack} className="go-back-btn">
                Back
              </div>
              {isSubmitting ? (
                <div className="loading-btn">
                  <div className="loader-spinner"></div>
                </div>
              ) : (
                <button type="submit" className="submit-btn">
                  Proceed to Payment
                </button>
              )}
            </div>
          )}
          <ClearErrorOnAnyChange clearError={() => setErrorMessage("")} />
        </Form>
      )}
    </Formik>
  );
};

export default TicketForm;
