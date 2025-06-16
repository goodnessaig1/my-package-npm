import { useEffect, useRef, useState } from "react";
import { useField, useFormikContext } from "formik";
import { countryCodes } from "../../utils/counties";
import React from "react";

export default function WhatsAppInput({
  index,
  fieldName,
  showLabel = true,
}: {
  index: any;
  fieldName: string;
  showLabel?: boolean;
}) {
  const [field] = useField(fieldName);
  const { setFieldValue, values } = useFormikContext();
  const [selectedCode, setSelectedCode] = useState("234");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getNumberWithoutCode = (fullNumber: string) => {
    if (!fullNumber) return "";
    if (fullNumber.startsWith(selectedCode)) {
      return fullNumber.substring(selectedCode.length);
    }
    return fullNumber;
  };

  const handleNumberChange = (e: any) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue) {
      setFieldValue(fieldName, `${selectedCode}${rawValue}`);
    } else {
      setFieldValue(fieldName, "");
    }
  };

  const handleCountryChange = (code: any) => {
    setSelectedCode(code);
    setDropdownOpen(false);
    const currentNumber = field.value?.replace(/^\d+/, "") || "";
    setFieldValue(fieldName, `${code}${currentNumber}`);
  };

  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="gruve-echo-form-cont" ref={dropdownRef}>
      {showLabel && (
        <label htmlFor={fieldName}>
          {index ? "WhatsApp No" : "Receiver's WhatsApp No"}
        </label>
      )}

      <div
        className="gruve-echo-whatsapp-container"
        style={{ display: "flex", alignItems: "center", position: "relative" }}
      >
        <div
          className="gruve-echo-code-input"
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#718096",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            +{selectedCode}
          </button>
        </div>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              zIndex: 9999,
              maxHeight: "300px",
              overflowY: "auto",
              borderRadius: "8px",
              marginTop: "4px",
            }}
          >
            {countryCodes.map((country, idx) => (
              <div
                key={idx}
                className="gruve-echo-list-items"
                onClick={() => handleCountryChange(country.code)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: "14px",
                  borderBottom: "1px solid #eee",
                  color: "#666481",
                }}
              >
                <span>{country.country}</span>
                <span>+{country.code}</span>
              </div>
            ))}
          </div>
        )}

        <input
          type="tel"
          id={fieldName}
          name={fieldName}
          placeholder="Enter WhatsApp number"
          value={getNumberWithoutCode(field.value)}
          onChange={handleNumberChange}
          style={{
            borderColor: "transparent",
            outline: "none",
            borderLeft: "none",
            width: "100%",
            fontSize: "0.875rem",
          }}
        />
      </div>
    </div>
  );
}
