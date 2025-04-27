import React from "react";
import "./TicketPurchaseSuccessfulModal.css";
interface Props {
    close: () => void;
    BASE_URL: string;
    buttonColor: string;
}
declare const TicketPurchaseSuccessfulModal: React.FC<Props>;
export default TicketPurchaseSuccessfulModal;
