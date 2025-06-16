import React from "react";
import "./TicketPurchaseSuccessfulModal.css";
interface Props {
    close: () => void;
    BASE_URL: string;
    buttonColor: string;
    userEmail: string;
    buttonTextColor: string;
    eventType: string | undefined;
    openConfirmation: boolean;
    isFree: boolean;
    onSuccess: boolean;
    setOnSuccess: (val: boolean) => void;
    paymentDetails: any;
    isTest: boolean;
}
declare const TicketPurchaseSuccessfulModal: React.FC<Props>;
export default TicketPurchaseSuccessfulModal;
