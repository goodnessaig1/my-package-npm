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
    <div className="truncated-container">
      <p
        ref={ref}
        className={`truncated-text ${isTruncated ? "truncated" : ""}`}
        onClick={toggleTruncation}
      >
        {text}
      </p>

      {showToggle && (
        <span className="read-toggle" onClick={toggleTruncation}>
          {isTruncated ? "Read more" : "Read Less"}
        </span>
      )}
    </div>
  );
};

export default TruncatedText;
