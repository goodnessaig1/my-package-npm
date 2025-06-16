import React, { useRef, useState, useEffect } from "react";
import "./TruncatedText.css";

const TruncatedText = ({ text }: { text: string }) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (ref.current) {
        setShowToggle(ref.current.scrollHeight > ref.current.clientHeight);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text]);

  const toggleTruncation = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <div className="gruve-echo-truncated-container">
      <p
        ref={ref}
        className={`gruve-echo-truncated-text ${
          isTruncated ? "gruve-echo-truncated" : ""
        }`}
        onClick={toggleTruncation}
      >
        {text}
      </p>

      {showToggle && (
        <span className="gruve-echo-read-toggle" onClick={toggleTruncation}>
          {isTruncated ? "Read more" : "Read Less"}
        </span>
      )}
    </div>
  );
};

export default TruncatedText;

export const TruncatedHtmlContent = ({ htmlContent }: any) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const [showToggle, setShowToggle] = useState(false);
  const contentRef = useRef<any>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const containerHeight = 80;
      setShowToggle(contentHeight > containerHeight);
    }
  }, [htmlContent]);

  const toggleTruncation = () => {
    setIsTruncated(!isTruncated);
  };

  return (
    <div ref={containerRef}>
      <div
        ref={contentRef}
        className={`ql-editor ${isTruncated ? "truncated" : ""}`}
        dangerouslySetInnerHTML={{ __html: htmlContent || "" }}
      />

      {showToggle && (
        <span className="gruve-echo-read-toggle" onClick={toggleTruncation}>
          {isTruncated ? "Read more" : "Read Less"}
        </span>
      )}
    </div>
  );
};
