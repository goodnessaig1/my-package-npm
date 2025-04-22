import React, { useEffect, useRef } from "react";
import "./EventDetails.css";
import type { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  openPaymentsModal: boolean;
  openCheckout: boolean;
  children?: ReactNode;
};

const Modal = ({
  isOpen,
  openCheckout,
  openPaymentsModal,
  children,
}: ModalProps) => {
  if (!isOpen) return null;
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((openCheckout || openPaymentsModal) && contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [openCheckout, openPaymentsModal]);

  return (
    <div className="modal-overlay">
      <div ref={contentRef} className="modal-content">
        <div className="">{children && children}</div>
      </div>
    </div>
  );
};

export default Modal;
