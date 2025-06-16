import React, { useEffect, useRef, useState } from "react";
import "./TicketPurchaseSuccessfulModal.css";
import { SucessfulConnect } from "../../asset/SuccessfulConnect";
import CloseIcon from "../../asset/CloseIcon";
import { HourGlass } from "../../asset/HourGlass";
import { GET_BACKEND_URL } from "../../utils/utils";

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

interface ImageInfo {
  url: string;
  name: string;
}

const TicketPurchaseSuccessfulModal: React.FC<Props> = ({
  close,
  BASE_URL,
  eventType,
  buttonColor,
  buttonTextColor,
  userEmail,
  openConfirmation,
  paymentDetails,
  onSuccess,
  setOnSuccess,
  isFree,
  isTest,
}) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const [imageList, setImageList] = useState<ImageInfo[]>([]);
  // const BASE_IMAGE_URL = `${process.env.NEXT_PUBLIC_PAYMENT_SERVICES}/ipfs`;
  const BACKEND_URL = GET_BACKEND_URL(isTest);
  const BASE_IMAGE_URL = `${BACKEND_URL}/ipfs`;

  useEffect(() => {
    if (isFree) return;
    const url = `${BACKEND_URL}/api/sse/payments/status/${paymentDetails?.id}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    const imageListRef = { current: [] as { url: string; name: string }[] };

    es.onopen = () => console.log("✅ Connection opened"); //eslint-disable-line
    es.onerror = (e) => {
      console.error("❌ Connection error"); //eslint-disable-line
      es.close();
    };

    es.addEventListener("url", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        const fullUrl = data.url;
        const urlObj = new URL(BASE_IMAGE_URL + fullUrl);

        const imageUrl = BASE_IMAGE_URL + urlObj.pathname;
        const name = urlObj.searchParams.get("name") || "download";

        imageListRef.current = [
          ...imageListRef.current,
          { url: imageUrl, name },
        ];
        setImageList(imageListRef.current);
        setOnSuccess(true);

        if (paymentDetails?.tickets?.length === imageListRef.current.length) {
          es.close();
        }
      } catch (err) {
        console.error("Error parsing URL event:", err); //eslint-disable-line
      }
    });

    return () => {
      es.close();
      console.log("🔒 Connection closed"); //eslint-disable-line
    };
  }, [paymentDetails]);

  const handleDownload = async () => {
    if (isFree) {
      for (const url of paymentDetails?.urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;

          const urlObj = new URL(url);
          const nameParam = urlObj.searchParams.get("name") || "Ticket";
          link.download = `Ticket${nameParam}.png`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error("❌ Error downloading free image:", err); //eslint-disable-line
        }
      }
    } else {
      for (const { url, name } of imageList) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch ${url}`);

          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `Ticket-${name}.png`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
          console.error("❌ Error downloading image:", err); //eslint-disable-line
        }
      }
    }
  };

  return (
    <div className="gruve-echo-modal-body">
      <div className="gruve-echo-modal-top">
        <h3></h3>
        <div onClick={close} className="gruve-echo-close-icon">
          <CloseIcon />
        </div>
      </div>

      <div className="gruve-echo-modal-flex">
        {eventType === "registration" ? (
          <>
            <span className="gruve-package-echo-loader-green">
              <SucessfulConnect />
            </span>
            <h2 className="gruve-echo-modal-heading">
              Registration successful
            </h2>
            <p className="gruve-echo-modal-text">
              A confirmation email has been sent to{" "}
              <strong>{userEmail}. </strong>
              Please sign in to see more details and manage your registration
            </p>
            <a
              href={BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gruve-echo-download-in-button"
            >
              <div className="">Sign in to Gruve</div>
            </a>
          </>
        ) : (
          <>
            {openConfirmation ? (
              <>
                {onSuccess ? (
                  <>
                    <span className="gruve-package-echo-loader-green">
                      <SucessfulConnect />
                    </span>
                    <h2 className="gruve-echo-modal-heading gruve-echo-modal-heading-tickets">
                      Ticket acquired successfully
                    </h2>
                    <p className="gruve-echo-modal-text">
                      Your ticket will be sent to the provided email(s) and
                      WhatsApp numbers. If you don't receive it immediately,
                      please check your spam folder. Sign in to view more
                      details and manage your registration.
                    </p>
                    <div className="gruve-echo-download-in-button">
                      <div className="" onClick={handleDownload}>
                        Download ticket(s)
                      </div>
                    </div>
                    <a
                      href={BASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gruve-echo-sign-in-button"
                    >
                      <div className="">Sign in to Gruve</div>
                    </a>
                  </>
                ) : (
                  <>
                    <span className="gruve-package-echo-loader">
                      <span className="gruve-package-echo-rotating-icon">
                        <HourGlass />
                      </span>
                    </span>
                    <h2 className="gruve-echo-modal-heading gruve-echo-modal-heading-tickets">
                      Pending confirmation
                    </h2>
                    <p className="gruve-echo-modal-text">
                      A confirmation email will be sent to the provided email
                      and WhatsApp. If it’s not in your inbox, please check your{" "}
                      <strong>spam, promotions</strong>, or{" "}
                      <strong>trash</strong> folders.
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="gruve-package-empty-loader-container">
                <span className="gruve-package-echo-empty-loader"></span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TicketPurchaseSuccessfulModal;
