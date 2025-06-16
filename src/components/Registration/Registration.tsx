import React, { JSX } from "react";
import "./Registration.css";
import BackArrow from "../../asset/BackArrow";
import CloseIcon from "../../asset/CloseIcon";
import { IEventData, IRegistrationQuestion } from "../GruveEventsWidget";
import { ErrorMessage, Field, Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";
import { GET_BACKEND_URL } from "../../utils/utils";
import WhatsAppInput from "../Checkout/WhatsappInput";
import LinkedContent from "./LinkContent";

type InitialValues = Record<string, string | boolean | string[]>;
type FormValues = Record<string, string | boolean | string[]>;

interface RegistrationProps {
  handleCloseModal: () => void;
  setOpenRegistration: (value: boolean) => void;
  setShowRegistrationSuccess: (value: boolean) => void;
  setUserEmail: (value: string) => void;
  eventData: IEventData | null;
  creator: string | undefined;
  address: string | undefined;
  isTest: boolean;
}

const Registration: React.FC<RegistrationProps> = ({
  handleCloseModal,
  setOpenRegistration,
  eventData,
  creator,
  address,
  isTest,
  setShowRegistrationSuccess,
  setUserEmail,
}) => {
  const handleGoBack = () => {
    setOpenRegistration(false);
  };

  const initialQuestionsValue =
    eventData &&
    eventData.registrationQuestions.reduce<InitialValues>((acc, question) => {
      if (question.type === "multiple") acc[question.id] = [];
      else if (["terms", "checkbox"].includes(question.type))
        acc[question.id] = false;
      else acc[question.id] = "";
      return acc;
    }, {});

  const validationSchema =
    eventData &&
    Yup.object().shape(
      eventData.registrationQuestions.reduce<Record<string, Yup.AnySchema>>(
        (acc, question) => {
          if (question.required) {
            switch (question.type) {
              case "multiple":
                acc[question.id] = Yup.array()
                  .min(1, "Select at least one option")
                  .required("This field is required");
                break;
              case "terms":
              case "checkbox":
                acc[question.id] = Yup.boolean().oneOf(
                  [true],
                  "This field must be accepted"
                );
                break;
              case "email":
                acc[question.id] = Yup.string()
                  .email("Invalid email")
                  .required("This field is required");
                break;
              case "website":
                acc[question.id] = Yup.string()
                  .url("Invalid URL")
                  .required("This field is required");
                break;
              default:
                acc[question.id] = Yup.string().required(
                  "This field is required"
                );
            }
          }
          return acc;
        },
        {}
      )
    );

  const renderField = (
    question: IRegistrationQuestion,
    formikProps: FormikProps<FormValues>,
    t?: (key: string) => string
  ): JSX.Element | null => {
    switch (question.type) {
      case "text":
      case "email":
      case "website":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label htmlFor={question.id}>
              {question.title}
              {question?.required && (
                <span className="gruve-echo-registration-reqired">*</span>
              )}
            </label>
            <Field
              name={question.id}
              type="text"
              className="form-control"
              placeholder={question.title}
            />
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "phone":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label htmlFor={question.id}>
              {question.title}
              {question?.required && (
                <span className="gruve-echo-registration-reqired">*</span>
              )}
            </label>
            <WhatsAppInput
              index={0}
              fieldName={question?.id}
              showLabel={false}
            />
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "checkbox":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label>
              <Field type="checkbox" name={question.id} /> {question.title}
              {question?.required && (
                <span className="gruve-echo-registration-reqired">*</span>
              )}
            </label>
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "socials":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label htmlFor={question.id}>
              {question.title}{" "}
              {question.socials && (
                <span>
                  ({question.socials}){" "}
                  {question?.required && (
                    <span className="gruve-echo-registration-reqired">*</span>
                  )}
                </span>
              )}
            </label>
            <Field
              name={question.id}
              type="text"
              className="form-control"
              placeholder={`Enter ${question.socials || "social media"} link`}
            />
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "terms":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label className="gruve-echo-registration-radio">
              <Field type="checkbox" name={question.id} />{" "}
              <span>
                {question.termsContent}
                {question.termsLink && (
                  <>
                    {" "}
                    <LinkedContent content={question?.termsLink} />
                  </>
                )}
                {question?.required && (
                  <span className="gruve-echo-registration-reqired">*</span>
                )}
              </span>
            </label>
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "multiple":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label>
              {question.title}
              {question?.required && (
                <span className="gruve-echo-registration-reqired">*</span>
              )}
            </label>
            {question.options?.map((option, index) => {
              const selectedValues: any = formikProps.values[question.id] || [];
              const isChecked = selectedValues.includes(option.value);

              return (
                <div key={index} style={{ marginBottom: "5px" }}>
                  <label className="gruve-echo-registration-radio">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={isChecked}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter(
                              (val: any) => val !== option.value
                            );

                        formikProps.setFieldValue(question.id, newValues);
                      }}
                    />{" "}
                    {option.label}
                  </label>
                </div>
              );
            })}
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      case "single":
        return (
          <div className="gruve-echo-registration_form-group" key={question.id}>
            <label>
              {question.title}{" "}
              {question?.required && (
                <span className="gruve-echo-registration-reqired">*</span>
              )}
            </label>
            {question.options?.map((option, index) => (
              <div key={index} style={{ marginBottom: "5px" }}>
                <label className="gruve-echo-registration-radio">
                  <Field
                    type="radio"
                    name={question.id}
                    value={option.value}
                    className="custom-radio"
                    checked={formikProps.values[question.id] === option.value}
                  />{" "}
                  <span>{option.label}</span>
                </label>
              </div>
            ))}
            <ErrorMessage
              name={question.id}
              component="div"
              className="gruve-echo-error-registration"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const { fullName, email, phoneNumber, ...answers } = values;
    const formattedAnswers = Object.keys(answers)
      .map((id) => {
        const question =
          eventData && eventData.registrationQuestions.find((q) => q.id === id);
        return question
          ? { question: question.title, answer: answers[id] }
          : null;
      })
      .filter(Boolean);

    const payload = {
      eventCreator: creator,
      eventAddress: address,
      fullName,
      email,
      phoneNumber,
      answers: formattedAnswers,
    };

    setUserEmail(String(email));

    try {
      const res = await fetch(
        `${GET_BACKEND_URL(isTest)}/api/registration/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      setShowRegistrationSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="gruve-echo-registration-container">
      <div className="gruve-echo-modal-top">
        <div className="gruve-echo-back-arrow" onClick={handleGoBack}>
          <BackArrow />
        </div>
        <h3>Registration</h3>
        <div onClick={handleCloseModal} className="gruve-echo-close-icon">
          <CloseIcon />
        </div>
      </div>
      <div className="">
        <Formik
          initialValues={{ ...initialQuestionsValue }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <Form>
              <div className="gruve-echo-registration-form__">
                {eventData &&
                  eventData.registrationQuestions.map((q) =>
                    renderField(q, formikProps)
                  )}
              </div>
              <div className="gruve-echo-ctn-container">
                <div onClick={handleGoBack} className="gruve-echo-go-back-btn">
                  Back
                </div>
                {formikProps?.isSubmitting ? (
                  <div className="gruve-echo-loading-btn gruve-event-loader-container-order">
                    <div className="gruve-event-loader-spinner"></div>
                  </div>
                ) : (
                  <button type="submit" className="gruve-echo-submit-btn">
                    Register
                  </button>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Registration;
