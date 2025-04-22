import React from "react";
import "./TicketPurchaseSuccessfulModal.css";
import { SucessfulConnect } from "../../asset/SuccessfulConnect";
import CloseIcon from "../../asset/CloseIcon";

interface Props {
  close: () => void;
  setShowTicketPurchaseSuccess: (val: boolean) => void;
}

const TicketPurchaseSuccessfulModal: React.FC<Props> = ({
  setShowTicketPurchaseSuccess,
  close,
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

        <div className="sign-in-button">
          <div className="">Sign in to Gruve</div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchaseSuccessfulModal;
