import React, { useEffect, useState } from "react";
import { timeDiff } from "../../utils/utils";

export const CountDown = ({ date }: { date: string }) => {
  const [, setSeconds] = useState(0);
  const { day, hour, minute, second } = timeDiff(new Date(date));

  useEffect(() => {
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const eventDate = new Date(date);
  const currentDate = new Date();

  return (
    <div className="gruve-echo-countdown">
      {eventDate > currentDate ? (
        <div className="gruve-echo-countdown-flex">
          {[
            { label: "Days", value: day },
            { label: "Hours", value: hour },
            { label: "Mins", value: minute },
            { label: "Secs", value: second },
          ].map((item, idx) => (
            <div key={idx} className="gruve-echo-countdown-item">
              <div className="gruve-echo-countdown-circle">{item.value}</div>
              <span className="gruve-echo-countdown-label">{item.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
