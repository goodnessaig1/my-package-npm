// Tooltip.jsx
import React from "react";
import "./Tooltip.css";

const Tooltip = ({ children, text, show, position = "top" }: any) => {
  return (
    <div className={`tooltip-container ${position}`}>
      {children}
      {show && <span className="tooltip-text">{text}</span>}
    </div>
  );
};

export default Tooltip;
