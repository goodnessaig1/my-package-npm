import React from "react";
import "./Tooltip.css";

const Tooltip = ({ children, text, show, position = "top" }: any) => {
  return (
    <div className={`gruve-echo-tooltip-container ${position}`}>
      {children}
      {show && <span className="gruve-echo-tooltip-text">{text}</span>}
    </div>
  );
};

export default Tooltip;
