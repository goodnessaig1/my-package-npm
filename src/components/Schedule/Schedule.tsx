import React from "react";
import "./Schedule.css";
import { CountDown } from "./Countdown";
import { IEventData } from "../GruveEventsWidget";

const ScheduleInfo = ({ eventData }: { eventData: IEventData }) => {
  if (!eventData || eventData.schedules.length === 0) return null;

  const getFinalDate = () => {
    const schedules = eventData.schedules;

    const earliestStartDate = schedules.reduce((min, current) =>
      new Date(current.date) < new Date(min.date) ? current : min
    ).date;

    const latestEndDate = schedules.reduce((max, current) =>
      new Date(current.endDate) > new Date(max.endDate) ? current : max
    ).endDate;

    const allTimes = schedules.flatMap((schedule: any) =>
      schedule.startTime && schedule.endTime
        ? [{ startTime: schedule.startTime, endTime: schedule.endTime }]
        : []
    );

    return {
      date: earliestStartDate,
      endDate: latestEndDate,
      times: allTimes,
    };
  };

  const { date, endDate, times } = getFinalDate();
  const timeZoneOffset = eventData.schedules[0]?.timeZoneOffset;
  const timeZone = eventData.timeZone;
  const timeZoneName = timeZone?.slice(timeZone.indexOf(" ") + 1);

  const convertedTimeSlots = times.map((slot: any) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
  }));

  const formatDate = (dateString: any): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      weekday: "short",
      timeZone: "UTC",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const isSameDate = date === endDate;
  const hasMultipleTimes = eventData.schedules.length > 1;

  const renderSchedule = () => {
    if (isSameDate && !hasMultipleTimes) {
      return (
        <div>
          <div className="schedule-date">{formatDate(date)}</div>
          <div className="schedule-time">
            {convertedTimeSlots[0].startTime} - {convertedTimeSlots[0].endTime}{" "}
            {!Number.isNaN(timeZoneOffset ?? 0) &&
              `GMT ${timeZoneOffset > 0 ? "-" : "+"}${
                Math.abs(timeZoneOffset / 60) || 0
              }`}
          </div>
        </div>
      );
    }

    if (isSameDate && hasMultipleTimes) {
      return (
        <div>
          <div className="schedule-time">
            {convertedTimeSlots.map((time: any, index: number) => (
              <span key={index}>
                {time.startTime} - {time.endTime}
                {index < convertedTimeSlots.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
          <div className="schedule-time">
            {!Number.isNaN(timeZoneOffset ?? 0) &&
              `GMT ${timeZoneOffset > 0 ? "-" : "+"}${
                Math.abs(timeZoneOffset / 60) || 0
              } ${timeZoneName}`}
          </div>
        </div>
      );
    }

    if (!isSameDate) {
      return (
        <div>
          <div className="schedule-date">
            {formatDate(date)} - {formatDate(endDate)}
          </div>
          <div className="schedule-time">
            {convertedTimeSlots.map((time: any, index: number) => (
              <span key={index}>
                {time.startTime} - {time.endTime}
                {index < convertedTimeSlots.length - 1 ? ", " : ""}
              </span>
            ))}
            {!Number.isNaN(timeZoneOffset ?? 0) &&
              ` GMT ${timeZoneOffset > 0 ? "-" : "+"}${
                Math.abs(timeZoneOffset / 60) || 0
              } ${timeZoneName}`}
          </div>
        </div>
      );
    }
  };

  const getMonth = () => {
    const startMonth = new Date(date).toLocaleString("default", {
      month: "short",
    });
    const endMonth = new Date(endDate).toLocaleString("default", {
      month: "short",
    });
    const startYear = new Date(date).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    return (
      <div className="month-box">
        {startMonth !== endMonth || startYear !== endYear
          ? `${startMonth} - ${endMonth}`
          : startMonth}
      </div>
    );
  };

  const getDay = () => {
    const formatDayUTC = (dateString: any) =>
      new Date(dateString).toLocaleString("en-US", {
        day: "numeric",
        timeZone: "UTC",
      });

    const startDay = formatDayUTC(date);
    const endDay = formatDayUTC(endDate);

    return (
      <div className="day-box">
        {startDay !== endDay ? `${startDay} - ${endDay}` : startDay}
      </div>
    );
  };

  return (
    <div className="schedule-wrapper">
      <div className="left-section">
        <div className="date-box">
          {getMonth()}
          {getDay()}
        </div>
        <div className="schedule-details">{renderSchedule()}</div>
      </div>

      <div className="right-section">
        <CountDown date={`${date} ${eventData.schedules[0].startTime}`} />
      </div>
    </div>
  );
};

export default ScheduleInfo;
