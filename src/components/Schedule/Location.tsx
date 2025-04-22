import React from "react";
import { sanitizeUrl } from "../../utils/utils";
import "./Location.css";
import LocationIcon from "../../asset/LocationIcon";

const Location = ({ location }: { location: any }) => {
  const isUrl = /^(https?:\/\/|www\.)/i.test(location);

  const sanitizedLocation = isUrl ? sanitizeUrl(location) : location;
  const isOnline = isUrl;

  const locationUrl = isOnline ? sanitizedLocation : location;
  const displayLocation = isOnline ? "Online" : location;

  return (
    <div className="">
      <div className="location-container">
        <div className="location-icon-box">
          <LocationIcon width="1rem" height="1rem" />
        </div>

        {isOnline ? (
          <p className="location-link">
            <a href={locationUrl} target="_blank" rel="noopener noreferrer">
              Online
            </a>
          </p>
        ) : (
          <p className="location-text">{displayLocation}</p>
        )}
      </div>
    </div>
  );
};

export default Location;
