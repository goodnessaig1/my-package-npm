import React from "react";
import "./Payment.css";
import BackArrow from "../../asset/BackArrow";
import CloseIcon from "../../asset/CloseIcon";
import SvgDollarIcon from "../../asset/DollarIcon";

interface PaymentProps {
  goBack: () => void;
}

const Payment: React.FC<PaymentProps> = ({ goBack }) => {
  return (
    <div>
      <div className="modal-top">
        <div className="back-arrow" onClick={goBack}>
          <BackArrow />
        </div>
        <h3>Payment</h3>
        <div onClick={goBack} className="close-icon">
          <CloseIcon />
        </div>
      </div>
      <div className="input-box">
        <div className="input-left">
          <input type="radio" defaultChecked={true} name="payment" />
          <span>Bank transfer, Debit Card</span>
        </div>
        <div className="input-right">
          <SvgDollarIcon />
        </div>
      </div>
    </div>
  );
};

export default Payment;
