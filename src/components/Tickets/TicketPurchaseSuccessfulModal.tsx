import React from "react";
import "./TicketPurchaseSuccessfulModal.css";
import { SucessfulConnect } from "../../asset/SuccessfulConnect";
import CloseIcon from "../../asset/CloseIcon";

interface Props {
  close: () => void;
  BASE_URL: string;
  buttonColor: string;
  buttonTextColor: string;
}

const TicketPurchaseSuccessfulModal: React.FC<Props> = ({
  close,
  BASE_URL,
  buttonColor,
  buttonTextColor,
}) => {
  return (
    <div className="modal-body">
      <div className="modal-top">
        <h3></h3>
        <div onClick={close} className="close-icon">
          <CloseIcon />
        </div>
      </div>
      <div className="modal-flex">
        <SucessfulConnect height="96px" width="96px" />

        <h2 className="modal-heading">Ticket acquired successfully</h2>

        <p className="modal-text">
          Your ticket will be sent to the provided email(s) and WhatsApp
          numbers. If you don't receive it immediately, please check your spam
          folder. Sign in to view more details and manage your registration.
        </p>

        <a
          href={BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="sign-in-button"
        >
          <div
            className=""
            style={{ background: buttonColor, color: buttonTextColor }}
          >
            Sign in to Gruve
          </div>
        </a>
      </div>
    </div>
  );
};

export default TicketPurchaseSuccessfulModal;
