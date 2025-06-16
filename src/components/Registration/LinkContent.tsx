import React from "react";

const LinkedContent = ({ content }: { content: string }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return (
    <span>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#EA445A",
              textDecoration: "underline",
              wordBreak: "break-all",
              overflowWrap: "anywhere",
            }}
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

export default LinkedContent;
