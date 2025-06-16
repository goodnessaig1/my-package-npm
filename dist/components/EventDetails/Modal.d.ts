import "./EventDetails.css";
import type { ReactNode } from "react";
type ModalProps = {
    isOpen: boolean;
    openPaymentsModal: boolean;
    openRegistration: boolean;
    openCheckout: boolean;
    children?: ReactNode;
};
declare const Modal: ({ isOpen, openCheckout, openPaymentsModal, children, openRegistration, }: ModalProps) => import("react/jsx-runtime").JSX.Element | null;
export default Modal;
