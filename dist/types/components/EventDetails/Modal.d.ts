import "./EventDetails.css";
interface ModalProps {
    isOpen: boolean;
    openPaymentsModal: boolean;
    openCheckout: boolean;
    children?: any;
}
declare const Modal: ({ isOpen, openCheckout, openPaymentsModal, children, }: ModalProps) => import("react/jsx-runtime").JSX.Element | null;
export default Modal;
