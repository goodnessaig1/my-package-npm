import React, { useEffect, useRef } from "react";
import "./EventDetails.css";
import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  openPaymentsModal: boolean;
  openRegistration: boolean;
  openCheckout: boolean;
  children?: ReactNode;
};

const Modal = ({
  isOpen,
  openCheckout,
  openPaymentsModal,
  children,
  openRegistration,
}: ModalProps) => {
  if (!isOpen) return null;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      (openCheckout || openPaymentsModal || openRegistration) &&
      contentRef.current
    ) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [openCheckout, openPaymentsModal, openRegistration]);

  return (
    <div className="gruve-echo-modal-overlay">
      <div ref={contentRef} className="gruve-echo-modal-content">
        <div className="">{children && children}</div>
      </div>
    </div>
  );
};

export default Modal;
