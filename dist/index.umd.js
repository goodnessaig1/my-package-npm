(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react/jsx-runtime'), require('react')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react/jsx-runtime', 'react'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.GruveEventsWidget = {}, global.jsxRuntime, global.React));
})(this, (function (exports, jsxRuntime, react) { 'use strict';

  const Modal = ({
    isOpen,
    openCheckout,
    openPaymentsModal,
    children
  }) => {
    if (!isOpen) return null;
    const contentRef = react.useRef(null);
    react.useEffect(() => {
      if ((openCheckout || openPaymentsModal) && contentRef.current) {
        contentRef.current.scrollTo({
          top: 0,
          behavior: "auto"
        });
      }
    }, [openCheckout, openPaymentsModal]);
    return jsxRuntime.jsx("div", {
      className: "modal-overlay",
      children: jsxRuntime.jsx("div", {
        ref: contentRef,
        className: "modal-content",
        children: jsxRuntime.jsx("div", {
          className: "",
          children: children && children
        })
      })
    });
  };

  const byteToHex = [];
  for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
      return (byteToHex[arr[offset + 0]] +
          byteToHex[arr[offset + 1]] +
          byteToHex[arr[offset + 2]] +
          byteToHex[arr[offset + 3]] +
          '-' +
          byteToHex[arr[offset + 4]] +
          byteToHex[arr[offset + 5]] +
          '-' +
          byteToHex[arr[offset + 6]] +
          byteToHex[arr[offset + 7]] +
          '-' +
          byteToHex[arr[offset + 8]] +
          byteToHex[arr[offset + 9]] +
          '-' +
          byteToHex[arr[offset + 10]] +
          byteToHex[arr[offset + 11]] +
          byteToHex[arr[offset + 12]] +
          byteToHex[arr[offset + 13]] +
          byteToHex[arr[offset + 14]] +
          byteToHex[arr[offset + 15]]).toLowerCase();
  }

  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
      if (!getRandomValues) {
          if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
              throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
          }
          getRandomValues = crypto.getRandomValues.bind(crypto);
      }
      return getRandomValues(rnds8);
  }

  const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native = { randomUUID };

  function v4(options, buf, offset) {
      if (native.randomUUID && true && !options) {
          return native.randomUUID();
      }
      options = options || {};
      const rnds = options.random ?? options.rng?.() ?? rng();
      if (rnds.length < 16) {
          throw new Error('Random bytes length must be >= 16');
      }
      rnds[6] = (rnds[6] & 0x0f) | 0x40;
      rnds[8] = (rnds[8] & 0x3f) | 0x80;
      return unsafeStringify(rnds);
  }

  const PAYSTACK_KEY = "pk_test_b9c556369fc74860f7f267257c0f92c872792fd7";
  const timeDiff = (date, now) => {
    const currentTime = Date.now();
    if (currentTime > date.getTime()) {
      return {
        day: 0,
        hour: 0,
        minute: 0,
        second: 0
      };
    }
    let d = Math.abs(currentTime - date.getTime()) / 1000;
    const r = {
      day: 0,
      hour: 0,
      minute: 0,
      second: 0
    };
    const s = {
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    Object.keys(s).forEach(key => {
      r[key] = Math.floor(d / s[key]);
      d -= r[key] * s[key];
    });
    return r;
  };
  const sanitizeUrl = url => {
    if (!url) return "";
    url = url.replace(/^(https?:\/\/)+/, "https://");
    url = url.replace(/^(www\.)+/, "www.");
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    return url;
  };
  const formatCurrency = valueInNumber => {
    const roundedValue = Math.ceil(valueInNumber * 100) / 100;
    return roundedValue.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  function expandTickets(ticketArrays) {
    const newTickArray = [];
    ticketArrays.forEach(eachTickets => {
      if (eachTickets.quantity > 1) {
        new Array(eachTickets.quantity).fill(1).map(() => newTickArray.push({
          ...eachTickets,
          quantity: 1,
          id: v4().replace("-", "")
        }));
        return;
      }
      newTickArray.push(eachTickets);
    });
    return newTickArray;
  }
  function randomizeLastFourDigits(walletAddress) {
    const addressString = String(walletAddress);
    let randomHex = "";
    for (let i = 0; i < 8; i++) {
      randomHex += Math.floor(Math.random() * 16).toString(16);
    }
    const randomizedAddress = addressString.slice(0, -randomHex.length) + randomHex;
    return randomizedAddress;
  }
  const createUserAnswerArray = tickets => {
    return tickets.flatMap(ticket => ticket.questions.map(question => {
      var _a;
      return {
        answer: (_a = question.answer) !== null && _a !== void 0 ? _a : "",
        userAddress: randomizeLastFourDigits("0x0000000000000000000000000000000000000002"),
        eventQuestionsId: question.id
      };
    }));
  };
  function findTicketTypeIdWithHighestQuantity(tickets) {
    let highestQuantity = 0;
    let highestQuantityTicketTypeId = null;
    tickets.forEach(ticket => {
      if (ticket.quantity > highestQuantity) {
        highestQuantity = ticket.quantity;
        highestQuantityTicketTypeId = ticket._ticketType;
      }
    });
    return highestQuantityTicketTypeId;
  }
  function applyDiscount(tickets, ticketTypeId, count, eventCurrency, discountAmount, discountType, cost) {
    let discountApplied = 0;
    let discountAmountApplied = 0;
    const updatedTickets = tickets.map(ticket => ({
      ...ticket
    }));
    for (let i = 0; i < updatedTickets.length && discountApplied < count; i++) {
      const ticket = updatedTickets[i];
      const currentType = ticket.ticketTypeId;
      if ((currentType === ticketTypeId || ticketTypeId === 0) && !ticket.isDiscounted) {
        const ticketCost = cost[currentType];
        const calculatedDiscount = discountType === "AMOUNT" ? discountAmount : ticketCost * discountAmount / 100;
        ticket.appliedDiscount = calculatedDiscount;
        ticket.discountAmount = discountType === "PERCENT" ? discountAmount : `${eventCurrency === "USD" ? "$" : "₦"}${discountAmount}`;
        ticket.isDiscounted = true;
        discountAmountApplied += calculatedDiscount;
        discountApplied++;
      }
    }
    return [updatedTickets, discountAmountApplied];
  }
  function updatedTickets(tickets, eventDetails, coupons) {
    if (eventDetails) {
      return eventDetails.map((detail, index) => {
        var _a, _b, _c;
        const ticket = tickets.find(t => t.ticketName === detail.sectionName);
        const ticketTypeId = ticket ? ticket.ticketTypeId : index + 1;
        const coupon = coupons.find(c => c.ticketType === ticketTypeId && c.isEnabled);
        const originalCost = (_a = ticket === null || ticket === void 0 ? void 0 : ticket.cost) !== null && _a !== void 0 ? _a : detail.cost;
        let discountedCost = originalCost;
        if (coupon) {
          if (coupon.discountType === "PERCENT") {
            discountedCost = originalCost - originalCost * (coupon.discountValue / 100);
          } else {
            discountedCost = Math.max(0, originalCost - coupon.discountValue);
          }
        }
        return {
          ...detail,
          ...(ticket || {}),
          quantity: (_b = detail === null || detail === void 0 ? void 0 : detail.quantity) !== null && _b !== void 0 ? _b : 0,
          cost: originalCost,
          discountedCost,
          // ticketType: ticketTypeId,
          ticketName: (_c = ticket === null || ticket === void 0 ? void 0 : ticket.ticketName) !== null && _c !== void 0 ? _c : detail.sectionName,
          ticketTypeId: ticketTypeId
        };
      });
    }
  }

  const CountDown = ({
    date
  }) => {
    const [, setSeconds] = react.useState(0);
    const {
      day,
      hour,
      minute,
      second
    } = timeDiff(new Date(date));
    react.useEffect(() => {
      const interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
      return () => clearInterval(interval);
    }, []);
    const eventDate = new Date(date);
    const currentDate = new Date();
    return jsxRuntime.jsx("div", {
      className: "countdown",
      children: eventDate > currentDate ? jsxRuntime.jsx("div", {
        className: "countdown-flex",
        children: [{
          label: "Days",
          value: day
        }, {
          label: "Hours",
          value: hour
        }, {
          label: "Mins",
          value: minute
        }, {
          label: "Secs",
          value: second
        }].map((item, idx) => jsxRuntime.jsxs("div", {
          className: "countdown-item",
          children: [jsxRuntime.jsx("div", {
            className: "countdown-circle",
            children: item.value
          }), jsxRuntime.jsx("span", {
            className: "countdown-label",
            children: item.label
          })]
        }, idx))
      }) : null
    });
  };

  const ScheduleInfo = ({
    eventData
  }) => {
    var _a;
    if (!eventData || eventData.schedules.length === 0) return null;
    const getFinalDate = () => {
      const schedules = eventData.schedules;
      const earliestStartDate = schedules.reduce((min, current) => new Date(current.date) < new Date(min.date) ? current : min).date;
      const latestEndDate = schedules.reduce((max, current) => new Date(current.endDate) > new Date(max.endDate) ? current : max).endDate;
      const allTimes = schedules.flatMap(schedule => schedule.startTime && schedule.endTime ? [{
        startTime: schedule.startTime,
        endTime: schedule.endTime
      }] : []);
      return {
        date: earliestStartDate,
        endDate: latestEndDate,
        times: allTimes
      };
    };
    const {
      date,
      endDate,
      times
    } = getFinalDate();
    const timeZoneOffset = (_a = eventData.schedules[0]) === null || _a === void 0 ? void 0 : _a.timeZoneOffset;
    const timeZone = eventData.timeZone;
    const timeZoneName = timeZone === null || timeZone === void 0 ? void 0 : timeZone.slice(timeZone.indexOf(" ") + 1);
    const convertedTimeSlots = times.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
    const formatDate = dateString => {
      const options = {
        month: "short",
        day: "numeric",
        weekday: "short",
        timeZone: "UTC"
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    };
    const isSameDate = date === endDate;
    const hasMultipleTimes = eventData.schedules.length > 1;
    const renderSchedule = () => {
      if (isSameDate && !hasMultipleTimes) {
        return jsxRuntime.jsxs("div", {
          children: [jsxRuntime.jsx("div", {
            className: "schedule-date",
            children: formatDate(date)
          }), jsxRuntime.jsxs("div", {
            className: "schedule-time",
            children: [convertedTimeSlots[0].startTime, " - ", convertedTimeSlots[0].endTime, " ", !Number.isNaN(timeZoneOffset !== null && timeZoneOffset !== void 0 ? timeZoneOffset : 0) && `GMT ${timeZoneOffset > 0 ? "-" : "+"}${Math.abs(timeZoneOffset / 60) || 0}`]
          })]
        });
      }
      if (isSameDate && hasMultipleTimes) {
        return jsxRuntime.jsxs("div", {
          children: [jsxRuntime.jsx("div", {
            className: "schedule-time",
            children: convertedTimeSlots.map((time, index) => jsxRuntime.jsxs("span", {
              children: [time.startTime, " - ", time.endTime, index < convertedTimeSlots.length - 1 ? ", " : ""]
            }, index))
          }), jsxRuntime.jsx("div", {
            className: "schedule-time",
            children: !Number.isNaN(timeZoneOffset !== null && timeZoneOffset !== void 0 ? timeZoneOffset : 0) && `GMT ${timeZoneOffset > 0 ? "-" : "+"}${Math.abs(timeZoneOffset / 60) || 0} ${timeZoneName}`
          })]
        });
      }
      if (!isSameDate) {
        return jsxRuntime.jsxs("div", {
          children: [jsxRuntime.jsxs("div", {
            className: "schedule-date",
            children: [formatDate(date), " - ", formatDate(endDate)]
          }), jsxRuntime.jsxs("div", {
            className: "schedule-time",
            children: [convertedTimeSlots.map((time, index) => jsxRuntime.jsxs("span", {
              children: [time.startTime, " - ", time.endTime, index < convertedTimeSlots.length - 1 ? ", " : ""]
            }, index)), !Number.isNaN(timeZoneOffset !== null && timeZoneOffset !== void 0 ? timeZoneOffset : 0) && ` GMT ${timeZoneOffset > 0 ? "-" : "+"}${Math.abs(timeZoneOffset / 60) || 0} ${timeZoneName}`]
          })]
        });
      }
    };
    const getMonth = () => {
      const startMonth = new Date(date).toLocaleString("default", {
        month: "short"
      });
      const endMonth = new Date(endDate).toLocaleString("default", {
        month: "short"
      });
      const startYear = new Date(date).getFullYear();
      const endYear = new Date(endDate).getFullYear();
      return jsxRuntime.jsx("div", {
        className: "month-box",
        children: startMonth !== endMonth || startYear !== endYear ? `${startMonth} - ${endMonth}` : startMonth
      });
    };
    const getDay = () => {
      const formatDayUTC = dateString => new Date(dateString).toLocaleString("en-US", {
        day: "numeric",
        timeZone: "UTC"
      });
      const startDay = formatDayUTC(date);
      const endDay = formatDayUTC(endDate);
      return jsxRuntime.jsx("div", {
        className: "day-box",
        children: startDay !== endDay ? `${startDay} - ${endDay}` : startDay
      });
    };
    return jsxRuntime.jsxs("div", {
      className: "schedule-wrapper",
      children: [jsxRuntime.jsxs("div", {
        className: "left-section",
        children: [jsxRuntime.jsxs("div", {
          className: "date-box",
          children: [getMonth(), getDay()]
        }), jsxRuntime.jsx("div", {
          className: "schedule-details",
          children: renderSchedule()
        })]
      }), jsxRuntime.jsx("div", {
        className: "right-section",
        children: jsxRuntime.jsx(CountDown, {
          date: `${date} ${eventData.schedules[0].startTime}`
        })
      })]
    });
  };

  const LocationIcon = props => {
    return jsxRuntime.jsxs("svg", {
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      ...props,
      children: [jsxRuntime.jsx("path", {
        d: "M9.9999 11.1917C11.4358 11.1917 12.5999 10.0276 12.5999 8.5917C12.5999 7.15576 11.4358 5.9917 9.9999 5.9917C8.56396 5.9917 7.3999 7.15576 7.3999 8.5917C7.3999 10.0276 8.56396 11.1917 9.9999 11.1917Z",
        stroke: "#666481",
        strokeWidth: "1.25"
      }), jsxRuntime.jsx("path", {
        d: "M3.01675 7.07484C4.65842 -0.141827 15.3501 -0.133494 16.9834 7.08317C17.9417 11.3165 15.3084 14.8998 13.0001 17.1165C11.3251 18.7332 8.67508 18.7332 6.99175 17.1165C4.69175 14.8998 2.05842 11.3082 3.01675 7.07484Z",
        stroke: "#666481",
        strokeWidth: "1.25"
      })]
    });
  };

  const Location = ({
    location
  }) => {
    const isUrl = /^(https?:\/\/|www\.)/i.test(location);
    const sanitizedLocation = isUrl ? sanitizeUrl(location) : location;
    const isOnline = isUrl;
    const locationUrl = isOnline ? sanitizedLocation : location;
    const displayLocation = isOnline ? "Online" : location;
    return jsxRuntime.jsx("div", {
      className: "",
      children: jsxRuntime.jsxs("div", {
        className: "location-container",
        children: [jsxRuntime.jsx("div", {
          className: "location-icon-box",
          children: jsxRuntime.jsx(LocationIcon, {
            width: "1rem",
            height: "1rem"
          })
        }), isOnline ? jsxRuntime.jsx("p", {
          className: "location-link",
          children: jsxRuntime.jsx("a", {
            href: locationUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            children: "Online"
          })
        }) : jsxRuntime.jsx("p", {
          className: "location-text",
          children: displayLocation
        })]
      })
    });
  };

  const TruncatedText = ({
    text
  }) => {
    const [isTruncated, setIsTruncated] = react.useState(true);
    const [showToggle, setShowToggle] = react.useState(false);
    const ref = react.useRef(null);
    react.useEffect(() => {
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
    return jsxRuntime.jsxs("div", {
      className: "truncated-container",
      children: [jsxRuntime.jsx("p", {
        ref: ref,
        className: `truncated-text ${isTruncated ? "truncated" : ""}`,
        onClick: toggleTruncation,
        children: text
      }), showToggle && jsxRuntime.jsx("span", {
        className: "read-toggle",
        onClick: toggleTruncation,
        children: isTruncated ? "Read more" : "Read Less"
      })]
    });
  };

  const MinusIcon = () => {
    return jsxRuntime.jsx("svg", {
      width: "20",
      height: "21",
      viewBox: "0 0 20 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: jsxRuntime.jsx("path", {
        d: "M5 10.5H15",
        stroke: "#666481"
      })
    });
  };

  const AddIcon = () => {
    return jsxRuntime.jsxs("svg", {
      width: "20",
      height: "21",
      viewBox: "0 0 20 21",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [jsxRuntime.jsx("path", {
        d: "M5 10.5H15",
        stroke: "#666481"
      }), jsxRuntime.jsx("path", {
        d: "M10 15.5V5.5",
        stroke: "#666481"
      })]
    });
  };

  function CustomInput({
    max,
    value,
    onChange,
    ticket
  }) {
    const handleIncrement = () => {
      if (value < max) {
        onChange(value + 1, ticket);
      }
    };
    const handleDecrement = () => {
      if (value > 0) {
        onChange(value - 1, ticket);
      }
    };
    return jsxRuntime.jsxs("div", {
      className: "counter-wrapper",
      children: [jsxRuntime.jsx("button", {
        className: "counter-btn",
        onClick: handleDecrement,
        children: jsxRuntime.jsx(MinusIcon, {})
      }), jsxRuntime.jsx("span", {
        className: "counter-value",
        children: value
      }), jsxRuntime.jsx("button", {
        className: "counter-btn",
        onClick: handleIncrement,
        children: jsxRuntime.jsx(AddIcon, {})
      })]
    });
  }
  function TicketCounter({
    tickets,
    currentCurrency,
    eventDetails,
    rates,
    setSelectedTickets,
    selectedTickets,
    ticketBalances
  }) {
    const handleTicketQuantityChange = (newValue, index, ticket) => {
      setSelectedTickets(prev => {
        var _a;
        const updated = [...prev];
        const ticketToUpdateIndex = prev.findIndex(t => t.ticketName === ticket.sectionName && t.cost === ticket.cost);
        if (newValue === 0) {
          if (ticketToUpdateIndex !== -1) {
            updated.splice(ticketToUpdateIndex, 1);
          }
        } else {
          const updatedTicket = {
            _ticketType: ticket._ticketType,
            ticketName: ticket.sectionName,
            cost: ticket.cost,
            ticketType: ticket === null || ticket === void 0 ? void 0 : ticket.ticketTypeId,
            ticketTypeId: ticket === null || ticket === void 0 ? void 0 : ticket.ticketTypeId,
            discountedCost: ticket.discountedCost,
            discountedPrice: (_a = ticket.discountedPrice) !== null && _a !== void 0 ? _a : 0,
            quantity: newValue
          };
          if (ticketToUpdateIndex !== -1) {
            updated[ticketToUpdateIndex] = updatedTicket;
          } else {
            updated.push(updatedTicket);
          }
        }
        return updated;
      });
    };
    return jsxRuntime.jsx("div", {
      className: "ticket-counter-container",
      children: tickets.map((ticket, index) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const hasDiscount = ticket.cost !== ticket.discountedCost;
        const selectedTicket = selectedTickets.find(t => t.ticketName === ticket.sectionName && t.cost === ticket.cost);
        const selectedQuantity = (_a = selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.quantity) !== null && _a !== void 0 ? _a : 0;
        return jsxRuntime.jsxs("div", {
          className: "ticket-row",
          children: [jsxRuntime.jsxs("div", {
            className: "ticket-top",
            children: [jsxRuntime.jsxs("div", {
              className: "ticket-top-left",
              children: [jsxRuntime.jsxs("div", {
                className: "ticket-name-holder",
                children: [jsxRuntime.jsxs("h4", {
                  className: "",
                  children: [ticket.sectionName, " "]
                }), hasDiscount && jsxRuntime.jsx("div", {
                  className: "early-bird",
                  children: "Early bird"
                })]
              }), jsxRuntime.jsx("span", {
                className: "",
                children: ticket.cost === 0 ? "Free" : jsxRuntime.jsx(jsxRuntime.Fragment, {
                  children: hasDiscount ? jsxRuntime.jsxs("div", {
                    className: "early-bird-prices",
                    children: [jsxRuntime.jsxs("h5", {
                      children: [currentCurrency === "USD" ? "$" : "₦", (ticket === null || ticket === void 0 ? void 0 : ticket.discountedCost) && Object.keys(rates).length > 0 ? jsxRuntime.jsx(jsxRuntime.Fragment, {
                        children: formatCurrency(ticket.discountedCost * ((_c = rates[`${currentCurrency}${(_b = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.currency) !== null && _b !== void 0 ? _b : "USD"}`]) !== null && _c !== void 0 ? _c : 1))
                      }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
                        children: (_d = ticket === null || ticket === void 0 ? void 0 : ticket.discountedCost) === null || _d === void 0 ? void 0 : _d.toLocaleString("en-NG")
                      })]
                    }), jsxRuntime.jsxs("span", {
                      children: [currentCurrency === "USD" ? "$" : "₦", (ticket === null || ticket === void 0 ? void 0 : ticket.cost) && Object.keys(rates).length > 0 ? jsxRuntime.jsx(jsxRuntime.Fragment, {
                        children: formatCurrency(ticket.cost * ((_f = rates[`${currentCurrency}${(_e = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.currency) !== null && _e !== void 0 ? _e : "USD"}`]) !== null && _f !== void 0 ? _f : 1))
                      }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
                        children: (_g = ticket === null || ticket === void 0 ? void 0 : ticket.cost) === null || _g === void 0 ? void 0 : _g.toLocaleString("en-NG")
                      })]
                    })]
                  }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
                    children: (ticket === null || ticket === void 0 ? void 0 : ticket.cost) && Object.keys(rates).length > 0 ? jsxRuntime.jsx(jsxRuntime.Fragment, {
                      children: formatCurrency(ticket.cost * ((_j = rates[`${currentCurrency}${(_h = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.currency) !== null && _h !== void 0 ? _h : "USD"}`]) !== null && _j !== void 0 ? _j : 1))
                    }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
                      children: ticket === null || ticket === void 0 ? void 0 : ticket.cost.toLocaleString("en-NG")
                    })
                  })
                })
              })]
            }), jsxRuntime.jsx(CustomInput, {
              max: Math.min(ticket.quantity, ticketBalances[index]),
              value: selectedQuantity,
              onChange: val => handleTicketQuantityChange(val, index, ticket),
              ticket: ticket
            })]
          }), jsxRuntime.jsx("div", {
            className: "ticket-info",
            children: jsxRuntime.jsx(TruncatedText, {
              text: ticket === null || ticket === void 0 ? void 0 : ticket.description
            })
          })]
        }, index);
      })
    });
  }

  const SvgDropDown = props => jsxRuntime.jsx("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 17,
    fill: "none",
    ...props,
    children: jsxRuntime.jsx("path", {
      stroke: "#111021",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "m4 6.043 4 4 4-4"
    })
  });

  const supportedCurrency = ["NGN", "USD"];
  const Tickets = ({
    currentCurrency,
    setCurrentCurrency,
    tickets,
    eventDetails,
    rates,
    setSelectedTickets,
    selectedTickets,
    ticketBalances
  }) => {
    const dropdownRef = react.useRef(null);
    const [dropdownOpen, setDropdownOpen] = react.useState(false);
    react.useEffect(() => {
      const handleClickOutside = event => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    const handleChange = currency => {
      setDropdownOpen(false);
      setCurrentCurrency(currency);
    };
    return jsxRuntime.jsx("div", {
      className: "tickets-container",
      children: jsxRuntime.jsxs("div", {
        className: "choose-ticket-box",
        children: [jsxRuntime.jsxs("div", {
          className: "choose-ticket-header",
          children: [jsxRuntime.jsx("p", {
            className: "choose-ticket-title",
            children: "Choose your ticket"
          }), jsxRuntime.jsxs("div", {
            ref: dropdownRef,
            className: "",
            children: [jsxRuntime.jsxs("div", {
              onClick: () => setDropdownOpen(!dropdownOpen),
              className: "currency-select",
              children: [jsxRuntime.jsx("span", {
                children: currentCurrency
              }), jsxRuntime.jsx(SvgDropDown, {
                color: "#111021"
              })]
            }), dropdownOpen && jsxRuntime.jsx("ul", {
              style: {
                position: "absolute",
                top: "100%",
                width: "60px",
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                zIndex: 9999,
                overflowY: "auto",
                borderRadius: "8px",
                marginTop: "32px",
                marginLeft: "4px"
              },
              children: supportedCurrency.map((currency, idx) => jsxRuntime.jsx("li", {
                className: "currency-list",
                onClick: () => handleChange(currency),
                style: {
                  padding: "8px",
                  cursor: "pointer",
                  display: "flex",
                  fontSize: "14px",
                  borderBottom: "1px solid #eee",
                  color: "#666481"
                },
                children: jsxRuntime.jsx("span", {
                  children: currency
                })
              }, idx))
            })]
          })]
        }), jsxRuntime.jsx(TicketCounter, {
          eventDetails: eventDetails,
          tickets: tickets,
          selectedTickets: selectedTickets,
          currentCurrency: currentCurrency,
          setSelectedTickets: setSelectedTickets,
          rates: rates,
          ticketBalances: ticketBalances
        })]
      })
    });
  };

  const ArrowRight = () => {
    return jsxRuntime.jsxs("svg", {
      width: "30",
      height: "29",
      viewBox: "0 0 30 29",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [jsxRuntime.jsx("path", {
        d: "M12.8545 9.49219L20.0081 9.49219L20.0081 16.6458",
        stroke: "#666481"
      }), jsxRuntime.jsx("path", {
        d: "M9.99121 19.5078L19.9084 9.59064",
        stroke: "#666481"
      })]
    });
  };

  const PoweredBy = () => {
    return jsxRuntime.jsxs("svg", {
      width: "55",
      height: "25",
      viewBox: "0 0 55 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [jsxRuntime.jsx("path", {
        d: "M34.1818 3.99959V1.39593H33.2164V0.828215H35.7207V1.39593H34.784V3.99959H34.1913H34.1818ZM35.9596 3.99959V0.828215H36.5618V3.99959H35.9596ZM38.3779 4.02896C37.9382 4.02896 37.5654 3.87235 37.2596 3.55913C36.9537 3.2459 36.8008 2.86416 36.8008 2.41391C36.8008 1.96365 36.9537 1.58191 37.2596 1.26868C37.5654 0.955462 37.9382 0.789062 38.3779 0.789062C38.6933 0.789062 38.9801 0.877156 39.2286 1.05334C39.4771 1.22953 39.6683 1.46445 39.7925 1.7581L39.2286 1.92449C39.1426 1.7581 39.0279 1.62106 38.8845 1.52318C38.7411 1.4253 38.5691 1.37635 38.3779 1.36657C38.1007 1.36657 37.8617 1.46445 37.6801 1.67C37.489 1.87555 37.4029 2.12026 37.4029 2.41391C37.4029 2.70755 37.4985 2.95226 37.6801 3.14802C37.8713 3.35357 38.1007 3.45146 38.3779 3.45146C38.7602 3.45146 39.0374 3.27527 39.219 2.9131L39.7925 3.06971C39.6683 3.36336 39.4771 3.58849 39.2286 3.76468C38.9801 3.94087 38.6933 4.02896 38.3779 4.02896ZM40.0219 3.99959V0.828215H40.6241V2.39433L41.9623 0.828215H42.6983L41.427 2.29645L42.7365 4.00938H42.0005L41.0351 2.75649L40.6241 3.22633V4.01917H40.0219V3.99959ZM42.8608 3.99959V0.828215H45.0879V1.38614H43.4629V2.13005H44.9158V2.68797H43.4629V3.43188H45.0879V3.99959H42.8608ZM46.254 3.99959V1.39593H45.2886V0.828215H47.7929V1.39593H46.8561V3.99959H46.2635H46.254ZM48.0318 3.99959V0.828215H48.634V3.99959H48.0318ZM48.9877 3.99959V0.828215H49.9722L51.1192 3.46124V0.828215H51.7022V3.99959H50.7464L49.5707 1.29805V3.99959H48.9877ZM53.5088 4.03875C53.0691 4.03875 52.6963 3.88214 52.3904 3.56891C52.0846 3.25569 51.9316 2.87395 51.9316 2.42369C51.9316 1.97344 52.0846 1.5917 52.3904 1.27847C52.6963 0.96525 53.0691 0.798851 53.5088 0.798851C53.8242 0.798851 54.1109 0.886945 54.3595 1.05334C54.608 1.22953 54.7991 1.45466 54.9234 1.74831L54.3499 1.91471C54.2734 1.74831 54.1587 1.61127 54.0058 1.52318C53.8624 1.4253 53.6904 1.38614 53.5088 1.38614C53.2316 1.38614 52.9926 1.48403 52.811 1.68958C52.6198 1.89513 52.5338 2.13984 52.5338 2.43348C52.5338 2.72713 52.6294 2.97183 52.811 3.1676C53.0022 3.36336 53.2316 3.47103 53.5088 3.47103C53.719 3.47103 53.9102 3.4123 54.0727 3.28506C54.2352 3.15781 54.3499 2.99141 54.4168 2.76628H53.5183L53.5088 2.24751H54.9999V2.47263C54.9999 2.92289 54.8565 3.30463 54.5697 3.59828C54.283 3.89192 53.9293 4.03875 53.4992 4.03875H53.5088ZM34.459 8.16937C34.0288 8.15958 33.6083 8.02255 33.2068 7.73869V7.10246C33.6656 7.43526 34.0958 7.60166 34.4876 7.60166C34.6501 7.60166 34.7744 7.57229 34.87 7.51356C34.9656 7.45483 35.0134 7.36674 35.0134 7.25907C35.0134 7.1514 34.9464 7.05352 34.8222 6.985C34.6979 6.90669 34.4876 6.83817 34.1913 6.75987C33.8472 6.67178 33.5987 6.56411 33.4362 6.41728C33.2737 6.27046 33.1973 6.08448 33.1973 5.86914C33.1973 5.59507 33.3024 5.36994 33.5222 5.19376C33.7421 5.01757 34.0097 4.93926 34.3252 4.93926C34.7362 4.93926 35.1281 5.04693 35.4913 5.27206V5.89851C35.3192 5.78105 35.1281 5.69295 34.9178 5.61465C34.7075 5.53634 34.5068 5.49719 34.3252 5.49719C34.1722 5.49719 34.0384 5.52656 33.9428 5.59507C33.8472 5.66359 33.7899 5.75168 33.7899 5.85935C33.7899 5.89851 33.7994 5.93766 33.8186 5.97681C33.8377 6.00618 33.8664 6.04533 33.9046 6.06491C33.9524 6.09427 33.9906 6.11385 34.0288 6.13342C34.0671 6.153 34.1244 6.17258 34.2105 6.19215C34.2869 6.21173 34.3538 6.23131 34.4016 6.25088C34.4494 6.26067 34.5259 6.28025 34.631 6.30961C35.2905 6.47601 35.6155 6.78923 35.6155 7.26886C35.6155 7.5625 35.5008 7.78763 35.281 7.95403C35.0611 8.12043 34.784 8.18895 34.4685 8.18895L34.459 8.16937ZM36.6478 8.13022V7.14161L35.5677 4.95884H36.2081L36.9346 6.44665L37.6706 4.95884H38.3014L37.2404 7.12203V8.13022H36.6383H36.6478ZM39.544 8.16937C39.1139 8.15958 38.6933 8.02255 38.2919 7.73869V7.10246C38.7507 7.43526 39.1808 7.60166 39.5727 7.60166C39.7352 7.60166 39.8594 7.57229 39.955 7.51356C40.0506 7.45483 40.0984 7.36674 40.0984 7.25907C40.0984 7.1514 40.0315 7.05352 39.9072 6.985C39.783 6.90669 39.5727 6.83817 39.2764 6.75987C38.9323 6.67178 38.6838 6.56411 38.5213 6.41728C38.3588 6.27046 38.2823 6.08448 38.2823 5.86914C38.2823 5.59507 38.3874 5.36994 38.6073 5.19376C38.8271 5.01757 39.0948 4.93926 39.4102 4.93926C39.8212 4.93926 40.2131 5.04693 40.5763 5.27206V5.89851C40.4043 5.78105 40.2131 5.69295 40.0028 5.61465C39.7925 5.53634 39.5918 5.49719 39.4102 5.49719C39.2573 5.49719 39.1234 5.52656 39.0279 5.59507C38.9227 5.66359 38.8749 5.75168 38.8749 5.85935C38.8749 5.89851 38.8845 5.93766 38.9036 5.97681C38.9227 6.00618 38.9514 6.04533 38.9896 6.06491C39.0374 6.09427 39.0757 6.11385 39.1139 6.13342C39.1521 6.153 39.2095 6.17258 39.2955 6.19215C39.372 6.21173 39.4389 6.23131 39.4867 6.25088C39.5345 6.26067 39.6109 6.28025 39.7161 6.30961C40.3756 6.47601 40.7006 6.78923 40.7006 7.26886C40.7006 7.5625 40.5859 7.78763 40.366 7.95403C40.1462 8.12043 39.869 8.18895 39.5536 8.18895L39.544 8.16937ZM41.7998 8.13022V5.52656H40.8344V4.95884H43.3387V5.52656H42.402V8.13022H41.8093H41.7998ZM43.5681 8.13022V4.95884H45.7952V5.51677H44.1703V6.26067H45.6231V6.8186H44.1703V7.5625H45.7952V8.13022H43.5681ZM46.0915 8.13022V4.95884H47.0473L47.8598 7.67996L48.6722 4.95884H49.6376V8.13022H49.0641V5.53634L48.2899 8.13022H47.4392L46.665 5.54613V8.13022H46.0915Z",
        fill: "#666481"
      }), jsxRuntime.jsx("path", {
        d: "M25.559 20.1487C24.0679 20.1487 22.8062 19.1504 22.3665 17.78H28.742H31.3132C31.3705 17.4374 31.4087 17.085 31.4087 16.7229C31.4087 16.1062 31.3132 15.5091 31.1411 14.9414C30.5294 12.9446 28.9236 11.3883 26.9163 10.8989C26.5818 10.8206 26.2472 10.7619 25.8936 10.7423H25.2149C24.8517 10.7619 24.4885 10.8206 24.1444 10.9087C22.1563 11.4079 20.5791 12.9544 19.9674 14.9414C19.7953 15.4994 19.6998 16.1062 19.6998 16.7229C19.6998 17.085 19.7284 17.4374 19.7953 17.78C20.2828 20.5794 22.6724 22.7035 25.5495 22.7035C27.7574 22.7035 29.6787 21.4506 30.6727 19.6006L28.1398 18.8959C27.528 19.6593 26.5913 20.1487 25.5495 20.1487H25.559ZM11.2693 6.3278V0.562545H8.49737H5.64898H5.62031C4.57845 0.562545 3.6035 0.856191 2.77192 1.35539C1.10877 2.36358 0 4.21355 0 6.3278C0 7.27726 0.2294 8.17777 0.621293 8.97062C1.10877 9.93965 1.85432 10.7423 2.77192 11.3002C2.78148 11.3002 2.78148 11.31 2.79104 11.31C3.62261 11.8092 4.59757 12.1028 5.63943 12.1028C6.68129 12.1028 7.64668 11.819 8.48781 11.31C8.49737 11.31 8.49737 11.3002 8.50693 11.3002V11.6134C8.50693 13.2285 7.22611 14.5401 5.64898 14.5401C4.24391 14.5401 3.07779 13.5026 2.83883 12.1322H2.79104H0.0382334C0.200725 14.0311 1.27126 15.656 2.79104 16.5761C3.63217 17.085 4.60712 17.3689 5.64898 17.3689C6.69085 17.3689 7.6658 17.0753 8.50693 16.5761C10.0267 15.656 11.0877 14.0213 11.2597 12.1322C11.2789 11.956 11.2789 11.7798 11.2789 11.6036V6.31801L11.2693 6.3278ZM2.77192 6.64102V6.3278C2.77192 4.71275 4.05274 3.40113 5.62987 3.40113H8.48781V6.3278V6.64102C8.47826 6.64102 8.47826 6.63123 8.4687 6.63123C8.36356 7.66878 7.73271 8.53993 6.85334 8.97062C6.48056 9.15659 6.05999 9.25447 5.62031 9.25447C5.18063 9.25447 4.76006 9.15659 4.38728 8.97062C3.50791 8.53993 2.87706 7.66878 2.77192 6.63123C2.76236 6.63123 2.76236 6.64102 2.7528 6.64102H2.77192ZM8.19151 1.19878C8.0099 1.18899 7.73271 1.05196 7.35037 0.905132C7.73271 1.05196 8.00034 1.19878 8.19151 1.19878ZM8.22018 1.19878H8.21062H8.22018ZM14.6147 3.20536H19.2601V0.542969H14.6147H11.8524V12.1224H14.3184H14.6243C14.6147 9.43066 14.6147 6.59208 14.6147 3.88075C14.6147 3.65562 14.6147 3.43049 14.6147 3.19557V3.20536ZM25.2627 7.30662C23.8003 7.30662 22.6151 6.09288 22.6151 4.59529V0.542969H21.1622H19.8431V4.59529C19.8431 6.68017 20.9615 8.49099 22.6151 9.44045C23.1981 9.77325 23.8576 10.0082 24.5554 10.0963C24.7848 10.1256 25.0238 10.1452 25.2627 10.1452C25.5017 10.1452 25.7406 10.1256 25.97 10.0963C26.6678 10.0082 27.3178 9.77325 27.9104 9.44045C29.564 8.49099 30.6823 6.68017 30.6823 4.59529V0.542969H29.3633H27.9104V4.59529C27.9104 6.09288 26.7251 7.30662 25.2627 7.30662ZM12.0053 16.1649H9.08999L11.7185 24.4556H12.1009H14.6338H15.9338H16.2874L18.6675 16.948L19.5659 14.1094L20.7894 10.2724L20.9615 9.72431L20.8276 10.1452H17.9123L17.8741 10.2724L14.2133 21.803H13.7927L12.0053 16.1649ZM28.4265 14.9218H22.6915C23.2841 13.9332 24.3451 13.2676 25.559 13.2676C26.7729 13.2676 27.8339 13.9332 28.4265 14.9218Z",
        fill: "#666481"
      })]
    });
  };

  const CloseIcon = () => {
    return jsxRuntime.jsxs("svg", {
      width: "24",
      height: "25",
      viewBox: "0 0 24 25",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [jsxRuntime.jsx("path", {
        d: "M18 6.5L6 18.5",
        stroke: "black"
      }), jsxRuntime.jsx("path", {
        d: "M6 6.5L18 18.5",
        stroke: "black"
      })]
    });
  };

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
  	return Array.isArray(val) ? [] : {}
  }

  function cloneUnlessOtherwiseSpecified(value, options) {
  	return (options.clone !== false && options.isMergeableObject(value))
  		? deepmerge(emptyTarget(value), value, options)
  		: value
  }

  function defaultArrayMerge(target, source, options) {
  	return target.concat(source).map(function(element) {
  		return cloneUnlessOtherwiseSpecified(element, options)
  	})
  }

  function mergeObject(target, source, options) {
  	var destination = {};
  	if (options.isMergeableObject(target)) {
  		Object.keys(target).forEach(function(key) {
  			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
  		});
  	}
  	Object.keys(source).forEach(function(key) {
  		if (!options.isMergeableObject(source[key]) || !target[key]) {
  			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
  		} else {
  			destination[key] = deepmerge(target[key], source[key], options);
  		}
  	});
  	return destination
  }

  function deepmerge(target, source, options) {
  	options = options || {};
  	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
  	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

  	var sourceIsArray = Array.isArray(source);
  	var targetIsArray = Array.isArray(target);
  	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  	if (!sourceAndTargetTypesMatch) {
  		return cloneUnlessOtherwiseSpecified(source, options)
  	} else if (sourceIsArray) {
  		return options.arrayMerge(target, source, options)
  	} else {
  		return mergeObject(target, source, options)
  	}
  }

  deepmerge.all = function deepmergeAll(array, options) {
  	if (!Array.isArray(array)) {
  		throw new Error('first argument should be an array')
  	}

  	return array.reduce(function(prev, next) {
  		return deepmerge(prev, next, options)
  	}, {})
  };

  var deepmerge_1 = deepmerge;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal || freeSelf || Function('return this')();

  /** Built-in value references. */
  var Symbol$1 = root.Symbol;

  /** Used for built-in method references. */
  var objectProto$d = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$a = objectProto$d.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$d.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty$a.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto$c.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  /** Built-in value references. */
  var getPrototype = overArg(Object.getPrototypeOf, Object);

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var objectTag$3 = '[object Object]';

  /** Used for built-in method references. */
  var funcProto$2 = Function.prototype,
      objectProto$b = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = funcProto$2.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString$2.call(Object);

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag$3) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$9.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString$2.call(Ctor) == objectCtorString;
  }

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject$1(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction$1(value) {
    if (!isObject$1(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
  }

  /** Used to detect overreaching core-js shims. */
  var coreJsData = root['__core-js_shared__'];

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString$1.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto = Function.prototype,
      objectProto$a = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString.call(hasOwnProperty$8).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject$1(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  /* Built-in method references that are verified to be native. */
  var Map$1 = getNative(root, 'Map');

  /* Built-in method references that are verified to be native. */
  var nativeCreate = getNative(Object, 'create');

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED$1 ? undefined : result;
    }
    return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
  }

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
  }

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$1 || ListCache),
      'string': new Hash
    };
  }

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  /**
   * A specialized version of `_.forEach` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  /** Used for built-in method references. */
  var objectProto$7 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$5.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag$2;
  }

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') &&
      !propertyIsEnumerable$1.call(value, 'callee');
  };

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  /** Detect free variable `exports`. */
  var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;

  /** Built-in value references. */
  var Buffer$1 = moduleExports$2 ? root.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer$1 ? Buffer$1.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag$4 = '[object Map]',
      numberTag$2 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$2 = '[object RegExp]',
      setTag$4 = '[object Set]',
      stringTag$2 = '[object String]',
      weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$3 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
  typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
  typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
  typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
  typedArrayTags[uint32Tag$2] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
  typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] =
  typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] =
  typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag$4] = typedArrayTags[numberTag$2] =
  typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$2] =
  typedArrayTags[setTag$4] = typedArrayTags[stringTag$2] =
  typedArrayTags[weakMapTag$2] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  /** Detect free variable `exports`. */
  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports$1 && freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  /* Node.js helper references. */
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$3.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

    return value === proto;
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = overArg(Object.keys, Object);

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction$1(value);
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto$2 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject$1(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$1.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
  }

  /** Detect free variable `exports`. */
  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? root.Buffer : undefined,
      allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length,
        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);
    return result;
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$1.propertyIsEnumerable;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbols = !nativeGetSymbols$1 ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeGetSymbols = Object.getOwnPropertySymbols;

  /**
   * Creates an array of the own and inherited enumerable symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of symbols.
   */
  var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush(result, getSymbols(object));
      object = getPrototype(object);
    }
    return result;
  };

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn(source), object);
  }

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn);
  }

  /* Built-in method references that are verified to be native. */
  var DataView = getNative(root, 'DataView');

  /* Built-in method references that are verified to be native. */
  var Promise$1 = getNative(root, 'Promise');

  /* Built-in method references that are verified to be native. */
  var Set = getNative(root, 'Set');

  /* Built-in method references that are verified to be native. */
  var WeakMap$1 = getNative(root, 'WeakMap');

  /** `Object#toString` result references. */
  var mapTag$3 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$3 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$2 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map$1),
      promiseCtorString = toSource(Promise$1),
      setCtorString = toSource(Set),
      weakMapCtorString = toSource(WeakMap$1);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = baseGetTag;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
      (Map$1 && getTag(new Map$1) != mapTag$3) ||
      (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
      (Set && getTag(new Set) != setTag$3) ||
      (WeakMap$1 && getTag(new WeakMap$1) != weakMapTag$1)) {
    getTag = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$2;
          case mapCtorString: return mapTag$3;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$3;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  /** Built-in value references. */
  var Uint8Array$1 = root.Uint8Array;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array$1(result).set(new Uint8Array$1(arrayBuffer));
    return result;
  }

  /**
   * Creates a clone of `dataView`.
   *
   * @private
   * @param {Object} dataView The data view to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned data view.
   */
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /**
   * Creates a clone of `regexp`.
   *
   * @private
   * @param {Object} regexp The regexp to clone.
   * @returns {Object} Returns the cloned regexp.
   */
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  /** Used to convert symbols to primitives and strings. */
  var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

  /**
   * Creates a clone of the `symbol` object.
   *
   * @private
   * @param {Object} symbol The symbol object to clone.
   * @returns {Object} Returns the cloned symbol object.
   */
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  /** `Object#toString` result references. */
  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag$2 = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$1:
        return cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return cloneTypedArray(object, isDeep);

      case mapTag$2:
        return new Ctor;

      case numberTag$1:
      case stringTag$1:
        return new Ctor(object);

      case regexpTag$1:
        return cloneRegExp(object);

      case setTag$2:
        return new Ctor;

      case symbolTag$2:
        return cloneSymbol(object);
    }
  }

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject$1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototype(object))
      : {};
  }

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]';

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap(value) {
    return isObjectLike(value) && getTag(value) == mapTag$1;
  }

  /* Node.js helper references. */
  var nodeIsMap = nodeUtil && nodeUtil.isMap;

  /**
   * Checks if `value` is classified as a `Map` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   * @example
   *
   * _.isMap(new Map);
   * // => true
   *
   * _.isMap(new WeakMap);
   * // => false
   */
  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

  /** `Object#toString` result references. */
  var setTag$1 = '[object Set]';

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet(value) {
    return isObjectLike(value) && getTag(value) == setTag$1;
  }

  /* Node.js helper references. */
  var nodeIsSet = nodeUtil && nodeUtil.isSet;

  /**
   * Checks if `value` is classified as a `Set` object.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   * @example
   *
   * _.isSet(new Set);
   * // => true
   *
   * _.isSet(new WeakSet);
   * // => false
   */
  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG$1 = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG$2 = 4;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag$1 = '[object Symbol]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
  cloneableTags[boolTag] = cloneableTags[dateTag] =
  cloneableTags[float32Tag] = cloneableTags[float64Tag] =
  cloneableTags[int8Tag] = cloneableTags[int16Tag] =
  cloneableTags[int32Tag] = cloneableTags[mapTag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[setTag] =
  cloneableTags[stringTag] = cloneableTags[symbolTag$1] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[weakMapTag] = false;

  /**
   * The base implementation of `_.clone` and `_.cloneDeep` which tracks
   * traversed objects.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} bitmask The bitmask flags.
   *  1 - Deep clone
   *  2 - Flatten inherited properties
   *  4 - Clone symbols
   * @param {Function} [customizer] The function to customize cloning.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The parent object of `value`.
   * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG$1,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG$2;
    if (result !== undefined) {
      return result;
    }
    if (!isObject$1(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value),
          isFunc = tag == funcTag || tag == genTag;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    // Check for circular references and return its corresponding clone.
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });
    }

    var keysFunc = isFull
      ? (isFlat ? getAllKeysIn : getAllKeys)
      : (isFlat ? keysIn : keys);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      // Recursively populate clone (susceptible to call stack limits).
      assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  /** Used to compose bitmasks for cloning. */
  var CLONE_DEEP_FLAG = 1,
      CLONE_SYMBOLS_FLAG$1 = 4;

  /**
   * This method is like `_.clone` except that it recursively clones `value`.
   *
   * @static
   * @memberOf _
   * @since 1.0.0
   * @category Lang
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   * @see _.clone
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var deep = _.cloneDeep(objects);
   * console.log(deep[0] === objects[0]);
   * // => false
   */
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG$1);
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var reactFastCompare;
  var hasRequiredReactFastCompare;

  function requireReactFastCompare () {
  	if (hasRequiredReactFastCompare) return reactFastCompare;
  	hasRequiredReactFastCompare = 1;

  	var isArray = Array.isArray;
  	var keyList = Object.keys;
  	var hasProp = Object.prototype.hasOwnProperty;
  	var hasElementType = typeof Element !== 'undefined';

  	function equal(a, b) {
  	  // fast-deep-equal index.js 2.0.1
  	  if (a === b) return true;

  	  if (a && b && typeof a == 'object' && typeof b == 'object') {
  	    var arrA = isArray(a)
  	      , arrB = isArray(b)
  	      , i
  	      , length
  	      , key;

  	    if (arrA && arrB) {
  	      length = a.length;
  	      if (length != b.length) return false;
  	      for (i = length; i-- !== 0;)
  	        if (!equal(a[i], b[i])) return false;
  	      return true;
  	    }

  	    if (arrA != arrB) return false;

  	    var dateA = a instanceof Date
  	      , dateB = b instanceof Date;
  	    if (dateA != dateB) return false;
  	    if (dateA && dateB) return a.getTime() == b.getTime();

  	    var regexpA = a instanceof RegExp
  	      , regexpB = b instanceof RegExp;
  	    if (regexpA != regexpB) return false;
  	    if (regexpA && regexpB) return a.toString() == b.toString();

  	    var keys = keyList(a);
  	    length = keys.length;

  	    if (length !== keyList(b).length)
  	      return false;

  	    for (i = length; i-- !== 0;)
  	      if (!hasProp.call(b, keys[i])) return false;
  	    // end fast-deep-equal

  	    // start react-fast-compare
  	    // custom handling for DOM elements
  	    if (hasElementType && a instanceof Element && b instanceof Element)
  	      return a === b;

  	    // custom handling for React
  	    for (i = length; i-- !== 0;) {
  	      key = keys[i];
  	      if (key === '_owner' && a.$$typeof) {
  	        // React-specific: avoid traversing React elements' _owner.
  	        //  _owner contains circular references
  	        // and is not needed when comparing the actual elements (and not their owners)
  	        // .$$typeof and ._store on just reasonable markers of a react element
  	        continue;
  	      } else {
  	        // all other properties should be traversed as usual
  	        if (!equal(a[key], b[key])) return false;
  	      }
  	    }
  	    // end react-fast-compare

  	    // fast-deep-equal index.js 2.0.1
  	    return true;
  	  }

  	  return a !== a && b !== b;
  	}
  	// end fast-deep-equal

  	reactFastCompare = function exportedEqual(a, b) {
  	  try {
  	    return equal(a, b);
  	  } catch (error) {
  	    if ((error.message && error.message.match(/stack|recursion/i)) || (error.number === -2146828260)) {
  	      // warn on circular references, don't crash
  	      // browsers give this different errors name and messages:
  	      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
  	      // firefox: "InternalError", too much recursion"
  	      // edge: "Error", "Out of stack space"
  	      console.warn('Warning: react-fast-compare does not handle circular references.', error.name, error.message);
  	      return false;
  	    }
  	    // some other error. we should definitely know about these
  	    throw error;
  	  }
  	};
  	return reactFastCompare;
  }

  var reactFastCompareExports = requireReactFastCompare();
  var isEqual = /*@__PURE__*/getDefaultExportFromCjs(reactFastCompareExports);

  var isProduction = process.env.NODE_ENV === 'production';
  function warning(condition, message) {
    if (!isProduction) {

      var text = "Warning: " + message;

      if (typeof console !== 'undefined') {
        console.warn(text);
      }

      try {
        throw Error(text);
      } catch (x) {}
    }
  }

  /** Used to compose bitmasks for cloning. */
  var CLONE_SYMBOLS_FLAG = 4;

  /**
   * Creates a shallow clone of `value`.
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
   * and supports cloning arrays, array buffers, booleans, date objects, maps,
   * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
   * arrays. The own enumerable properties of `arguments` objects are cloned
   * as plain objects. An empty object is returned for uncloneable values such
   * as error objects, functions, DOM nodes, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to clone.
   * @returns {*} Returns the cloned value.
   * @see _.cloneDeep
   * @example
   *
   * var objects = [{ 'a': 1 }, { 'b': 2 }];
   *
   * var shallow = _.clone(objects);
   * console.log(shallow[0] === objects[0]);
   * // => true
   */
  function clone(value) {
    return baseClone(value, CLONE_SYMBOLS_FLAG);
  }

  /**
   * A specialized version of `_.map` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /**
   * Creates a function that memoizes the result of `func`. If `resolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key. The `func`
   * is invoked with the `this` binding of the memoized function.
   *
   * **Note:** The cache is exposed as the `cache` property on the memoized
   * function. Its creation may be customized by replacing the `_.memoize.Cache`
   * constructor with one whose instances implement the
   * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
   * method interface of `clear`, `delete`, `get`, `has`, and `set`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to have its output memoized.
   * @param {Function} [resolver] The function to resolve the cache key.
   * @returns {Function} Returns the new memoized function.
   * @example
   *
   * var object = { 'a': 1, 'b': 2 };
   * var other = { 'c': 3, 'd': 4 };
   *
   * var values = _.memoize(_.values);
   * values(object);
   * // => [1, 2]
   *
   * values(other);
   * // => [3, 4]
   *
   * object.a = 2;
   * values(object);
   * // => [1, 2]
   *
   * // Modify the result cache.
   * values.cache.set(object, ['a', 'b']);
   * values(object);
   * // => ['a', 'b']
   *
   * // Replace `_.memoize.Cache`.
   * _.memoize.Cache = WeakMap;
   */
  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }

  // Expose `MapCache`.
  memoize.Cache = MapCache;

  /** Used as the maximum memoize cache size. */
  var MAX_MEMOIZE_SIZE = 500;

  /**
   * A specialized version of `_.memoize` which clears the memoized function's
   * cache when it exceeds `MAX_MEMOIZE_SIZE`.
   *
   * @private
   * @param {Function} func The function to have its output memoized.
   * @returns {Function} Returns the new memoized function.
   */
  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });

    var cache = result.cache;
    return result;
  }

  /** Used to match property names within property paths. */
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */
  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46 /* . */) {
      result.push('');
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -Infinity) ? '-0' : result;
  }

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -Infinity) ? '-0' : result;
  }

  /**
   * Converts `value` to a string. An empty string is returned for `null`
   * and `undefined` values. The sign of `-0` is preserved.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   * @example
   *
   * _.toString(null);
   * // => ''
   *
   * _.toString(-0);
   * // => '-0'
   *
   * _.toString([1, 2, 3]);
   * // => '1,2,3'
   */
  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  /**
   * Converts `value` to a property path array.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Util
   * @param {*} value The value to convert.
   * @returns {Array} Returns the new property path array.
   * @example
   *
   * _.toPath('a.b.c');
   * // => ['a', 'b', 'c']
   *
   * _.toPath('a[0].b.c');
   * // => ['a', '0', 'b', 'c']
   */
  function toPath(value) {
    if (isArray(value)) {
      return arrayMap(value, toKey);
    }
    return isSymbol(value) ? [value] : copyArray(stringToPath(toString(value)));
  }

  var reactIs = {exports: {}};

  var reactIs_production_min = {};

  /** @license React v16.13.1
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredReactIs_production_min;

  function requireReactIs_production_min () {
  	if (hasRequiredReactIs_production_min) return reactIs_production_min;
  	hasRequiredReactIs_production_min = 1;
  var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?
  	Symbol.for("react.suspense_list"):60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.block"):60121,w=b?Symbol.for("react.fundamental"):60117,x=b?Symbol.for("react.responder"):60118,y=b?Symbol.for("react.scope"):60119;
  	function z(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function A(a){return z(a)===m}reactIs_production_min.AsyncMode=l;reactIs_production_min.ConcurrentMode=m;reactIs_production_min.ContextConsumer=k;reactIs_production_min.ContextProvider=h;reactIs_production_min.Element=c;reactIs_production_min.ForwardRef=n;reactIs_production_min.Fragment=e;reactIs_production_min.Lazy=t;reactIs_production_min.Memo=r;reactIs_production_min.Portal=d;
  	reactIs_production_min.Profiler=g;reactIs_production_min.StrictMode=f;reactIs_production_min.Suspense=p;reactIs_production_min.isAsyncMode=function(a){return A(a)||z(a)===l};reactIs_production_min.isConcurrentMode=A;reactIs_production_min.isContextConsumer=function(a){return z(a)===k};reactIs_production_min.isContextProvider=function(a){return z(a)===h};reactIs_production_min.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};reactIs_production_min.isForwardRef=function(a){return z(a)===n};reactIs_production_min.isFragment=function(a){return z(a)===e};reactIs_production_min.isLazy=function(a){return z(a)===t};
  	reactIs_production_min.isMemo=function(a){return z(a)===r};reactIs_production_min.isPortal=function(a){return z(a)===d};reactIs_production_min.isProfiler=function(a){return z(a)===g};reactIs_production_min.isStrictMode=function(a){return z(a)===f};reactIs_production_min.isSuspense=function(a){return z(a)===p};
  	reactIs_production_min.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===w||a.$$typeof===x||a.$$typeof===y||a.$$typeof===v)};reactIs_production_min.typeOf=z;
  	return reactIs_production_min;
  }

  var reactIs_development = {};

  /** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var hasRequiredReactIs_development;

  function requireReactIs_development () {
  	if (hasRequiredReactIs_development) return reactIs_development;
  	hasRequiredReactIs_development = 1;



  	if (process.env.NODE_ENV !== "production") {
  	  (function() {

  	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
  	// nor polyfill, then a plain number is used for performance.
  	var hasSymbol = typeof Symbol === 'function' && Symbol.for;
  	var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
  	var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
  	var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
  	var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
  	var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
  	var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
  	var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
  	// (unstable) APIs that have been removed. Can we remove the symbols?

  	var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
  	var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
  	var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  	var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
  	var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
  	var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
  	var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
  	var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
  	var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
  	var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
  	var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

  	function isValidElementType(type) {
  	  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  	  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
  	}

  	function typeOf(object) {
  	  if (typeof object === 'object' && object !== null) {
  	    var $$typeof = object.$$typeof;

  	    switch ($$typeof) {
  	      case REACT_ELEMENT_TYPE:
  	        var type = object.type;

  	        switch (type) {
  	          case REACT_ASYNC_MODE_TYPE:
  	          case REACT_CONCURRENT_MODE_TYPE:
  	          case REACT_FRAGMENT_TYPE:
  	          case REACT_PROFILER_TYPE:
  	          case REACT_STRICT_MODE_TYPE:
  	          case REACT_SUSPENSE_TYPE:
  	            return type;

  	          default:
  	            var $$typeofType = type && type.$$typeof;

  	            switch ($$typeofType) {
  	              case REACT_CONTEXT_TYPE:
  	              case REACT_FORWARD_REF_TYPE:
  	              case REACT_LAZY_TYPE:
  	              case REACT_MEMO_TYPE:
  	              case REACT_PROVIDER_TYPE:
  	                return $$typeofType;

  	              default:
  	                return $$typeof;
  	            }

  	        }

  	      case REACT_PORTAL_TYPE:
  	        return $$typeof;
  	    }
  	  }

  	  return undefined;
  	} // AsyncMode is deprecated along with isAsyncMode

  	var AsyncMode = REACT_ASYNC_MODE_TYPE;
  	var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
  	var ContextConsumer = REACT_CONTEXT_TYPE;
  	var ContextProvider = REACT_PROVIDER_TYPE;
  	var Element = REACT_ELEMENT_TYPE;
  	var ForwardRef = REACT_FORWARD_REF_TYPE;
  	var Fragment = REACT_FRAGMENT_TYPE;
  	var Lazy = REACT_LAZY_TYPE;
  	var Memo = REACT_MEMO_TYPE;
  	var Portal = REACT_PORTAL_TYPE;
  	var Profiler = REACT_PROFILER_TYPE;
  	var StrictMode = REACT_STRICT_MODE_TYPE;
  	var Suspense = REACT_SUSPENSE_TYPE;
  	var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

  	function isAsyncMode(object) {
  	  {
  	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
  	      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

  	      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
  	    }
  	  }

  	  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
  	}
  	function isConcurrentMode(object) {
  	  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
  	}
  	function isContextConsumer(object) {
  	  return typeOf(object) === REACT_CONTEXT_TYPE;
  	}
  	function isContextProvider(object) {
  	  return typeOf(object) === REACT_PROVIDER_TYPE;
  	}
  	function isElement(object) {
  	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  	}
  	function isForwardRef(object) {
  	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
  	}
  	function isFragment(object) {
  	  return typeOf(object) === REACT_FRAGMENT_TYPE;
  	}
  	function isLazy(object) {
  	  return typeOf(object) === REACT_LAZY_TYPE;
  	}
  	function isMemo(object) {
  	  return typeOf(object) === REACT_MEMO_TYPE;
  	}
  	function isPortal(object) {
  	  return typeOf(object) === REACT_PORTAL_TYPE;
  	}
  	function isProfiler(object) {
  	  return typeOf(object) === REACT_PROFILER_TYPE;
  	}
  	function isStrictMode(object) {
  	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
  	}
  	function isSuspense(object) {
  	  return typeOf(object) === REACT_SUSPENSE_TYPE;
  	}

  	reactIs_development.AsyncMode = AsyncMode;
  	reactIs_development.ConcurrentMode = ConcurrentMode;
  	reactIs_development.ContextConsumer = ContextConsumer;
  	reactIs_development.ContextProvider = ContextProvider;
  	reactIs_development.Element = Element;
  	reactIs_development.ForwardRef = ForwardRef;
  	reactIs_development.Fragment = Fragment;
  	reactIs_development.Lazy = Lazy;
  	reactIs_development.Memo = Memo;
  	reactIs_development.Portal = Portal;
  	reactIs_development.Profiler = Profiler;
  	reactIs_development.StrictMode = StrictMode;
  	reactIs_development.Suspense = Suspense;
  	reactIs_development.isAsyncMode = isAsyncMode;
  	reactIs_development.isConcurrentMode = isConcurrentMode;
  	reactIs_development.isContextConsumer = isContextConsumer;
  	reactIs_development.isContextProvider = isContextProvider;
  	reactIs_development.isElement = isElement;
  	reactIs_development.isForwardRef = isForwardRef;
  	reactIs_development.isFragment = isFragment;
  	reactIs_development.isLazy = isLazy;
  	reactIs_development.isMemo = isMemo;
  	reactIs_development.isPortal = isPortal;
  	reactIs_development.isProfiler = isProfiler;
  	reactIs_development.isStrictMode = isStrictMode;
  	reactIs_development.isSuspense = isSuspense;
  	reactIs_development.isValidElementType = isValidElementType;
  	reactIs_development.typeOf = typeOf;
  	  })();
  	}
  	return reactIs_development;
  }

  var hasRequiredReactIs;

  function requireReactIs () {
  	if (hasRequiredReactIs) return reactIs.exports;
  	hasRequiredReactIs = 1;

  	if (process.env.NODE_ENV === 'production') {
  	  reactIs.exports = requireReactIs_production_min();
  	} else {
  	  reactIs.exports = requireReactIs_development();
  	}
  	return reactIs.exports;
  }

  var hoistNonReactStatics_cjs;
  var hasRequiredHoistNonReactStatics_cjs;

  function requireHoistNonReactStatics_cjs () {
  	if (hasRequiredHoistNonReactStatics_cjs) return hoistNonReactStatics_cjs;
  	hasRequiredHoistNonReactStatics_cjs = 1;

  	var reactIs = requireReactIs();

  	/**
  	 * Copyright 2015, Yahoo! Inc.
  	 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
  	 */
  	var REACT_STATICS = {
  	  childContextTypes: true,
  	  contextType: true,
  	  contextTypes: true,
  	  defaultProps: true,
  	  displayName: true,
  	  getDefaultProps: true,
  	  getDerivedStateFromError: true,
  	  getDerivedStateFromProps: true,
  	  mixins: true,
  	  propTypes: true,
  	  type: true
  	};
  	var KNOWN_STATICS = {
  	  name: true,
  	  length: true,
  	  prototype: true,
  	  caller: true,
  	  callee: true,
  	  arguments: true,
  	  arity: true
  	};
  	var FORWARD_REF_STATICS = {
  	  '$$typeof': true,
  	  render: true,
  	  defaultProps: true,
  	  displayName: true,
  	  propTypes: true
  	};
  	var MEMO_STATICS = {
  	  '$$typeof': true,
  	  compare: true,
  	  defaultProps: true,
  	  displayName: true,
  	  propTypes: true,
  	  type: true
  	};
  	var TYPE_STATICS = {};
  	TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
  	TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

  	function getStatics(component) {
  	  // React v16.11 and below
  	  if (reactIs.isMemo(component)) {
  	    return MEMO_STATICS;
  	  } // React v16.12 and above


  	  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
  	}

  	var defineProperty = Object.defineProperty;
  	var getOwnPropertyNames = Object.getOwnPropertyNames;
  	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  	var getPrototypeOf = Object.getPrototypeOf;
  	var objectPrototype = Object.prototype;
  	function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  	  if (typeof sourceComponent !== 'string') {
  	    // don't hoist over string (html) components
  	    if (objectPrototype) {
  	      var inheritedComponent = getPrototypeOf(sourceComponent);

  	      if (inheritedComponent && inheritedComponent !== objectPrototype) {
  	        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
  	      }
  	    }

  	    var keys = getOwnPropertyNames(sourceComponent);

  	    if (getOwnPropertySymbols) {
  	      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
  	    }

  	    var targetStatics = getStatics(targetComponent);
  	    var sourceStatics = getStatics(sourceComponent);

  	    for (var i = 0; i < keys.length; ++i) {
  	      var key = keys[i];

  	      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
  	        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

  	        try {
  	          // Avoid failures from read-only properties
  	          defineProperty(targetComponent, key, descriptor);
  	        } catch (e) {}
  	      }
  	    }
  	  }

  	  return targetComponent;
  	}

  	hoistNonReactStatics_cjs = hoistNonReactStatics;
  	return hoistNonReactStatics_cjs;
  }

  requireHoistNonReactStatics_cjs();

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var FormikContext = /*#__PURE__*/react.createContext(undefined);
  FormikContext.displayName = 'FormikContext';
  var FormikProvider = FormikContext.Provider;
  FormikContext.Consumer;
  function useFormikContext() {
    var formik = react.useContext(FormikContext);
    !!!formik ? process.env.NODE_ENV !== "production" ? warning(false, "Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.") : warning() : void 0;
    return formik;
  }
  /** @private is the given object a Function? */

  var isFunction = function isFunction(obj) {
    return typeof obj === 'function';
  };
  /** @private is the given object an Object? */

  var isObject = function isObject(obj) {
    return obj !== null && typeof obj === 'object';
  };
  /** @private is the given object an integer? */

  var isInteger = function isInteger(obj) {
    return String(Math.floor(Number(obj))) === obj;
  };
  /** @private is the given object a string? */

  var isString = function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  };
  /** @private Does a React component have exactly 0 children? */

  var isEmptyChildren = function isEmptyChildren(children) {
    return react.Children.count(children) === 0;
  };
  /** @private is the given object/value a promise? */

  var isPromise = function isPromise(value) {
    return isObject(value) && isFunction(value.then);
  };
  /**
   * Same as document.activeElement but wraps in a try-catch block. In IE it is
   * not safe to call document.activeElement if there is nothing focused.
   *
   * The activeElement will be null only if the document or document body is not
   * yet defined.
   *
   * @param {?Document} doc Defaults to current document.
   * @return {Element | null}
   * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/dom/getActiveElement.js
   */

  function getActiveElement(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : undefined);

    if (typeof doc === 'undefined') {
      return null;
    }

    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }
  /**
   * Deeply get a value from an object via its path.
   */

  function getIn(obj, key, def, p) {
    if (p === void 0) {
      p = 0;
    }

    var path = toPath(key);

    while (obj && p < path.length) {
      obj = obj[path[p++]];
    } // check if path is not in the end


    if (p !== path.length && !obj) {
      return def;
    }

    return obj === undefined ? def : obj;
  }
  /**
   * Deeply set a value from in object via it's path. If the value at `path`
   * has changed, return a shallow copy of obj with `value` set at `path`.
   * If `value` has not changed, return the original `obj`.
   *
   * Existing objects / arrays along `path` are also shallow copied. Sibling
   * objects along path retain the same internal js reference. Since new
   * objects / arrays are only created along `path`, we can test if anything
   * changed in a nested structure by comparing the object's reference in
   * the old and new object, similar to how russian doll cache invalidation
   * works.
   *
   * In earlier versions of this function, which used cloneDeep, there were
   * issues whereby settings a nested value would mutate the parent
   * instead of creating a new object. `clone` avoids that bug making a
   * shallow copy of the objects along the update path
   * so no object is mutated in place.
   *
   * Before changing this function, please read through the following
   * discussions.
   *
   * @see https://github.com/developit/linkstate
   * @see https://github.com/jaredpalmer/formik/pull/123
   */

  function setIn(obj, path, value) {
    var res = clone(obj); // this keeps inheritance when obj is a class

    var resVal = res;
    var i = 0;
    var pathArray = toPath(path);

    for (; i < pathArray.length - 1; i++) {
      var currentPath = pathArray[i];
      var currentObj = getIn(obj, pathArray.slice(0, i + 1));

      if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
        resVal = resVal[currentPath] = clone(currentObj);
      } else {
        var nextPath = pathArray[i + 1];
        resVal = resVal[currentPath] = isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
      }
    } // Return original object if new value is the same as current


    if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
      return obj;
    }

    if (value === undefined) {
      delete resVal[pathArray[i]];
    } else {
      resVal[pathArray[i]] = value;
    } // If the path array has a single element, the loop did not run.
    // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.


    if (i === 0 && value === undefined) {
      delete res[pathArray[i]];
    }

    return res;
  }
  /**
   * Recursively a set the same value for all keys and arrays nested object, cloning
   * @param object
   * @param value
   * @param visited
   * @param response
   */

  function setNestedObjectValues(object, value, visited, response) {
    if (visited === void 0) {
      visited = new WeakMap();
    }

    if (response === void 0) {
      response = {};
    }

    for (var _i = 0, _Object$keys = Object.keys(object); _i < _Object$keys.length; _i++) {
      var k = _Object$keys[_i];
      var val = object[k];

      if (isObject(val)) {
        if (!visited.get(val)) {
          visited.set(val, true); // In order to keep array values consistent for both dot path  and
          // bracket syntax, we need to check if this is an array so that
          // this will output  { friends: [true] } and not { friends: { "0": true } }

          response[k] = Array.isArray(val) ? [] : {};
          setNestedObjectValues(val, value, visited, response[k]);
        }
      } else {
        response[k] = value;
      }
    }

    return response;
  }

  function formikReducer(state, msg) {
    switch (msg.type) {
      case 'SET_VALUES':
        return _extends({}, state, {
          values: msg.payload
        });

      case 'SET_TOUCHED':
        return _extends({}, state, {
          touched: msg.payload
        });

      case 'SET_ERRORS':
        if (isEqual(state.errors, msg.payload)) {
          return state;
        }

        return _extends({}, state, {
          errors: msg.payload
        });

      case 'SET_STATUS':
        return _extends({}, state, {
          status: msg.payload
        });

      case 'SET_ISSUBMITTING':
        return _extends({}, state, {
          isSubmitting: msg.payload
        });

      case 'SET_ISVALIDATING':
        return _extends({}, state, {
          isValidating: msg.payload
        });

      case 'SET_FIELD_VALUE':
        return _extends({}, state, {
          values: setIn(state.values, msg.payload.field, msg.payload.value)
        });

      case 'SET_FIELD_TOUCHED':
        return _extends({}, state, {
          touched: setIn(state.touched, msg.payload.field, msg.payload.value)
        });

      case 'SET_FIELD_ERROR':
        return _extends({}, state, {
          errors: setIn(state.errors, msg.payload.field, msg.payload.value)
        });

      case 'RESET_FORM':
        return _extends({}, state, msg.payload);

      case 'SET_FORMIK_STATE':
        return msg.payload(state);

      case 'SUBMIT_ATTEMPT':
        return _extends({}, state, {
          touched: setNestedObjectValues(state.values, true),
          isSubmitting: true,
          submitCount: state.submitCount + 1
        });

      case 'SUBMIT_FAILURE':
        return _extends({}, state, {
          isSubmitting: false
        });

      case 'SUBMIT_SUCCESS':
        return _extends({}, state, {
          isSubmitting: false
        });

      default:
        return state;
    }
  } // Initial empty states // objects


  var emptyErrors = {};
  var emptyTouched = {};
  function useFormik(_ref) {
    var _ref$validateOnChange = _ref.validateOnChange,
        validateOnChange = _ref$validateOnChange === void 0 ? true : _ref$validateOnChange,
        _ref$validateOnBlur = _ref.validateOnBlur,
        validateOnBlur = _ref$validateOnBlur === void 0 ? true : _ref$validateOnBlur,
        _ref$validateOnMount = _ref.validateOnMount,
        validateOnMount = _ref$validateOnMount === void 0 ? false : _ref$validateOnMount,
        isInitialValid = _ref.isInitialValid,
        _ref$enableReinitiali = _ref.enableReinitialize,
        enableReinitialize = _ref$enableReinitiali === void 0 ? false : _ref$enableReinitiali,
        onSubmit = _ref.onSubmit,
        rest = _objectWithoutPropertiesLoose(_ref, ["validateOnChange", "validateOnBlur", "validateOnMount", "isInitialValid", "enableReinitialize", "onSubmit"]);

    var props = _extends({
      validateOnChange: validateOnChange,
      validateOnBlur: validateOnBlur,
      validateOnMount: validateOnMount,
      onSubmit: onSubmit
    }, rest);

    var initialValues = react.useRef(props.initialValues);
    var initialErrors = react.useRef(props.initialErrors || emptyErrors);
    var initialTouched = react.useRef(props.initialTouched || emptyTouched);
    var initialStatus = react.useRef(props.initialStatus);
    var isMounted = react.useRef(false);
    var fieldRegistry = react.useRef({});

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      react.useEffect(function () {
        !(typeof isInitialValid === 'undefined') ? process.env.NODE_ENV !== "production" ? warning(false, 'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.') : warning() : void 0; // eslint-disable-next-line
      }, []);
    }

    react.useEffect(function () {
      isMounted.current = true;
      return function () {
        isMounted.current = false;
      };
    }, []);

    var _React$useState = react.useState(0),
        setIteration = _React$useState[1];

    var stateRef = react.useRef({
      values: cloneDeep(props.initialValues),
      errors: cloneDeep(props.initialErrors) || emptyErrors,
      touched: cloneDeep(props.initialTouched) || emptyTouched,
      status: cloneDeep(props.initialStatus),
      isSubmitting: false,
      isValidating: false,
      submitCount: 0
    });
    var state = stateRef.current;
    var dispatch = react.useCallback(function (action) {
      var prev = stateRef.current;
      stateRef.current = formikReducer(prev, action); // force rerender

      if (prev !== stateRef.current) setIteration(function (x) {
        return x + 1;
      });
    }, []);
    var runValidateHandler = react.useCallback(function (values, field) {
      return new Promise(function (resolve, reject) {
        var maybePromisedErrors = props.validate(values, field);

        if (maybePromisedErrors == null) {
          // use loose null check here on purpose
          resolve(emptyErrors);
        } else if (isPromise(maybePromisedErrors)) {
          maybePromisedErrors.then(function (errors) {
            resolve(errors || emptyErrors);
          }, function (actualException) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn("Warning: An unhandled error was caught during validation in <Formik validate />", actualException);
            }

            reject(actualException);
          });
        } else {
          resolve(maybePromisedErrors);
        }
      });
    }, [props.validate]);
    /**
     * Run validation against a Yup schema and optionally run a function if successful
     */

    var runValidationSchema = react.useCallback(function (values, field) {
      var validationSchema = props.validationSchema;
      var schema = isFunction(validationSchema) ? validationSchema(field) : validationSchema;
      var promise = field && schema.validateAt ? schema.validateAt(field, values) : validateYupSchema(values, schema);
      return new Promise(function (resolve, reject) {
        promise.then(function () {
          resolve(emptyErrors);
        }, function (err) {
          // Yup will throw a validation error if validation fails. We catch those and
          // resolve them into Formik errors. We can sniff if something is a Yup error
          // by checking error.name.
          // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
          if (err.name === 'ValidationError') {
            resolve(yupToFormErrors(err));
          } else {
            // We throw any other errors
            if (process.env.NODE_ENV !== 'production') {
              console.warn("Warning: An unhandled error was caught during validation in <Formik validationSchema />", err);
            }

            reject(err);
          }
        });
      });
    }, [props.validationSchema]);
    var runSingleFieldLevelValidation = react.useCallback(function (field, value) {
      return new Promise(function (resolve) {
        return resolve(fieldRegistry.current[field].validate(value));
      });
    }, []);
    var runFieldLevelValidations = react.useCallback(function (values) {
      var fieldKeysWithValidation = Object.keys(fieldRegistry.current).filter(function (f) {
        return isFunction(fieldRegistry.current[f].validate);
      }); // Construct an array with all of the field validation functions

      var fieldValidations = fieldKeysWithValidation.length > 0 ? fieldKeysWithValidation.map(function (f) {
        return runSingleFieldLevelValidation(f, getIn(values, f));
      }) : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')]; // use special case ;)

      return Promise.all(fieldValidations).then(function (fieldErrorsList) {
        return fieldErrorsList.reduce(function (prev, curr, index) {
          if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
            return prev;
          }

          if (curr) {
            prev = setIn(prev, fieldKeysWithValidation[index], curr);
          }

          return prev;
        }, {});
      });
    }, [runSingleFieldLevelValidation]); // Run all validations and return the result

    var runAllValidations = react.useCallback(function (values) {
      return Promise.all([runFieldLevelValidations(values), props.validationSchema ? runValidationSchema(values) : {}, props.validate ? runValidateHandler(values) : {}]).then(function (_ref2) {
        var fieldErrors = _ref2[0],
            schemaErrors = _ref2[1],
            validateErrors = _ref2[2];
        var combinedErrors = deepmerge_1.all([fieldErrors, schemaErrors, validateErrors], {
          arrayMerge: arrayMerge
        });
        return combinedErrors;
      });
    }, [props.validate, props.validationSchema, runFieldLevelValidations, runValidateHandler, runValidationSchema]); // Run all validations methods and update state accordingly

    var validateFormWithHighPriority = useEventCallback(function (values) {
      if (values === void 0) {
        values = state.values;
      }

      dispatch({
        type: 'SET_ISVALIDATING',
        payload: true
      });
      return runAllValidations(values).then(function (combinedErrors) {
        if (!!isMounted.current) {
          dispatch({
            type: 'SET_ISVALIDATING',
            payload: false
          });
          dispatch({
            type: 'SET_ERRORS',
            payload: combinedErrors
          });
        }

        return combinedErrors;
      });
    });
    react.useEffect(function () {
      if (validateOnMount && isMounted.current === true && isEqual(initialValues.current, props.initialValues)) {
        validateFormWithHighPriority(initialValues.current);
      }
    }, [validateOnMount, validateFormWithHighPriority]);
    var resetForm = react.useCallback(function (nextState) {
      var values = nextState && nextState.values ? nextState.values : initialValues.current;
      var errors = nextState && nextState.errors ? nextState.errors : initialErrors.current ? initialErrors.current : props.initialErrors || {};
      var touched = nextState && nextState.touched ? nextState.touched : initialTouched.current ? initialTouched.current : props.initialTouched || {};
      var status = nextState && nextState.status ? nextState.status : initialStatus.current ? initialStatus.current : props.initialStatus;
      initialValues.current = values;
      initialErrors.current = errors;
      initialTouched.current = touched;
      initialStatus.current = status;

      var dispatchFn = function dispatchFn() {
        dispatch({
          type: 'RESET_FORM',
          payload: {
            isSubmitting: !!nextState && !!nextState.isSubmitting,
            errors: errors,
            touched: touched,
            status: status,
            values: values,
            isValidating: !!nextState && !!nextState.isValidating,
            submitCount: !!nextState && !!nextState.submitCount && typeof nextState.submitCount === 'number' ? nextState.submitCount : 0
          }
        });
      };

      if (props.onReset) {
        var maybePromisedOnReset = props.onReset(state.values, imperativeMethods);

        if (isPromise(maybePromisedOnReset)) {
          maybePromisedOnReset.then(dispatchFn);
        } else {
          dispatchFn();
        }
      } else {
        dispatchFn();
      }
    }, [props.initialErrors, props.initialStatus, props.initialTouched, props.onReset]);
    react.useEffect(function () {
      if (isMounted.current === true && !isEqual(initialValues.current, props.initialValues)) {
        if (enableReinitialize) {
          initialValues.current = props.initialValues;
          resetForm();

          if (validateOnMount) {
            validateFormWithHighPriority(initialValues.current);
          }
        }
      }
    }, [enableReinitialize, props.initialValues, resetForm, validateOnMount, validateFormWithHighPriority]);
    react.useEffect(function () {
      if (enableReinitialize && isMounted.current === true && !isEqual(initialErrors.current, props.initialErrors)) {
        initialErrors.current = props.initialErrors || emptyErrors;
        dispatch({
          type: 'SET_ERRORS',
          payload: props.initialErrors || emptyErrors
        });
      }
    }, [enableReinitialize, props.initialErrors]);
    react.useEffect(function () {
      if (enableReinitialize && isMounted.current === true && !isEqual(initialTouched.current, props.initialTouched)) {
        initialTouched.current = props.initialTouched || emptyTouched;
        dispatch({
          type: 'SET_TOUCHED',
          payload: props.initialTouched || emptyTouched
        });
      }
    }, [enableReinitialize, props.initialTouched]);
    react.useEffect(function () {
      if (enableReinitialize && isMounted.current === true && !isEqual(initialStatus.current, props.initialStatus)) {
        initialStatus.current = props.initialStatus;
        dispatch({
          type: 'SET_STATUS',
          payload: props.initialStatus
        });
      }
    }, [enableReinitialize, props.initialStatus, props.initialTouched]);
    var validateField = useEventCallback(function (name) {
      // This will efficiently validate a single field by avoiding state
      // changes if the validation function is synchronous. It's different from
      // what is called when using validateForm.
      if (fieldRegistry.current[name] && isFunction(fieldRegistry.current[name].validate)) {
        var value = getIn(state.values, name);
        var maybePromise = fieldRegistry.current[name].validate(value);

        if (isPromise(maybePromise)) {
          // Only flip isValidating if the function is async.
          dispatch({
            type: 'SET_ISVALIDATING',
            payload: true
          });
          return maybePromise.then(function (x) {
            return x;
          }).then(function (error) {
            dispatch({
              type: 'SET_FIELD_ERROR',
              payload: {
                field: name,
                value: error
              }
            });
            dispatch({
              type: 'SET_ISVALIDATING',
              payload: false
            });
          });
        } else {
          dispatch({
            type: 'SET_FIELD_ERROR',
            payload: {
              field: name,
              value: maybePromise
            }
          });
          return Promise.resolve(maybePromise);
        }
      } else if (props.validationSchema) {
        dispatch({
          type: 'SET_ISVALIDATING',
          payload: true
        });
        return runValidationSchema(state.values, name).then(function (x) {
          return x;
        }).then(function (error) {
          dispatch({
            type: 'SET_FIELD_ERROR',
            payload: {
              field: name,
              value: getIn(error, name)
            }
          });
          dispatch({
            type: 'SET_ISVALIDATING',
            payload: false
          });
        });
      }

      return Promise.resolve();
    });
    var registerField = react.useCallback(function (name, _ref3) {
      var validate = _ref3.validate;
      fieldRegistry.current[name] = {
        validate: validate
      };
    }, []);
    var unregisterField = react.useCallback(function (name) {
      delete fieldRegistry.current[name];
    }, []);
    var setTouched = useEventCallback(function (touched, shouldValidate) {
      dispatch({
        type: 'SET_TOUCHED',
        payload: touched
      });
      var willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate;
      return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve();
    });
    var setErrors = react.useCallback(function (errors) {
      dispatch({
        type: 'SET_ERRORS',
        payload: errors
      });
    }, []);
    var setValues = useEventCallback(function (values, shouldValidate) {
      var resolvedValues = isFunction(values) ? values(state.values) : values;
      dispatch({
        type: 'SET_VALUES',
        payload: resolvedValues
      });
      var willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate;
      return willValidate ? validateFormWithHighPriority(resolvedValues) : Promise.resolve();
    });
    var setFieldError = react.useCallback(function (field, value) {
      dispatch({
        type: 'SET_FIELD_ERROR',
        payload: {
          field: field,
          value: value
        }
      });
    }, []);
    var setFieldValue = useEventCallback(function (field, value, shouldValidate) {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: {
          field: field,
          value: value
        }
      });
      var willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate;
      return willValidate ? validateFormWithHighPriority(setIn(state.values, field, value)) : Promise.resolve();
    });
    var executeChange = react.useCallback(function (eventOrTextValue, maybePath) {
      // By default, assume that the first argument is a string. This allows us to use
      // handleChange with React Native and React Native Web's onChangeText prop which
      // provides just the value of the input.
      var field = maybePath;
      var val = eventOrTextValue;
      var parsed; // If the first argument is not a string though, it has to be a synthetic React Event (or a fake one),
      // so we handle like we would a normal HTML change event.

      if (!isString(eventOrTextValue)) {
        // If we can, persist the event
        // @see https://reactjs.org/docs/events.html#event-pooling
        if (eventOrTextValue.persist) {
          eventOrTextValue.persist();
        }

        var target = eventOrTextValue.target ? eventOrTextValue.target : eventOrTextValue.currentTarget;
        var type = target.type,
            name = target.name,
            id = target.id,
            value = target.value,
            checked = target.checked,
            outerHTML = target.outerHTML,
            options = target.options,
            multiple = target.multiple;
        field = maybePath ? maybePath : name ? name : id;

        if (!field && process.env.NODE_ENV !== "production") {
          warnAboutMissingIdentifier({
            htmlContent: outerHTML,
            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
            handlerName: 'handleChange'
          });
        }

        val = /number|range/.test(type) ? (parsed = parseFloat(value), isNaN(parsed) ? '' : parsed) : /checkbox/.test(type) // checkboxes
        ? getValueForCheckbox(getIn(state.values, field), checked, value) : options && multiple // <select multiple>
        ? getSelectedValues(options) : value;
      }

      if (field) {
        // Set form fields by name
        setFieldValue(field, val);
      }
    }, [setFieldValue, state.values]);
    var handleChange = useEventCallback(function (eventOrPath) {
      if (isString(eventOrPath)) {
        return function (event) {
          return executeChange(event, eventOrPath);
        };
      } else {
        executeChange(eventOrPath);
      }
    });
    var setFieldTouched = useEventCallback(function (field, touched, shouldValidate) {
      if (touched === void 0) {
        touched = true;
      }

      dispatch({
        type: 'SET_FIELD_TOUCHED',
        payload: {
          field: field,
          value: touched
        }
      });
      var willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate;
      return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve();
    });
    var executeBlur = react.useCallback(function (e, path) {
      if (e.persist) {
        e.persist();
      }

      var _e$target = e.target,
          name = _e$target.name,
          id = _e$target.id,
          outerHTML = _e$target.outerHTML;
      var field = path ? path : name ? name : id;

      if (!field && process.env.NODE_ENV !== "production") {
        warnAboutMissingIdentifier({
          htmlContent: outerHTML,
          documentationAnchorLink: 'handleblur-e-any--void',
          handlerName: 'handleBlur'
        });
      }

      setFieldTouched(field, true);
    }, [setFieldTouched]);
    var handleBlur = useEventCallback(function (eventOrString) {
      if (isString(eventOrString)) {
        return function (event) {
          return executeBlur(event, eventOrString);
        };
      } else {
        executeBlur(eventOrString);
      }
    });
    var setFormikState = react.useCallback(function (stateOrCb) {
      if (isFunction(stateOrCb)) {
        dispatch({
          type: 'SET_FORMIK_STATE',
          payload: stateOrCb
        });
      } else {
        dispatch({
          type: 'SET_FORMIK_STATE',
          payload: function payload() {
            return stateOrCb;
          }
        });
      }
    }, []);
    var setStatus = react.useCallback(function (status) {
      dispatch({
        type: 'SET_STATUS',
        payload: status
      });
    }, []);
    var setSubmitting = react.useCallback(function (isSubmitting) {
      dispatch({
        type: 'SET_ISSUBMITTING',
        payload: isSubmitting
      });
    }, []);
    var submitForm = useEventCallback(function () {
      dispatch({
        type: 'SUBMIT_ATTEMPT'
      });
      return validateFormWithHighPriority().then(function (combinedErrors) {
        // In case an error was thrown and passed to the resolved Promise,
        // `combinedErrors` can be an instance of an Error. We need to check
        // that and abort the submit.
        // If we don't do that, calling `Object.keys(new Error())` yields an
        // empty array, which causes the validation to pass and the form
        // to be submitted.
        var isInstanceOfError = combinedErrors instanceof Error;
        var isActuallyValid = !isInstanceOfError && Object.keys(combinedErrors).length === 0;

        if (isActuallyValid) {
          // Proceed with submit...
          //
          // To respect sync submit fns, we can't simply wrap executeSubmit in a promise and
          // _always_ dispatch SUBMIT_SUCCESS because isSubmitting would then always be false.
          // This would be fine in simple cases, but make it impossible to disable submit
          // buttons where people use callbacks or promises as side effects (which is basically
          // all of v1 Formik code). Instead, recall that we are inside of a promise chain already,
          //  so we can try/catch executeSubmit(), if it returns undefined, then just bail.
          // If there are errors, throw em. Otherwise, wrap executeSubmit in a promise and handle
          // cleanup of isSubmitting on behalf of the consumer.
          var promiseOrUndefined;

          try {
            promiseOrUndefined = executeSubmit(); // Bail if it's sync, consumer is responsible for cleaning up
            // via setSubmitting(false)

            if (promiseOrUndefined === undefined) {
              return;
            }
          } catch (error) {
            throw error;
          }

          return Promise.resolve(promiseOrUndefined).then(function (result) {
            if (!!isMounted.current) {
              dispatch({
                type: 'SUBMIT_SUCCESS'
              });
            }

            return result;
          })["catch"](function (_errors) {
            if (!!isMounted.current) {
              dispatch({
                type: 'SUBMIT_FAILURE'
              }); // This is a legit error rejected by the onSubmit fn
              // so we don't want to break the promise chain

              throw _errors;
            }
          });
        } else if (!!isMounted.current) {
          // ^^^ Make sure Formik is still mounted before updating state
          dispatch({
            type: 'SUBMIT_FAILURE'
          }); // throw combinedErrors;

          if (isInstanceOfError) {
            throw combinedErrors;
          }
        }

        return;
      });
    });
    var handleSubmit = useEventCallback(function (e) {
      if (e && e.preventDefault && isFunction(e.preventDefault)) {
        e.preventDefault();
      }

      if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
        e.stopPropagation();
      } // Warn if form submission is triggered by a <button> without a
      // specified `type` attribute during development. This mitigates
      // a common gotcha in forms with both reset and submit buttons,
      // where the dev forgets to add type="button" to the reset button.


      if (process.env.NODE_ENV !== "production" && typeof document !== 'undefined') {
        // Safely get the active element (works with IE)
        var activeElement = getActiveElement();

        if (activeElement !== null && activeElement instanceof HTMLButtonElement) {
          !(activeElement.attributes && activeElement.attributes.getNamedItem('type')) ? process.env.NODE_ENV !== "production" ? warning(false, 'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.') : warning() : void 0;
        }
      }

      submitForm()["catch"](function (reason) {
        console.warn("Warning: An unhandled error was caught from submitForm()", reason);
      });
    });
    var imperativeMethods = {
      resetForm: resetForm,
      validateForm: validateFormWithHighPriority,
      validateField: validateField,
      setErrors: setErrors,
      setFieldError: setFieldError,
      setFieldTouched: setFieldTouched,
      setFieldValue: setFieldValue,
      setStatus: setStatus,
      setSubmitting: setSubmitting,
      setTouched: setTouched,
      setValues: setValues,
      setFormikState: setFormikState,
      submitForm: submitForm
    };
    var executeSubmit = useEventCallback(function () {
      return onSubmit(state.values, imperativeMethods);
    });
    var handleReset = useEventCallback(function (e) {
      if (e && e.preventDefault && isFunction(e.preventDefault)) {
        e.preventDefault();
      }

      if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
        e.stopPropagation();
      }

      resetForm();
    });
    var getFieldMeta = react.useCallback(function (name) {
      return {
        value: getIn(state.values, name),
        error: getIn(state.errors, name),
        touched: !!getIn(state.touched, name),
        initialValue: getIn(initialValues.current, name),
        initialTouched: !!getIn(initialTouched.current, name),
        initialError: getIn(initialErrors.current, name)
      };
    }, [state.errors, state.touched, state.values]);
    var getFieldHelpers = react.useCallback(function (name) {
      return {
        setValue: function setValue(value, shouldValidate) {
          return setFieldValue(name, value, shouldValidate);
        },
        setTouched: function setTouched(value, shouldValidate) {
          return setFieldTouched(name, value, shouldValidate);
        },
        setError: function setError(value) {
          return setFieldError(name, value);
        }
      };
    }, [setFieldValue, setFieldTouched, setFieldError]);
    var getFieldProps = react.useCallback(function (nameOrOptions) {
      var isAnObject = isObject(nameOrOptions);
      var name = isAnObject ? nameOrOptions.name : nameOrOptions;
      var valueState = getIn(state.values, name);
      var field = {
        name: name,
        value: valueState,
        onChange: handleChange,
        onBlur: handleBlur
      };

      if (isAnObject) {
        var type = nameOrOptions.type,
            valueProp = nameOrOptions.value,
            is = nameOrOptions.as,
            multiple = nameOrOptions.multiple;

        if (type === 'checkbox') {
          if (valueProp === undefined) {
            field.checked = !!valueState;
          } else {
            field.checked = !!(Array.isArray(valueState) && ~valueState.indexOf(valueProp));
            field.value = valueProp;
          }
        } else if (type === 'radio') {
          field.checked = valueState === valueProp;
          field.value = valueProp;
        } else if (is === 'select' && multiple) {
          field.value = field.value || [];
          field.multiple = true;
        }
      }

      return field;
    }, [handleBlur, handleChange, state.values]);
    var dirty = react.useMemo(function () {
      return !isEqual(initialValues.current, state.values);
    }, [initialValues.current, state.values]);
    var isValid = react.useMemo(function () {
      return typeof isInitialValid !== 'undefined' ? dirty ? state.errors && Object.keys(state.errors).length === 0 : isInitialValid !== false && isFunction(isInitialValid) ? isInitialValid(props) : isInitialValid : state.errors && Object.keys(state.errors).length === 0;
    }, [isInitialValid, dirty, state.errors, props]);

    var ctx = _extends({}, state, {
      initialValues: initialValues.current,
      initialErrors: initialErrors.current,
      initialTouched: initialTouched.current,
      initialStatus: initialStatus.current,
      handleBlur: handleBlur,
      handleChange: handleChange,
      handleReset: handleReset,
      handleSubmit: handleSubmit,
      resetForm: resetForm,
      setErrors: setErrors,
      setFormikState: setFormikState,
      setFieldTouched: setFieldTouched,
      setFieldValue: setFieldValue,
      setFieldError: setFieldError,
      setStatus: setStatus,
      setSubmitting: setSubmitting,
      setTouched: setTouched,
      setValues: setValues,
      submitForm: submitForm,
      validateForm: validateFormWithHighPriority,
      validateField: validateField,
      isValid: isValid,
      dirty: dirty,
      unregisterField: unregisterField,
      registerField: registerField,
      getFieldProps: getFieldProps,
      getFieldMeta: getFieldMeta,
      getFieldHelpers: getFieldHelpers,
      validateOnBlur: validateOnBlur,
      validateOnChange: validateOnChange,
      validateOnMount: validateOnMount
    });

    return ctx;
  }
  function Formik(props) {
    var formikbag = useFormik(props);
    var component = props.component,
        children = props.children,
        render = props.render,
        innerRef = props.innerRef; // This allows folks to pass a ref to <Formik />

    react.useImperativeHandle(innerRef, function () {
      return formikbag;
    });

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      react.useEffect(function () {
        !!props.render ? process.env.NODE_ENV !== "production" ? warning(false, "<Formik render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Formik render={(props) => ...} /> with <Formik>{(props) => ...}</Formik>") : warning() : void 0; // eslint-disable-next-line
      }, []);
    }

    return react.createElement(FormikProvider, {
      value: formikbag
    }, component ? react.createElement(component, formikbag) : render ? render(formikbag) : children // children come last, always called
    ? isFunction(children) ? children(formikbag) : !isEmptyChildren(children) ? react.Children.only(children) : null : null);
  }

  function warnAboutMissingIdentifier(_ref4) {
    var htmlContent = _ref4.htmlContent,
        documentationAnchorLink = _ref4.documentationAnchorLink,
        handlerName = _ref4.handlerName;
    console.warn("Warning: Formik called `" + handlerName + "`, but you forgot to pass an `id` or `name` attribute to your input:\n    " + htmlContent + "\n    Formik cannot determine which value to update. For more info see https://formik.org/docs/api/formik#" + documentationAnchorLink + "\n  ");
  }
  /**
   * Transform Yup ValidationError to a more usable object
   */


  function yupToFormErrors(yupError) {
    var errors = {};

    if (yupError.inner) {
      if (yupError.inner.length === 0) {
        return setIn(errors, yupError.path, yupError.message);
      }

      for (var _iterator = yupError.inner, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref5 = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref5 = _i.value;
        }

        var err = _ref5;

        if (!getIn(errors, err.path)) {
          errors = setIn(errors, err.path, err.message);
        }
      }
    }

    return errors;
  }
  /**
   * Validate a yup schema.
   */

  function validateYupSchema(values, schema, sync, context) {
    if (sync === void 0) {
      sync = false;
    }

    var normalizedValues = prepareDataForValidation(values);
    return schema[sync ? 'validateSync' : 'validate'](normalizedValues, {
      abortEarly: false,
      context: normalizedValues
    });
  }
  /**
   * Recursively prepare values.
   */

  function prepareDataForValidation(values) {
    var data = Array.isArray(values) ? [] : {};

    for (var k in values) {
      if (Object.prototype.hasOwnProperty.call(values, k)) {
        var key = String(k);

        if (Array.isArray(values[key]) === true) {
          data[key] = values[key].map(function (value) {
            if (Array.isArray(value) === true || isPlainObject(value)) {
              return prepareDataForValidation(value);
            } else {
              return value !== '' ? value : undefined;
            }
          });
        } else if (isPlainObject(values[key])) {
          data[key] = prepareDataForValidation(values[key]);
        } else {
          data[key] = values[key] !== '' ? values[key] : undefined;
        }
      }
    }

    return data;
  }
  /**
   * deepmerge array merging algorithm
   * https://github.com/KyleAMathews/deepmerge#combine-array
   */

  function arrayMerge(target, source, options) {
    var destination = target.slice();
    source.forEach(function merge(e, i) {
      if (typeof destination[i] === 'undefined') {
        var cloneRequested = options.clone !== false;
        var shouldClone = cloneRequested && options.isMergeableObject(e);
        destination[i] = shouldClone ? deepmerge_1(Array.isArray(e) ? [] : {}, e, options) : e;
      } else if (options.isMergeableObject(e)) {
        destination[i] = deepmerge_1(target[i], e, options);
      } else if (target.indexOf(e) === -1) {
        destination.push(e);
      }
    });
    return destination;
  }
  /** Return multi select values based on an array of options */


  function getSelectedValues(options) {
    return Array.from(options).filter(function (el) {
      return el.selected;
    }).map(function (el) {
      return el.value;
    });
  }
  /** Return the next value for a checkbox */


  function getValueForCheckbox(currentValue, checked, valueProp) {
    // If the current value was a boolean, return a boolean
    if (typeof currentValue === 'boolean') {
      return Boolean(checked);
    } // If the currentValue was not a boolean we want to return an array


    var currentArrayOfValues = [];
    var isValueInArray = false;
    var index = -1;

    if (!Array.isArray(currentValue)) {
      // eslint-disable-next-line eqeqeq
      if (!valueProp || valueProp == 'true' || valueProp == 'false') {
        return Boolean(checked);
      }
    } else {
      // If the current value is already an array, use it
      currentArrayOfValues = currentValue;
      index = currentValue.indexOf(valueProp);
      isValueInArray = index >= 0;
    } // If the checkbox was checked and the value is not already present in the aray we want to add the new value to the array of values


    if (checked && valueProp && !isValueInArray) {
      return currentArrayOfValues.concat(valueProp);
    } // If the checkbox was unchecked and the value is not in the array, simply return the already existing array of values


    if (!isValueInArray) {
      return currentArrayOfValues;
    } // If the checkbox was unchecked and the value is in the array, remove the value and return the array


    return currentArrayOfValues.slice(0, index).concat(currentArrayOfValues.slice(index + 1));
  } // React currently throws a warning when using useLayoutEffect on the server.
  // To get around it, we can conditionally useEffect on the server (no-op) and
  // useLayoutEffect in the browser.
  // @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85


  var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? react.useLayoutEffect : react.useEffect;

  function useEventCallback(fn) {
    var ref = react.useRef(fn); // we copy a ref to the callback scoped to the current state/props on each render

    useIsomorphicLayoutEffect(function () {
      ref.current = fn;
    });
    return react.useCallback(function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return ref.current.apply(void 0, args);
    }, []);
  }

  function useField(propsOrFieldName) {
    var formik = useFormikContext();
    var getFieldProps = formik.getFieldProps,
        getFieldMeta = formik.getFieldMeta,
        getFieldHelpers = formik.getFieldHelpers,
        registerField = formik.registerField,
        unregisterField = formik.unregisterField;
    var isAnObject = isObject(propsOrFieldName); // Normalize propsOrFieldName to FieldHookConfig<Val>

    var props = isAnObject ? propsOrFieldName : {
      name: propsOrFieldName
    };
    var fieldName = props.name,
        validateFn = props.validate;
    react.useEffect(function () {
      if (fieldName) {
        registerField(fieldName, {
          validate: validateFn
        });
      }

      return function () {
        if (fieldName) {
          unregisterField(fieldName);
        }
      };
    }, [registerField, unregisterField, fieldName, validateFn]);

    if (process.env.NODE_ENV !== "production") {
      !formik ? process.env.NODE_ENV !== "production" ? warning(false, 'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component') : warning() : void 0;
    }

    !fieldName ? process.env.NODE_ENV !== "production" ? warning(false, 'Invalid field name. Either pass `useField` a string or an object containing a `name` key.') : warning() : void 0;
    var fieldHelpers = react.useMemo(function () {
      return getFieldHelpers(fieldName);
    }, [getFieldHelpers, fieldName]);
    return [getFieldProps(props), getFieldMeta(fieldName), fieldHelpers];
  }
  function Field(_ref) {
    var validate = _ref.validate,
        name = _ref.name,
        render = _ref.render,
        children = _ref.children,
        is = _ref.as,
        component = _ref.component,
        className = _ref.className,
        props = _objectWithoutPropertiesLoose(_ref, ["validate", "name", "render", "children", "as", "component", "className"]);

    var _useFormikContext = useFormikContext(),
        formik = _objectWithoutPropertiesLoose(_useFormikContext, ["validate", "validationSchema"]);

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      react.useEffect(function () {
        !!render ? process.env.NODE_ENV !== "production" ? warning(false, "<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name=\"" + name + "\" render={({field, form}) => ...} /> with <Field name=\"" + name + "\">{({field, form, meta}) => ...}</Field>") : warning() : void 0;
        !!(is && children && isFunction(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.') : warning() : void 0;
        !!(component && children && isFunction(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.') : warning() : void 0;
        !!(render && children && !isEmptyChildren(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored') : warning() : void 0; // eslint-disable-next-line
      }, []);
    } // Register field and field-level validation with parent <Formik>


    var registerField = formik.registerField,
        unregisterField = formik.unregisterField;
    react.useEffect(function () {
      registerField(name, {
        validate: validate
      });
      return function () {
        unregisterField(name);
      };
    }, [registerField, unregisterField, name, validate]);
    var field = formik.getFieldProps(_extends({
      name: name
    }, props));
    var meta = formik.getFieldMeta(name);
    var legacyBag = {
      field: field,
      form: formik
    };

    if (render) {
      return render(_extends({}, legacyBag, {
        meta: meta
      }));
    }

    if (isFunction(children)) {
      return children(_extends({}, legacyBag, {
        meta: meta
      }));
    }

    if (component) {
      // This behavior is backwards compat with earlier Formik 0.9 to 1.x
      if (typeof component === 'string') {
        var innerRef = props.innerRef,
            rest = _objectWithoutPropertiesLoose(props, ["innerRef"]);

        return react.createElement(component, _extends({
          ref: innerRef
        }, field, rest, {
          className: className
        }), children);
      } // We don't pass `meta` for backwards compat


      return react.createElement(component, _extends({
        field: field,
        form: formik
      }, props, {
        className: className
      }), children);
    } // default to input here so we can check for both `as` and `children` above


    var asElement = is || 'input';

    if (typeof asElement === 'string') {
      var _innerRef = props.innerRef,
          _rest = _objectWithoutPropertiesLoose(props, ["innerRef"]);

      return react.createElement(asElement, _extends({
        ref: _innerRef
      }, field, _rest, {
        className: className
      }), children);
    }

    return react.createElement(asElement, _extends({}, field, props, {
      className: className
    }), children);
  }

  var Form = /*#__PURE__*/react.forwardRef(function (props, ref) {
    // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
    // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
    var action = props.action,
        rest = _objectWithoutPropertiesLoose(props, ["action"]);

    var _action = action != null ? action : '#';

    var _useFormikContext = useFormikContext(),
        handleReset = _useFormikContext.handleReset,
        handleSubmit = _useFormikContext.handleSubmit;

    return react.createElement("form", _extends({
      onSubmit: handleSubmit,
      ref: ref,
      onReset: handleReset,
      action: _action
    }, rest));
  });
  Form.displayName = 'Form';

  const DeleteIcon = () => {
    return jsxRuntime.jsx("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: jsxRuntime.jsx("path", {
        d: "M18.1509 9.14544L17.8509 18.2257C17.8253 19.0034 17.4977 19.7405 16.9376 20.2806C16.3775 20.8206 15.629 21.1212 14.8509 21.1184H9.15088C8.37329 21.1212 7.62519 20.8211 7.06516 20.2816C6.50513 19.7422 6.17719 19.0058 6.15087 18.2287L5.85088 9.14544C5.84431 8.94653 5.91703 8.75316 6.05304 8.60787C6.18906 8.46257 6.37721 8.37726 6.57613 8.3707C6.77504 8.36413 6.96841 8.43685 7.1137 8.57286C7.259 8.70887 7.34431 8.89703 7.35088 9.09594L7.65087 18.1784C7.66581 18.5662 7.83042 18.933 8.11012 19.202C8.38982 19.4709 8.76286 19.621 9.15088 19.6207H14.8509C15.2394 19.621 15.6129 19.4705 15.8926 19.2009C16.1724 18.9313 16.3367 18.5637 16.3509 18.1754L16.6509 9.09594C16.6574 8.89703 16.7428 8.70887 16.888 8.57286C17.0333 8.43685 17.2267 8.36413 17.4256 8.3707C17.6245 8.37726 17.8127 8.46257 17.9487 8.60787C18.0847 8.75316 18.1574 8.94653 18.1509 9.14544ZM19.1431 6.12369C19.1431 6.32261 19.0641 6.51337 18.9235 6.65403C18.7828 6.79468 18.592 6.87369 18.3931 6.87369H5.60938C5.41046 6.87369 5.2197 6.79468 5.07904 6.65403C4.93839 6.51337 4.85938 6.32261 4.85938 6.12369C4.85938 5.92478 4.93839 5.73402 5.07904 5.59337C5.2197 5.45271 5.41046 5.3737 5.60938 5.3737H7.93438C8.17201 5.37434 8.40138 5.28654 8.57786 5.12739C8.75434 4.96825 8.86529 4.74913 8.88912 4.5127C8.94447 3.95806 9.20432 3.44389 9.61805 3.07038C10.0318 2.69686 10.5697 2.49075 11.1271 2.4922H12.8746C13.432 2.49075 13.97 2.69686 14.3837 3.07038C14.7974 3.44389 15.0573 3.95806 15.1126 4.5127C15.1365 4.74913 15.2474 4.96825 15.4239 5.12739C15.6004 5.28654 15.8297 5.37434 16.0674 5.3737H18.3924C18.5913 5.3737 18.7821 5.45271 18.9227 5.59337C19.0634 5.73402 19.1424 5.92478 19.1424 6.12369H19.1431ZM10.1911 5.3737H13.8121C13.7136 5.1485 13.6491 4.90988 13.6209 4.66569C13.6023 4.48083 13.5158 4.30944 13.378 4.18473C13.2403 4.06002 13.0612 3.99088 12.8754 3.9907H11.1279C10.9421 3.99088 10.763 4.06002 10.6252 4.18473C10.4875 4.30944 10.401 4.48083 10.3824 4.66569C10.3539 4.90992 10.2892 5.14854 10.1904 5.3737H10.1911ZM10.9464 16.7369V10.3507C10.9464 10.1518 10.8674 9.96102 10.7267 9.82036C10.5861 9.67971 10.3953 9.6007 10.1964 9.6007C9.99746 9.6007 9.8067 9.67971 9.66605 9.82036C9.52539 9.96102 9.44638 10.1518 9.44638 10.3507V16.7399C9.44638 16.9389 9.52539 17.1296 9.66605 17.2703C9.8067 17.4109 9.99746 17.4899 10.1964 17.4899C10.3953 17.4899 10.5861 17.4109 10.7267 17.2703C10.8674 17.1296 10.9464 16.9389 10.9464 16.7399V16.7369ZM14.5569 16.7369V10.3507C14.5569 10.1518 14.4779 9.96102 14.3372 9.82036C14.1966 9.67971 14.0058 9.6007 13.8069 9.6007C13.608 9.6007 13.4172 9.67971 13.2765 9.82036C13.1359 9.96102 13.0569 10.1518 13.0569 10.3507V16.7399C13.0569 16.9389 13.1359 17.1296 13.2765 17.2703C13.4172 17.4109 13.608 17.4899 13.8069 17.4899C14.0058 17.4899 14.1966 17.4109 14.3372 17.2703C14.4779 17.1296 14.5569 16.9389 14.5569 16.7399V16.7369Z",
        fill: "#666481"
      })
    });
  };

  const OrderSummary = ({
    ticketsArray,
    total,
    currentCurrency,
    rates,
    couponAppliedAmount,
    defaultCurrency
  }) => {
    var _a, _b, _c;
    return jsxRuntime.jsxs("div", {
      className: "order-summary",
      children: [jsxRuntime.jsx("h2", {
        className: "order-summary-title",
        children: "Order Summary"
      }), ticketsArray && (ticketsArray === null || ticketsArray === void 0 ? void 0 : ticketsArray.map((ticket, index) => {
        var _a;
        const hasDiscount = ticket.cost !== ticket.discountedCost;
        const ticketCost = hasDiscount ? ticket.discountedCost : ticket.cost;
        return jsxRuntime.jsxs("div", {
          className: "summary-row",
          children: [jsxRuntime.jsxs("span", {
            children: [ticket.quantity, " ", ticket.ticketName]
          }), jsxRuntime.jsx("span", {
            children: ticket.cost === 0 ? "free" : jsxRuntime.jsxs(jsxRuntime.Fragment, {
              children: [currentCurrency === "USD" ? "$" : "₦", formatCurrency(ticketCost * ticket.quantity * ((_a = rates[`${currentCurrency}${defaultCurrency}`]) !== null && _a !== void 0 ? _a : 1) || 0)]
            })
          })]
        }, `ticketsArray-summary-${index}`);
      })), jsxRuntime.jsx("hr", {
        className: "divider"
      }), jsxRuntime.jsxs("div", {
        className: "summary-row",
        children: [jsxRuntime.jsx("span", {
          children: "Subtotal"
        }), jsxRuntime.jsx("span", {
          children: `${currentCurrency === "USD" ? "$" : "₦"}${formatCurrency(total + couponAppliedAmount * ((_a = rates[`${currentCurrency}${defaultCurrency}`]) !== null && _a !== void 0 ? _a : 1) || 0)}
`
        })]
      }), jsxRuntime.jsx("hr", {
        className: "divider"
      }), couponAppliedAmount > 0 && jsxRuntime.jsxs(jsxRuntime.Fragment, {
        children: [jsxRuntime.jsxs("div", {
          className: "summary-row",
          children: [jsxRuntime.jsx("span", {
            children: "Discount"
          }), jsxRuntime.jsxs("span", {
            className: "discount",
            children: ["-", `${currentCurrency === "USD" ? "$" : "₦"}${(_c = formatCurrency(+couponAppliedAmount * ((_b = rates[`${currentCurrency}${defaultCurrency}`]) !== null && _b !== void 0 ? _b : 1))) !== null && _c !== void 0 ? _c : 0}`]
          })]
        }), jsxRuntime.jsx("hr", {
          className: "divider"
        })]
      }), jsxRuntime.jsxs("div", {
        className: "summary-row total",
        children: [jsxRuntime.jsx("span", {
          children: "Total"
        }), jsxRuntime.jsxs("span", {
          children: [currentCurrency === "USD" ? "$" : "₦", formatCurrency(total)]
        })]
      })]
    });
  };

  const BackArrow = () => {
    return jsxRuntime.jsxs("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [jsxRuntime.jsx("path", {
        d: "M9.57031 5.92969L3.50031 11.9997L9.57031 18.0697",
        stroke: "#2D2B4A"
      }), jsxRuntime.jsx("path", {
        d: "M20.5 12L3.67 12",
        stroke: "#2D2B4A"
      })]
    });
  };

  const SvgDollarIcon = props => jsxRuntime.jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    xmlnsXlink: "http://www.w3.org/1999/xlink",
    width: 24,
    height: 24,
    fill: "none",
    ...props,
    children: [jsxRuntime.jsx("circle", {
      cx: 12,
      cy: 12,
      r: 12,
      fill: "url(#dollar-icon_svg__a)"
    }), jsxRuntime.jsxs("defs", {
      children: [jsxRuntime.jsx("pattern", {
        id: "dollar-icon_svg__a",
        width: 1,
        height: 1,
        patternContentUnits: "objectBoundingBox",
        children: jsxRuntime.jsx("use", {
          xlinkHref: "#dollar-icon_svg__b",
          transform: "scale(.00195)"
        })
      }), jsxRuntime.jsx("image", {
        xlinkHref: "data:image/png;base64,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IhAoAQlAoIZXtUVABERAAqB7QAREQAQCJSABCNTwqrYIiIAISAB0D4iACIhAoAQkAIEaXtUWAREQAQmA7gEREAERCJSABCBQw6vaIiACIiAB0D0gAiIgAoESkAAEanhVWwREQAQkALoHREAERCBQAhKAQA2vaouACIiABED3gAiIgAgESkACEKjhVW0REAERkADoHhABERCBQAlIAAI1vKotAiIgAhIA3QMiIAIiECgBCUCghle1RUAEREACoHtABERABAIlIAEI1PCqtgiIgAhIAHQPiIAIiECgBCQAgRpe1RYBERABCYDuAREQAREIlIAEIFDDq9oiIAIiIAHQPSACIiACgRKQAARqeFVbBERABCQAugdEQAREIFACEoBADa9qi4AIiIAEQPeACIiACARKQAIQqOFVbREQARGQAOgeEAEREIFACUgAAjW8qi0CIiACEgDdAyIgAiIQKAEJQKCGV7VFQAREQAKge0AEREAEAiUgAQjU8Kq2CIiACEgAdA+IgAiIQKAEJACBGl7VFgEREAEJgO4BERABEQiUgAQgUMOr2iIgAiIgAdA9IAIiIAKBEpAABGp4VVsEREAEJAC6B0RABEQgUAISgEANr2qLgAiIgARA94AIiIAIBEpAAhCo4VVtERABEZAA6B4QAREQgUAJSAACNbyqLQIiIAISAN0DIiACIhAoAQlAoIZXtUVABERAAqB7QAREQAQCJSABCNTwqrYIiIAISAB0D4iACIhAoAQkAIEaXtUWAREQAQmA7gEREAERCJSABCBQw6vaIiACIiAB0D0gAiIgAoESkAAEanhVWwREQAQkALoHREAERCBQAhKAQA2vaouACIiABED3gAiIgAgESkACEKjhVW0REAERkADoHhABERCBQAlIAAI1vKotAiIgAhIA3QMiIAIiECgBCUCghle1RUAEREACoHtABERABAIlIAEI1PCqtgiIgAhIAHQPiIAIiECgBCQAgRpe1RYBERABCYDuAREQAREIlIAEIFDDq9oiIAIiIAHQPSACIiACgRKQAARqeFVbBERABCQAugdEQAREIFACEoBADa9qi4AIiIAEQPeACIiACARKQAIQqOFVbREQARGQAOgeEAEREIFACUgAAjW8qi0CIiACEgDdAyIgAiIQKAEJQKCGV7VFQAREQAKge0AEREAEAiUgAQjU8Kq2CIiA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",
        id: "dollar-icon_svg__b",
        width: 512,
        height: 512,
        preserveAspectRatio: "none"
      })]
    })]
  });

  const Payment = ({
    goBack
  }) => {
    return jsxRuntime.jsxs("div", {
      children: [jsxRuntime.jsxs("div", {
        className: "modal-top",
        children: [jsxRuntime.jsx("div", {
          className: "back-arrow",
          onClick: goBack,
          children: jsxRuntime.jsx(BackArrow, {})
        }), jsxRuntime.jsx("h3", {
          children: "Payment"
        }), jsxRuntime.jsx("div", {
          onClick: goBack,
          className: "close-icon",
          children: jsxRuntime.jsx(CloseIcon, {})
        })]
      }), jsxRuntime.jsxs("div", {
        className: "input-box",
        children: [jsxRuntime.jsxs("div", {
          className: "input-left",
          children: [jsxRuntime.jsx("input", {
            type: "radio",
            defaultChecked: true,
            name: "payment"
          }), jsxRuntime.jsx("span", {
            children: "Bank transfer, Debit Card"
          })]
        }), jsxRuntime.jsx("div", {
          className: "input-right",
          children: jsxRuntime.jsx(SvgDollarIcon, {})
        })]
      })]
    });
  };

  const ClearErrorOnAnyChange = ({
    clearError
  }) => {
    const {
      values
    } = useFormikContext();
    react.useEffect(() => {
      clearError();
    }, [values]);
    return null;
  };

  const countryCodes = [{
    code: '1',
    country: 'United States 🇺🇸'
  }, {
    code: '44',
    country: 'United Kingdom 🇬🇧'
  }, {
    code: '234',
    country: 'Nigeria 🇳🇬'
  }, {
    code: '91',
    country: 'India 🇮🇳'
  }, {
    code: '81',
    country: 'Japan 🇯🇵'
  }, {
    code: '49',
    country: 'Germany 🇩🇪'
  }, {
    code: '33',
    country: 'France 🇫🇷'
  }, {
    code: '86',
    country: 'China 🇨🇳'
  }, {
    code: '55',
    country: 'Brazil 🇧🇷'
  }, {
    code: '27',
    country: 'South Africa 🇿🇦'
  }, {
    code: '92',
    country: 'Pakistan 🇵🇰'
  }, {
    code: '972',
    country: 'Israel 🇮🇱'
  }, {
    code: '39',
    country: 'Italy 🇮🇹'
  }, {
    code: '7',
    country: 'Russia 🇷🇺'
  }, {
    code: '61',
    country: 'Australia 🇦🇺'
  }, {
    code: '82',
    country: 'South Korea 🇰🇷'
  }, {
    code: '34',
    country: 'Spain 🇪🇸'
  }, {
    code: '62',
    country: 'Indonesia 🇮🇩'
  }, {
    code: '351',
    country: 'Portugal 🇵🇹'
  }, {
    code: '90',
    country: 'Turkey 🇹🇷'
  }, {
    code: '966',
    country: 'Saudi Arabia 🇸🇦'
  }, {
    code: '20',
    country: 'Egypt 🇪🇬'
  }, {
    code: '886',
    country: 'Taiwan 🇹🇼'
  }, {
    code: '31',
    country: 'Netherlands 🇳🇱'
  }, {
    code: '47',
    country: 'Norway 🇳🇴'
  }, {
    code: '46',
    country: 'Sweden 🇸🇪'
  }, {
    code: '32',
    country: 'Belgium 🇧🇪'
  }, {
    code: '45',
    country: 'Denmark 🇩🇰'
  }, {
    code: '48',
    country: 'Poland 🇵🇱'
  }, {
    code: '52',
    country: 'Mexico 🇲🇽'
  }, {
    code: '420',
    country: 'Czech Republic 🇨🇿'
  }, {
    code: '358',
    country: 'Finland 🇫🇮'
  }, {
    code: '84',
    country: 'Vietnam 🇻🇳'
  }, {
    code: '64',
    country: 'New Zealand 🇳🇿'
  }, {
    code: '380',
    country: 'Ukraine 🇺🇦'
  }, {
    code: '63',
    country: 'Philippines 🇵🇭'
  }, {
    code: '56',
    country: 'Chile 🇨🇱'
  }, {
    code: '60',
    country: 'Malaysia 🇲🇾'
  }, {
    code: '357',
    country: 'Cyprus 🇨🇾'
  }, {
    code: '41',
    country: 'Switzerland 🇨🇭'
  }, {
    code: '36',
    country: 'Hungary 🇭🇺'
  }, {
    code: '965',
    country: 'Kuwait 🇰🇼'
  }, {
    code: '973',
    country: 'Bahrain 🇧🇭'
  }, {
    code: '974',
    country: 'Qatar 🇶🇦'
  }, {
    code: '372',
    country: 'Estonia 🇪🇪'
  }, {
    code: '40',
    country: 'Romania 🇷🇴'
  }, {
    code: '375',
    country: 'Belarus 🇧🇾'
  }, {
    code: '359',
    country: 'Bulgaria 🇧🇬'
  }, {
    code: '98',
    country: 'Iran 🇮🇷'
  }, {
    code: '964',
    country: 'Iraq 🇮🇶'
  }, {
    code: '992',
    country: 'Tajikistan 🇹🇯'
  }, {
    code: '993',
    country: 'Turkmenistan 🇹🇲'
  }, {
    code: '994',
    country: 'Azerbaijan 🇦🇿'
  }, {
    code: '995',
    country: 'Georgia 🇬🇪'
  }, {
    code: '996',
    country: 'Kyrgyzstan 🇰🇬'
  }, {
    code: '998',
    country: 'Uzbekistan 🇺🇿'
  }, {
    code: '501',
    country: 'Belize 🇧🇿'
  }, {
    code: '502',
    country: 'Guatemala 🇬🇹'
  }, {
    code: '503',
    country: 'El Salvador 🇸🇻'
  }, {
    code: '504',
    country: 'Honduras 🇭🇳'
  }, {
    code: '505',
    country: 'Nicaragua 🇳🇮'
  }, {
    code: '506',
    country: 'Costa Rica 🇨🇷'
  }, {
    code: '507',
    country: 'Panama 🇵🇦'
  }, {
    code: '509',
    country: 'Haiti 🇭🇹'
  }, {
    code: '592',
    country: 'Guyana 🇬🇾'
  }, {
    code: '595',
    country: 'Paraguay 🇵🇾'
  }, {
    code: '597',
    country: 'Suriname 🇸🇷'
  }, {
    code: '598',
    country: 'Uruguay 🇺🇾'
  }, {
    code: '680',
    country: 'Palau 🇵🇼'
  }, {
    code: '679',
    country: 'Fiji 🇫🇯'
  }, {
    code: '678',
    country: 'Vanuatu 🇻🇺'
  }, {
    code: '677',
    country: 'Solomon Islands 🇸🇧'
  }, {
    code: '676',
    country: 'Tonga 🇹🇴'
  }, {
    code: '675',
    country: 'Papua New Guinea 🇵🇬'
  }, {
    code: '674',
    country: 'Nauru 🇳🇷'
  }, {
    code: '673',
    country: 'Brunei 🇧🇳'
  }, {
    code: '672',
    country: 'Antarctica 🇦🇶'
  }, {
    code: '971',
    country: 'United Arab Emirates 🇦🇪'
  }, {
    code: '966',
    country: 'Saudi Arabia 🇸🇦'
  }, {
    code: '965',
    country: 'Kuwait 🇰🇼'
  }, {
    code: '968',
    country: 'Oman 🇴🇲'
  }, {
    code: '967',
    country: 'Yemen 🇾🇪'
  }];

  function WhatsAppInput({
    index,
    fieldName
  }) {
    //   const fieldName = `whatsAppNumber_${index}`;
    const [field] = useField(fieldName);
    const {
      setFieldValue,
      values
    } = useFormikContext();
    const [selectedCode, setSelectedCode] = react.useState("234");
    const [dropdownOpen, setDropdownOpen] = react.useState(false);
    const getNumberWithoutCode = fullNumber => {
      if (!fullNumber) return "";
      if (fullNumber.startsWith(selectedCode)) {
        return fullNumber.substring(selectedCode.length);
      }
      return fullNumber;
    };
    const handleNumberChange = e => {
      const rawValue = e.target.value.replace(/\D/g, "");
      if (rawValue) {
        setFieldValue(fieldName, `${selectedCode}${rawValue}`);
      } else {
        setFieldValue(fieldName, "");
      }
    };
    const handleCountryChange = code => {
      var _a;
      setSelectedCode(code);
      setDropdownOpen(false);
      const currentNumber = ((_a = field.value) === null || _a === void 0 ? void 0 : _a.replace(/^\d+/, "")) || "";
      setFieldValue(fieldName, `${code}${currentNumber}`);
    };
    const dropdownRef = react.useRef(null);
    react.useEffect(() => {
      const handleClickOutside = event => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setDropdownOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);
    return jsxRuntime.jsxs("div", {
      className: "form-cont",
      ref: dropdownRef,
      children: [jsxRuntime.jsx("label", {
        htmlFor: fieldName,
        children: index ? "WhatsApp No" : "Receiver's WhatsApp No"
      }), jsxRuntime.jsxs("div", {
        className: "whatsapp-container",
        style: {
          display: "flex",
          alignItems: "center",
          position: "relative"
        },
        children: [jsxRuntime.jsx("div", {
          className: "code-input",
          style: {
            display: "flex",
            alignItems: "center"
          },
          children: jsxRuntime.jsxs("button", {
            type: "button",
            onClick: () => setDropdownOpen(!dropdownOpen),
            style: {
              background: "transparent",
              border: "none",
              color: "#718096",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            },
            children: ["+", selectedCode]
          })
        }), dropdownOpen && jsxRuntime.jsx("ul", {
          style: {
            position: "absolute",
            top: "100%",
            left: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            zIndex: 9999,
            maxHeight: "300px",
            overflowY: "auto",
            borderRadius: "8px",
            marginTop: "4px"
          },
          children: countryCodes.map((country, idx) => jsxRuntime.jsxs("li", {
            onClick: () => handleCountryChange(country.code),
            style: {
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              fontSize: "14px",
              borderBottom: "1px solid #eee",
              color: "#666481"
            },
            children: [jsxRuntime.jsx("span", {
              children: country.country
            }), jsxRuntime.jsxs("span", {
              children: ["+", country.code]
            })]
          }, idx))
        }), jsxRuntime.jsx("input", {
          type: "tel",
          id: fieldName,
          name: fieldName,
          placeholder: "Enter WhatsApp number",
          value: getNumberWithoutCode(field.value),
          onChange: handleNumberChange,
          style: {
            borderColor: "transparent",
            outline: "none",
            borderLeft: "none",
            width: "100%",
            fontSize: "0.875rem"
          }
        })]
      })]
    });
  }

  const CancelIcon = () => {
    return jsxRuntime.jsx("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: jsxRuntime.jsx("path", {
        d: "M11 1L1 11M1 1L11 11",
        stroke: "#666481"
      })
    });
  };

  const ToggleSwitchOn = props => {
    return jsxRuntime.jsx("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 12 9",
      ...props,
      children: jsxRuntime.jsx("path", {
        stroke: "#EA445A",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeWidth: "2",
        d: "M10.666 1 4.25 7.417 1.333 4.5"
      })
    });
  };

  const Tooltip = ({
    children,
    text,
    show,
    position = "top"
  }) => {
    return jsxRuntime.jsxs("div", {
      className: `tooltip-container ${position}`,
      children: [children, show && jsxRuntime.jsx("span", {
        className: "tooltip-text",
        children: text
      })]
    });
  };

  const TicketForm = ({
    eventDetailsWithId,
    selectedTickets,
    currentCurrency,
    rates,
    goBack,
    tickets,
    isMultiple,
    setIsMultiple,
    handleSubmit,
    totalPrice,
    isSubmitting,
    handleCloseModal,
    openPaymentsModal,
    handleClosePayment,
    handleDeleteTicket,
    handlePaymentHandler,
    setErrorMessage,
    errorMessage,
    handleCoupon,
    discountCode,
    showApplyCoupon,
    setDiscountCode,
    coupon,
    couponAppliedAmount,
    couponError,
    setCouponError,
    buttonColor
  }) => {
    const [data, setData] = react.useState([]);
    const eventAddress = eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.eventAddress;
    const validateData = data => {
      for (let entry of data) {
        if (!entry.fullName || !entry.email) {
          return "Please fill all user details.";
        }
        for (let q of entry.questions) {
          if (q.isRequired === "True" && (!q.answer || q.answer.trim() === "")) {
            return "Please answer all required questions.";
          }
        }
      }
      return "";
    };
    const uniqueQuestions = Array.from(new Map(tickets.flatMap(ticket => ticket.requiredQuestion || []).map(q => [q.id, q])).values());
    const [appliedToggles, setAppliedToggles] = react.useState({});
    const [answerError, setAnswerError] = react.useState("");
    const handleToggle = (questionId, value, setFieldValue) => {
      setAppliedToggles(prev => ({
        ...prev,
        [questionId]: !prev[questionId]
      }));
      if (!value) return;
      tickets.forEach((ticket, idx) => {
        var _a;
        const hasSameQuestion = (_a = ticket.requiredQuestion) === null || _a === void 0 ? void 0 : _a.some(q => q.id === questionId);
        if (hasSameQuestion) {
          setFieldValue(`question_${idx}_${questionId}`, !appliedToggles[questionId] ? value : "");
        }
      });
    };
    const groupedTicketInfo = react.useMemo(() => {
      const map = {};
      tickets.forEach((ticket, idx) => {
        const name = ticket.ticketName;
        if (!map[name]) {
          map[name] = {
            count: 0,
            firstIndex: idx
          };
        }
        map[name].count += 1;
      });
      return map;
    }, [tickets]);
    const initialValues = isMultiple === "yes" ? tickets.reduce((acc, _, index) => {
      acc["is_multiple"] = isMultiple;
      acc[`fullName_${index}`] = "";
      acc[`email_${index}`] = "";
      acc[`whatsAppNumber_${index}`] = "";
      return acc;
    }, {}) : {
      is_multiple: isMultiple,
      fullName: "",
      email: "",
      whatsAppNumber: ""
    };
    return jsxRuntime.jsx(Formik, {
      initialValues: initialValues,
      enableReinitialize: true,
      onSubmit: values => {
        let data = [];
        if (isMultiple === "no") {
          const answers = uniqueQuestions.map(q => ({
            id: q.id,
            answer: values[`quickQuestion_${q.id}`] || "",
            isRequired: q.isRequired
          })) || [];
          data = tickets.map(ticket => ({
            id: (ticket === null || ticket === void 0 ? void 0 : ticket.id) ? ticket === null || ticket === void 0 ? void 0 : ticket.id : v4().replace("-", ""),
            fullName: values.fullName,
            email: values.email,
            whatsAppNumber: values.whatsAppNumber,
            cost: ticket === null || ticket === void 0 ? void 0 : ticket.cost,
            quantity: ticket === null || ticket === void 0 ? void 0 : ticket.quantity,
            ticketName: ticket === null || ticket === void 0 ? void 0 : ticket.ticketName,
            ticketTypeId: ticket.ticketTypeId,
            questions: answers.filter(a => {
              var _a;
              return (_a = ticket.requiredQuestion) === null || _a === void 0 ? void 0 : _a.some(rq => rq.id === a.id);
            })
          }));
        } else {
          data = tickets.map((ticket, index) => {
            var _a;
            const questions = ((_a = ticket.requiredQuestion) === null || _a === void 0 ? void 0 : _a.map(q => ({
              id: q.id,
              answer: values[`question_${index}_${q.id}`] || "",
              isRequired: q.isRequired
            }))) || [];
            return {
              id: (ticket === null || ticket === void 0 ? void 0 : ticket.id) ? ticket === null || ticket === void 0 ? void 0 : ticket.id : v4().replace("-", ""),
              fullName: values[`fullName_${index}`],
              cost: ticket === null || ticket === void 0 ? void 0 : ticket.cost,
              quantity: ticket === null || ticket === void 0 ? void 0 : ticket.quantity,
              ticketName: ticket === null || ticket === void 0 ? void 0 : ticket.ticketName,
              ticketTypeId: ticket.ticketTypeId,
              email: values[`email_${index}`],
              whatsAppNumber: values[`whatsAppNumber_${index}`],
              questions
            };
          });
        }
        const isError = validateData(data);
        if (!isError) {
          setData(data);
          handleSubmit(data);
        } else {
          setErrorMessage(isError);
        }
      },
      children: ({
        values,
        setFieldValue
      }) => jsxRuntime.jsxs(Form, {
        children: [jsxRuntime.jsx("div", {
          className: "",
          children: openPaymentsModal ? jsxRuntime.jsx("div", {
            className: "",
            children: jsxRuntime.jsx(Payment, {
              goBack: handleClosePayment
            })
          }) : jsxRuntime.jsxs("div", {
            className: "",
            children: [jsxRuntime.jsxs("div", {
              className: "modal-top",
              children: [jsxRuntime.jsx("div", {
                className: "back-arrow",
                onClick: goBack,
                children: jsxRuntime.jsx(BackArrow, {})
              }), jsxRuntime.jsx("h3", {
                children: "Checkout"
              }), jsxRuntime.jsx("div", {
                onClick: handleCloseModal,
                className: "close-icon",
                children: jsxRuntime.jsx(CloseIcon, {})
              })]
            }), jsxRuntime.jsxs("div", {
              className: "form-group form-gr-t",
              children: [jsxRuntime.jsx("label", {
                children: "Send tickets separately?"
              }), jsxRuntime.jsx("span", {
                children: "Tickets will be emailed separately to each attendee based on the quantity purchased."
              }), jsxRuntime.jsxs("div", {
                className: "radio-options",
                children: [jsxRuntime.jsxs("label", {
                  children: [jsxRuntime.jsx(Field, {
                    type: "radio",
                    name: "is_multiple",
                    value: "yes",
                    className: "custom-radio",
                    onChange: e => {
                      setIsMultiple(e.target.value);
                    }
                  }), jsxRuntime.jsx("span", {
                    children: "Yes"
                  })]
                }), jsxRuntime.jsxs("label", {
                  children: [jsxRuntime.jsx(Field, {
                    type: "radio",
                    name: "is_multiple",
                    value: "no",
                    onChange: e => {
                      setIsMultiple(e.target.value);
                    },
                    className: "custom-radio"
                  }), jsxRuntime.jsx("span", {
                    children: "No"
                  })]
                })]
              })]
            }), isMultiple === "no" && jsxRuntime.jsxs("div", {
              className: "form-group ticket-section",
              style: {
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px"
              },
              children: [jsxRuntime.jsxs("div", {
                className: "form-items",
                children: [jsxRuntime.jsxs("div", {
                  className: "form-cont",
                  children: [jsxRuntime.jsx("label", {
                    htmlFor: "fullName",
                    children: "Receiver's Full Name"
                  }), jsxRuntime.jsx(Field, {
                    name: "fullName",
                    placeholder: "Full Name"
                  })]
                }), jsxRuntime.jsxs("div", {
                  className: "form-cont",
                  children: [jsxRuntime.jsx("label", {
                    htmlFor: "email",
                    children: "Receiver's Email"
                  }), jsxRuntime.jsx(Field, {
                    name: "email",
                    placeholder: "Email"
                  })]
                }), jsxRuntime.jsx(WhatsAppInput, {
                  index: null,
                  fieldName: `whatsAppNumber`
                })]
              }), uniqueQuestions && (uniqueQuestions === null || uniqueQuestions === void 0 ? void 0 : uniqueQuestions.length) > 0 && jsxRuntime.jsxs("div", {
                className: "questions-container",
                children: [jsxRuntime.jsx("h3", {
                  className: "",
                  children: "Quick Questions"
                }), jsxRuntime.jsx("div", {
                  className: "questionss",
                  children: uniqueQuestions.map((q, i) => jsxRuntime.jsxs("div", {
                    className: "question-card",
                    children: [jsxRuntime.jsxs("label", {
                      children: [q.question, (q === null || q === void 0 ? void 0 : q.isRequired) === "True" && jsxRuntime.jsx("span", {
                        className: "",
                        children: "*"
                      })]
                    }), jsxRuntime.jsx(Field, {
                      name: `quickQuestion_${q.id}`,
                      placeholder: "Answer here"
                    })]
                  }, q.id + i))
                }), errorMessage && jsxRuntime.jsx("div", {
                  className: "error-msg",
                  children: errorMessage
                })]
              })]
            }), isMultiple === "yes" && tickets.map((ticket, index) => {
              var _a;
              const group = groupedTicketInfo[ticket.ticketName];
              const isFirstOfType = (group === null || group === void 0 ? void 0 : group.firstIndex) === index && (group === null || group === void 0 ? void 0 : group.count) > 1;
              return jsxRuntime.jsxs("div", {
                className: "ticket-section",
                style: {
                  border: "1px solid #ccc",
                  padding: "10px",
                  marginBottom: "10px"
                },
                children: [jsxRuntime.jsxs("div", {
                  className: "form-items",
                  children: [jsxRuntime.jsxs("div", {
                    className: "ticket-header",
                    children: [jsxRuntime.jsxs("strong", {
                      children: [ticket.ticketName, " ", index + 1]
                    }), jsxRuntime.jsxs("button", {
                      type: "button",
                      onClick: () => {
                        handleDeleteTicket(index);
                        setFieldValue(`fullName_${index}`, "");
                        setFieldValue(`email_${index}`, "");
                        setFieldValue(`whatsAppNumber_${index}`, "");
                      },
                      className: "delete-btn",
                      children: [jsxRuntime.jsx(DeleteIcon, {}), jsxRuntime.jsx("span", {
                        children: "Delete"
                      })]
                    })]
                  }), jsxRuntime.jsxs("div", {
                    className: "form-cont",
                    children: [jsxRuntime.jsx("label", {
                      children: "Owners Fullname"
                    }), jsxRuntime.jsx(Field, {
                      name: `fullName_${index}`,
                      placeholder: "Full Name"
                    })]
                  }), jsxRuntime.jsxs("div", {
                    className: "form-cont",
                    children: [jsxRuntime.jsx("label", {
                      children: "Email"
                    }), jsxRuntime.jsx(Field, {
                      name: `email_${index}`,
                      placeholder: "Email"
                    })]
                  }), jsxRuntime.jsx(WhatsAppInput, {
                    index: index,
                    fieldName: `whatsAppNumber_${index}`
                  })]
                }), ((_a = ticket === null || ticket === void 0 ? void 0 : ticket.requiredQuestion) === null || _a === void 0 ? void 0 : _a.length) > 0 && jsxRuntime.jsxs("div", {
                  className: "questions-container",
                  children: [jsxRuntime.jsx("h3", {
                    className: "",
                    children: "Quick Questions"
                  }), jsxRuntime.jsx("div", {
                    className: "questionss",
                    children: ticket.requiredQuestion.map((question, qIndex) => {
                      const fieldName = `question_${index}_${question.id}`;
                      const answerValue = values[fieldName];
                      return jsxRuntime.jsxs("div", {
                        className: "question-card",
                        children: [jsxRuntime.jsxs("label", {
                          children: [question.question, question.isRequired === "True" && jsxRuntime.jsx("span", {
                            children: "*"
                          })]
                        }), jsxRuntime.jsx(Field, {
                          name: fieldName,
                          placeholder: "Answer here"
                        }), isFirstOfType && jsxRuntime.jsxs("div", {
                          className: "toggle-wrapper",
                          style: {
                            marginTop: "8px"
                          },
                          children: [jsxRuntime.jsx(Tooltip, {
                            text: "Please provide an answer first",
                            show: !answerValue,
                            position: "top",
                            children: jsxRuntime.jsxs("label", {
                              className: "toggle-switch",
                              children: [jsxRuntime.jsx("input", {
                                type: "checkbox",
                                checked: !!appliedToggles[question.id],
                                onChange: () => {
                                  answerValue && handleToggle(question.id, answerValue, setFieldValue);
                                }
                              }), jsxRuntime.jsx("span", {
                                className: "slider",
                                children: jsxRuntime.jsx("span", {
                                  className: "knob",
                                  children: jsxRuntime.jsx("span", {
                                    className: `icon-wrapper`,
                                    children: !!appliedToggles[question.id] ? jsxRuntime.jsx(ToggleSwitchOn, {
                                      width: "1rem",
                                      height: ".8rem"
                                    }) : jsxRuntime.jsx(CancelIcon, {})
                                  })
                                })
                              })]
                            })
                          }), jsxRuntime.jsx("span", {
                            children: "Apply answer to all ticket questions"
                          })]
                        })]
                      }, question.id + qIndex);
                    })
                  }), errorMessage && jsxRuntime.jsx("div", {
                    className: "error",
                    children: jsxRuntime.jsx("div", {
                      className: "error-msg",
                      children: errorMessage
                    })
                  })]
                })]
              }, ticket.id ? `${ticket.id}-${index}` : `ticket-${index}`);
            }), jsxRuntime.jsxs("div", {
              className: "coupon-container",
              children: [jsxRuntime.jsx("div", {
                className: "coupon-top",
                children: jsxRuntime.jsxs("h3", {
                  children: ["Coupon Code ", jsxRuntime.jsx("span", {
                    className: "",
                    children: "(Optional)"
                  })]
                })
              }), jsxRuntime.jsxs("div", {
                style: {
                  display: "flex",
                  flexDirection: "column"
                },
                children: [jsxRuntime.jsxs("div", {
                  className: "coupon-input",
                  children: [jsxRuntime.jsx(Field, {
                    id: "coupon",
                    name: "coupon",
                    value: discountCode,
                    onChange: e => {
                      setDiscountCode(e.target.value);
                      setCouponError("");
                    },
                    placeholder: "Enter coupon"
                  }), jsxRuntime.jsx("div", {
                    onClick: async () => {
                      if (discountCode) {
                        await handleCoupon(eventAddress, discountCode, tickets);
                      }
                    },
                    className: `apply ${!discountCode && "disable"}`,
                    children: showApplyCoupon ? jsxRuntime.jsx("div", {
                      className: "loading-btn",
                      children: jsxRuntime.jsx("div", {
                        className: "loader-spinner"
                      })
                    }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
                      children: "Apply"
                    })
                  })]
                }), couponError && jsxRuntime.jsx("div", {
                  className: "error",
                  children: jsxRuntime.jsx("div", {
                    className: "error-msg",
                    children: couponError
                  })
                })]
              })]
            })]
          })
        }), totalPrice > 0 && jsxRuntime.jsx(OrderSummary, {
          rates: rates,
          currentCurrency: currentCurrency !== null && currentCurrency !== void 0 ? currentCurrency : "USD",
          ticketsArray: selectedTickets,
          total: totalPrice,
          coupon: coupon,
          couponAppliedAmount: couponAppliedAmount,
          defaultCurrency: eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.currency
        }), openPaymentsModal ? jsxRuntime.jsxs("div", {
          className: "ctn-container",
          children: [jsxRuntime.jsx("div", {
            onClick: handleClosePayment,
            className: "go-back-btn",
            children: "Back"
          }), isSubmitting ? jsxRuntime.jsx("div", {
            className: "loading-btn",
            children: jsxRuntime.jsx("div", {
              className: "loader-spinner"
            })
          }) : jsxRuntime.jsx("button", {
            onClick: () => handlePaymentHandler({
              walletAddress: randomizeLastFourDigits("0x0000000000000000000000000000000000000002"),
              eventId: eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.id,
              eventAddress: eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.eventAddress,
              email: "package@gmail.com",
              tickets: data
            }),
            style: {
              background: buttonColor
            },
            className: "submit-btn",
            children: "Finalize payment"
          })]
        }) : jsxRuntime.jsxs("div", {
          className: "ctn-container",
          children: [jsxRuntime.jsx("div", {
            onClick: goBack,
            className: "go-back-btn",
            children: "Back"
          }), isSubmitting ? jsxRuntime.jsx("div", {
            className: "loading-btn",
            children: jsxRuntime.jsx("div", {
              className: "loader-spinner"
            })
          }) : jsxRuntime.jsx("button", {
            style: {
              background: buttonColor
            },
            type: "submit",
            className: "submit-btn",
            children: "Proceed to Payment"
          })]
        }), jsxRuntime.jsx(ClearErrorOnAnyChange, {
          clearError: () => {
            setErrorMessage(""), setCouponError(""), setAnswerError("");
          }
        })]
      })
    });
  };

  function n(n,e){var t=Object.keys(n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(n);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(n,e).enumerable}))),t.push.apply(t,a);}return t}function e(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?n(Object(a),true).forEach((function(n){r(e,n,a[n]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):n(Object(a)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(a,n));}));}return e}function t(n){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(n){return typeof n}:function(n){return n&&"function"==typeof Symbol&&n.constructor===Symbol&&n!==Symbol.prototype?"symbol":typeof n},t(n)}function a(n,e){if(!(n instanceof e))throw new TypeError("Cannot call a class as a function")}function o(n,e){for(var t=0;t<e.length;t++){var a=e[t];a.enumerable=a.enumerable||false,a.configurable=true,"value"in a&&(a.writable=true),Object.defineProperty(n,a.key,a);}}function i(n,e,t){return e&&o(n.prototype,e),t&&o(n,t),Object.defineProperty(n,"prototype",{writable:false}),n}function r(n,e,t){return e in n?Object.defineProperty(n,e,{value:t,enumerable:true,configurable:true,writable:true}):n[e]=t,n}function c(n,e){if(null==n)return {};var t,a,o=function(n,e){if(null==n)return {};var t,a,o={},i=Object.keys(n);for(a=0;a<i.length;a++)t=i[a],e.indexOf(t)>=0||(o[t]=n[t]);return o}(n,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(n);for(a=0;a<i.length;a++)t=i[a],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(n,t)&&(o[t]=n[t]);}return o}function s(n,e){return function(n){if(Array.isArray(n))return n}(n)||function(n,e){var t=null==n?null:"undefined"!=typeof Symbol&&n[Symbol.iterator]||n["@@iterator"];if(null==t)return;var a,o,i=[],r=true,c=false;try{for(t=t.call(n);!(r=(a=t.next()).done)&&(i.push(a.value),!e||i.length!==e);r=!0);}catch(n){c=true,o=n;}finally{try{r||null==t.return||t.return();}finally{if(c)throw o}}return i}(n,e)||p(n,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(n){return function(n){if(Array.isArray(n))return u(n)}(n)||function(n){if("undefined"!=typeof Symbol&&null!=n[Symbol.iterator]||null!=n["@@iterator"])return Array.from(n)}(n)||p(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function p(n,e){if(n){if("string"==typeof n)return u(n,e);var t=Object.prototype.toString.call(n).slice(8,-1);return "Object"===t&&n.constructor&&(t=n.constructor.name),"Map"===t||"Set"===t?Array.from(n):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?u(n,e):void 0}}function u(n,e){(null==e||e>n.length)&&(e=n.length);for(var t=0,a=new Array(e);t<e;t++)a[t]=n[t];return a}var d={cookieTestUrl:"https://legacy-staging.paystack.co/test-iframe/start.html",publishableKey:"uFmz/uE/SDT6GupOrSEXIZXGByjQ0zFkPyc9LqKHFqnTI0WPN3JS5kQPo/j9or0TOXlqMQj2lzHn/UGsQT4XeQ==",publicKey:"-----BEGIN PUBLIC KEY-----\r\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALhZs/7hP0g0+hrqTq0hFyGVxgco0NMx\r\nZD8nPS6ihxap0yNFjzdyUuZED6P4/aK9Ezl5ajEI9pcx5/1BrEE+F3kCAwEAAQ==\r\n-----END PUBLIC KEY-----",applePayVersion:6,applePayValidateSessionPath:"applepay/validate-session/",applePayChargePath:"applepay/charge"};e(e({},d),{},{checkoutUrl:"http://localhost:8081/",paymentBaseUrl:"https://legacy-staging.paystack.co/",paystackApiUrl:"https://studio-api.paystack.co/",siteUrl:"https://paystack.com",pusherKey:"1c7b262ee18455815893",pusherUrl:"http://localhost:8081/static/vendor/pusher.min.js"});var C=e(e({},d),{},{checkoutUrl:"https://checkout-studio.paystack.com/",paymentBaseUrl:"https://legacy-staging.paystack.co/",paystackApiUrl:"https://studio-api.paystack.co/",siteUrl:"https://beta.paystack.com",pusherKey:"1c7b262ee18455815893",pusherUrl:"https://checkout-studio.paystack.com/static/vendor/pusher.min.js"}),m={production:e(e({},d),{},{checkoutUrl:"https://checkout.paystack.com/",paymentBaseUrl:"https://standard.paystack.co/",paystackApiUrl:"https://api.paystack.co/",siteUrl:"https://paystack.com",pusherKey:"8e4b9b7ca3418bd5cdc8",pusherUrl:"https://checkout.paystack.com/static/vendor/pusher.min.js"})}.production||C;function y(n,e){var a=[];return Object.keys(n).forEach((function(o){var i=e?"".concat(e,"[").concat(o,"]"):o,r=n[i];a.push(null!==r&&"object"===("undefined"==typeof v?"undefined":t(v))?y(r,i):"".concat(encodeURIComponent(o),"=").concat(encodeURIComponent(r)));})),a.join("&")}function f(){return document.currentScript||(n=document.getElementsByTagName("script"))[n.length-1];var n;}function g(){var n=[],e=f();if(e){var t=Array.prototype.slice.call(e.attributes);n=Object.keys(t).filter((function(n){var e=t[n].nodeName;return e&&e.indexOf("data")>-1})).map((function(n){return t[n].nodeName}));}return n}var b='\n  <svg id="inline-button-wordmark--white" width="137" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <path d="M.037 5.095l1.075-.135c-.011-.774-.025-1.944-.013-2.149C1.19 1.364 2.38.134 3.81.013 3.9.006 3.99.002 4.077 0a2.947 2.947 0 0 1 2.046.76c.574.509.95 1.26 1.008 2.007.015.192.01 1.491.01 2.257l1.096.163L8.2 11.44 4.093 12 0 11.346l.037-6.251zm4.106-.514l1.724.256c-.007-.933-.05-2.295-.26-2.654-.319-.545-.846-.867-1.443-.88h-.063c-.607.008-1.138.322-1.458.864-.222.378-.266 1.66-.265 2.637l1.765-.223zM18.228 10.108c-.576 0-1.064-.072-1.464-.216a2.864 2.864 0 0 1-.972-.6 2.552 2.552 0 0 1-.588-.864 4.067 4.067 0 0 1-.252-1.044h1.008c.032.256.088.5.168.732.08.224.204.424.372.6.168.168.388.304.66.408.28.096.636.144 1.068.144.28 0 .536-.036.768-.108.24-.08.448-.192.624-.336.176-.144.312-.316.408-.516.104-.2.156-.42.156-.66 0-.24-.032-.448-.096-.624a1.02 1.02 0 0 0-.336-.468 1.885 1.885 0 0 0-.636-.324 6.4 6.4 0 0 0-1.008-.228 8.79 8.79 0 0 1-1.212-.276 3.246 3.246 0 0 1-.9-.432 1.982 1.982 0 0 1-.564-.672c-.128-.272-.192-.6-.192-.984 0-.328.068-.632.204-.912.136-.288.324-.536.564-.744.248-.208.54-.372.876-.492.336-.12.708-.18 1.116-.18.864 0 1.548.204 2.052.612.512.4.812.984.9 1.752h-.936c-.104-.544-.316-.932-.636-1.164-.32-.24-.78-.36-1.38-.36-.592 0-1.04.132-1.344.396a1.255 1.255 0 0 0-.444.996c0 .208.024.396.072.564.056.16.156.3.3.42.152.12.36.228.624.324a6.72 6.72 0 0 0 1.068.228c.48.072.9.168 1.26.288.36.12.664.276.912.468s.432.428.552.708c.128.28.192.624.192 1.032 0 .36-.076.696-.228 1.008a2.472 2.472 0 0 1-.612.804c-.264.224-.58.4-.948.528-.36.128-.752.192-1.176.192zM25.355 10.108c-.44 0-.848-.076-1.224-.228a2.916 2.916 0 0 1-.96-.636 2.966 2.966 0 0 1-.636-1.008 3.77 3.77 0 0 1-.216-1.308v-.096c0-.472.072-.904.216-1.296.144-.4.344-.74.6-1.02.264-.288.576-.508.936-.66.36-.16.756-.24 1.188-.24.36 0 .708.06 1.044.18.344.112.648.292.912.54.264.248.472.572.624.972.16.392.24.868.24 1.428v.324h-4.728c.024.72.204 1.272.54 1.656.336.376.828.564 1.476.564.984 0 1.54-.364 1.668-1.092h.996c-.112.632-.408 1.112-.888 1.44-.48.32-1.076.48-1.788.48zm1.704-3.852c-.048-.648-.232-1.112-.552-1.392-.312-.28-.728-.42-1.248-.42-.512 0-.932.164-1.26.492-.32.32-.524.76-.612 1.32h3.672zM32.091 10.108c-.44 0-.848-.072-1.224-.216a3.054 3.054 0 0 1-.972-.636 3.12 3.12 0 0 1-.648-1.008 3.626 3.626 0 0 1-.228-1.32v-.096c0-.48.08-.916.24-1.308.16-.4.376-.74.648-1.02.28-.28.604-.496.972-.648.376-.16.772-.24 1.188-.24.328 0 .644.04.948.12.312.08.588.208.828.384.248.168.456.392.624.672.168.28.276.62.324 1.02h-.984c-.08-.496-.284-.848-.612-1.056-.32-.208-.696-.312-1.128-.312a1.93 1.93 0 0 0-.804.168c-.24.112-.452.272-.636.48a2.23 2.23 0 0 0-.42.744 2.991 2.991 0 0 0-.156.996v.096c0 .776.188 1.364.564 1.764.384.392.88.588 1.488.588.224 0 .436-.032.636-.096a1.651 1.651 0 0 0 .96-.768c.112-.192.18-.416.204-.672h.924a2.595 2.595 0 0 1-.276.948 2.386 2.386 0 0 1-.576.744c-.24.208-.52.372-.84.492-.32.12-.668.18-1.044.18zM38.335 10.108a2.83 2.83 0 0 1-.876-.132 1.724 1.724 0 0 1-.684-.42 2.145 2.145 0 0 1-.456-.756c-.112-.304-.168-.672-.168-1.104V3.724h.996v3.924c0 .552.116.956.348 1.212.24.256.608.384 1.104.384.224 0 .44-.036.648-.108.208-.072.392-.18.552-.324.16-.144.288-.324.384-.54.096-.216.144-.464.144-.744V3.724h.996V10h-.996v-.996c-.144.296-.388.556-.732.78-.336.216-.756.324-1.26.324zM43.216 3.724h.996v1.128c.2-.352.452-.64.756-.864.312-.232.748-.356 1.308-.372v.936a4.461 4.461 0 0 0-.852.12 1.647 1.647 0 0 0-.66.324 1.472 1.472 0 0 0-.408.612c-.096.248-.144.564-.144.948V10h-.996V3.724zM50 10.108c-.44 0-.848-.076-1.224-.228a2.916 2.916 0 0 1-.96-.636 2.966 2.966 0 0 1-.636-1.008 3.77 3.77 0 0 1-.216-1.308v-.096c0-.472.072-.904.216-1.296.144-.4.344-.74.6-1.02.264-.288.576-.508.936-.66.36-.16.756-.24 1.188-.24.36 0 .708.06 1.044.18.344.112.648.292.912.54.264.248.472.572.624.972.16.392.24.868.24 1.428v.324h-4.728c.024.72.204 1.272.54 1.656.336.376.828.564 1.476.564.984 0 1.54-.364 1.668-1.092h.996c-.112.632-.408 1.112-.888 1.44-.48.32-1.076.48-1.788.48zm1.704-3.852c-.048-.648-.232-1.112-.552-1.392-.312-.28-.728-.42-1.248-.42-.512 0-.932.164-1.26.492-.32.32-.524.76-.612 1.32h3.672zM56.496 10.108c-.408 0-.788-.068-1.14-.204a2.683 2.683 0 0 1-.9-.612 3.01 3.01 0 0 1-.588-.984 4.01 4.01 0 0 1-.204-1.32v-.096c0-.48.072-.92.216-1.32.144-.4.344-.744.6-1.032.256-.296.564-.524.924-.684.36-.16.756-.24 1.188-.24.528 0 .956.112 1.284.336.328.216.584.476.768.78V.724h.996V10h-.996V8.92c-.088.152-.208.3-.36.444a2.792 2.792 0 0 1-.516.384 2.874 2.874 0 0 1-.6.252c-.216.072-.44.108-.672.108zm.108-.828c.288 0 .56-.048.816-.144.256-.096.476-.24.66-.432.184-.2.328-.448.432-.744.112-.304.168-.656.168-1.056v-.096c0-.808-.18-1.404-.54-1.788-.352-.384-.836-.576-1.452-.576-.624 0-1.112.208-1.464.624-.352.416-.528 1.008-.528 1.776v.096c0 .392.048.736.144 1.032.104.296.24.54.408.732.176.192.38.336.612.432.232.096.48.144.744.144zM67.712 10.108c-.512 0-.948-.112-1.308-.336a2.38 2.38 0 0 1-.816-.804V10h-.996V.724h.996V4.78a1.92 1.92 0 0 1 .348-.432c.152-.144.32-.268.504-.372.192-.112.396-.2.612-.264.216-.064.436-.096.66-.096.408 0 .788.072 1.14.216.352.144.652.352.9.624.256.272.456.604.6.996.144.392.216.832.216 1.32v.096c0 .48-.068.92-.204 1.32a3.103 3.103 0 0 1-.576 1.02 2.583 2.583 0 0 1-.9.672 2.937 2.937 0 0 1-1.176.228zm-.096-.828c.624 0 1.1-.2 1.428-.6.328-.408.492-.996.492-1.764V6.82c0-.4-.052-.748-.156-1.044a2.095 2.095 0 0 0-.42-.732 1.53 1.53 0 0 0-.612-.444 1.798 1.798 0 0 0-.744-.156c-.288 0-.56.048-.816.144a1.71 1.71 0 0 0-.648.444c-.184.192-.328.44-.432.744a3.152 3.152 0 0 0-.156 1.044v.096c0 .8.192 1.396.576 1.788.384.384.88.576 1.488.576zM73.63 9.352l-2.46-5.628h1.068l1.92 4.5 1.74-4.5h1.02l-3.468 8.46h-1.008l1.188-2.832zM87.127 3.669A3.138 3.138 0 0 0 86.1 2.95a3.09 3.09 0 0 0-1.228-.25c-.448 0-.848.086-1.187.26a2.199 2.199 0 0 0-.662.497v-.191a.387.387 0 0 0-.214-.348.323.323 0 0 0-.14-.03h-1.315a.314.314 0 0 0-.254.116.377.377 0 0 0-.1.262v8.97c0 .1.034.188.1.258a.34.34 0 0 0 .254.103h1.341a.342.342 0 0 0 .244-.103.336.336 0 0 0 .11-.259v-3.06c.178.202.417.357.702.464.35.134.72.203 1.093.203.43 0 .848-.082 1.242-.248a3.124 3.124 0 0 0 1.04-.724c.305-.326.545-.709.707-1.128a3.93 3.93 0 0 0 .263-1.477c0-.54-.086-1.037-.263-1.477a3.387 3.387 0 0 0-.706-1.12zm-1.204 3.24c-.073.19-.18.362-.315.51a1.415 1.415 0 0 1-1.065.466c-.2.001-.4-.04-.584-.12a1.484 1.484 0 0 1-.49-.346 1.593 1.593 0 0 1-.32-.51 1.738 1.738 0 0 1-.115-.63c0-.224.04-.435.115-.631a1.532 1.532 0 0 1 .804-.846c.185-.086.386-.13.59-.129.215 0 .414.044.593.13.177.083.338.199.474.341a1.622 1.622 0 0 1 .425 1.135c0 .225-.037.436-.112.63zM95.298 2.89h-1.33a.339.339 0 0 0-.246.11.384.384 0 0 0-.108.266v.166a1.856 1.856 0 0 0-.602-.472 2.525 2.525 0 0 0-1.166-.258 3.227 3.227 0 0 0-2.284.964 3.554 3.554 0 0 0-.734 1.123 3.827 3.827 0 0 0-.275 1.477c0 .54.092 1.037.275 1.477.184.434.427.817.728 1.128a3.146 3.146 0 0 0 2.277.973c.437 0 .834-.088 1.173-.259.25-.13.456-.287.608-.471v.177a.34.34 0 0 0 .11.259.341.341 0 0 0 .244.104h1.33a.324.324 0 0 0 .25-.105.349.349 0 0 0 .102-.258V3.267a.377.377 0 0 0-.1-.262.325.325 0 0 0-.252-.115zM93.502 6.9a1.55 1.55 0 0 1-.312.511c-.136.143-.296.26-.473.344-.178.085-.38.129-.596.129-.207 0-.407-.044-.59-.13a1.501 1.501 0 0 1-.791-.855 1.766 1.766 0 0 1-.112-.62c0-.225.038-.436.112-.632.075-.193.181-.364.314-.504.137-.143.3-.26.478-.342.182-.085.382-.129.59-.129.215 0 .417.044.595.13.178.085.338.2.473.341a1.623 1.623 0 0 1 .424 1.135c0 .215-.037.424-.112.622zM108.567 6.094a2.265 2.265 0 0 0-.654-.402c-.247-.101-.509-.181-.785-.235l-1.014-.204c-.26-.05-.441-.117-.543-.203a.328.328 0 0 1-.136-.264c0-.11.063-.2.189-.282.137-.086.329-.13.566-.13.26 0 .518.053.757.157.243.106.471.226.67.36.295.187.546.162.727-.053l.487-.57a.543.543 0 0 0 .152-.357c0-.128-.064-.245-.185-.351-.207-.184-.533-.378-.971-.568-.437-.192-.987-.29-1.637-.29-.427 0-.82.058-1.168.172-.35.116-.65.276-.893.474-.245.204-.438.44-.57.713a2 2 0 0 0-.198.875c0 .56.167 1.017.496 1.358.328.333.766.56 1.304.67l1.054.232c.3.062.528.132.675.21.129.067.19.163.19.297 0 .12-.061.227-.188.324-.133.104-.342.155-.622.155a1.83 1.83 0 0 1-.831-.19 3.056 3.056 0 0 1-.678-.458.995.995 0 0 0-.307-.17c-.126-.037-.268.003-.431.13l-.583.461c-.169.145-.24.32-.209.522.029.194.19.394.491.62.269.193.614.368 1.029.518.415.151.901.229 1.453.229.444 0 .854-.058 1.215-.172.362-.119.681-.278.941-.48a2.056 2.056 0 0 0 .819-1.663c0-.319-.053-.6-.165-.836a1.843 1.843 0 0 0-.447-.6zM114.383 7.73a.363.363 0 0 0-.295-.192.55.55 0 0 0-.343.113c-.095.062-.198.11-.306.141a.75.75 0 0 1-.426.013.43.43 0 0 1-.181-.093.554.554 0 0 1-.143-.204.92.92 0 0 1-.059-.362v-2.46h1.731c.099 0 .188-.04.266-.117a.368.368 0 0 0 .112-.26V3.268a.369.369 0 0 0-.115-.268.38.38 0 0 0-.263-.109h-1.732V1.216a.354.354 0 0 0-.108-.27.347.347 0 0 0-.243-.104h-1.344a.36.36 0 0 0-.34.226.371.371 0 0 0-.027.148V2.89h-.767a.324.324 0 0 0-.255.115.385.385 0 0 0-.098.262V4.31a.4.4 0 0 0 .212.346c.044.021.092.032.14.03h.768v2.925c0 .39.069.726.2 1.003.132.274.305.504.514.676.217.178.465.31.731.388.27.084.551.126.833.126.385 0 .75-.061 1.094-.18a2.13 2.13 0 0 0 .861-.552c.152-.181.17-.381.046-.581l-.463-.76zM121.672 2.89h-1.329a.339.339 0 0 0-.244.11.39.39 0 0 0-.08.122.394.394 0 0 0-.027.144v.166a1.906 1.906 0 0 0-.605-.472c-.335-.173-.726-.258-1.168-.258-.42 0-.834.083-1.226.249a3.24 3.24 0 0 0-1.055.715 3.528 3.528 0 0 0-.734 1.123 3.79 3.79 0 0 0-.276 1.477c0 .54.092 1.037.275 1.477.184.434.428.817.729 1.128a3.138 3.138 0 0 0 2.273.973 2.59 2.59 0 0 0 1.175-.259c.255-.13.457-.287.612-.471v.177a.34.34 0 0 0 .108.259.343.343 0 0 0 .243.104h1.329a.335.335 0 0 0 .252-.105.364.364 0 0 0 .102-.258V3.267a.38.38 0 0 0-.1-.262.332.332 0 0 0-.115-.087.311.311 0 0 0-.139-.028zM119.876 6.9a1.534 1.534 0 0 1-.786.855 1.362 1.362 0 0 1-.594.129c-.207 0-.405-.044-.588-.13a1.516 1.516 0 0 1-.792-.855 1.757 1.757 0 0 1-.113-.62c0-.225.037-.436.112-.632.073-.187.179-.358.314-.504.138-.143.3-.26.479-.342.184-.086.385-.13.588-.129.217 0 .415.044.594.13.181.085.34.2.472.341.134.143.24.313.314.504a1.73 1.73 0 0 1 0 1.253zM128.978 7.64l-.763-.593c-.146-.118-.284-.15-.404-.1a.742.742 0 0 0-.279.205 2.527 2.527 0 0 1-.583.535c-.192.122-.444.183-.742.183-.219 0-.42-.04-.6-.122a1.423 1.423 0 0 1-.469-.342 1.575 1.575 0 0 1-.308-.51 1.751 1.751 0 0 1-.106-.617c0-.228.034-.438.106-.632.07-.192.173-.363.308-.503.135-.144.295-.26.472-.342.187-.088.391-.132.597-.13.298 0 .547.064.742.187.198.126.396.306.584.534.078.092.17.16.278.206.122.048.259.016.401-.101l.762-.594a.53.53 0 0 0 .201-.269.437.437 0 0 0-.034-.365 3.329 3.329 0 0 0-1.18-1.127c-.504-.291-1.108-.441-1.784-.441a3.519 3.519 0 0 0-2.51 1.033c-.322.322-.576.71-.747 1.137a3.68 3.68 0 0 0-.273 1.407c0 .495.093.968.273 1.402.173.424.427.808.747 1.128a3.527 3.527 0 0 0 2.51 1.034c.676 0 1.28-.149 1.784-.444a3.286 3.286 0 0 0 1.182-1.13.411.411 0 0 0 .055-.173.415.415 0 0 0-.023-.182.624.624 0 0 0-.197-.273zM136.06 9.045l-2.104-3.143 1.801-2.415c.094-.139.119-.272.075-.397-.031-.09-.116-.2-.334-.2h-1.425a.52.52 0 0 0-.234.058.482.482 0 0 0-.209.205L132.191 5.2h-.349V.363a.37.37 0 0 0-.099-.26.352.352 0 0 0-.253-.103h-1.332a.37.37 0 0 0-.337.22.346.346 0 0 0-.027.143V9.29c0 .103.038.193.11.259a.353.353 0 0 0 .254.104h1.333a.328.328 0 0 0 .251-.105.346.346 0 0 0 .075-.119.333.333 0 0 0 .024-.14V6.927h.386l1.571 2.446c.112.187.267.281.46.281h1.491c.226 0 .32-.11.358-.202.054-.13.038-.262-.047-.406zM102.863 2.89h-1.489a.389.389 0 0 0-.298.122.544.544 0 0 0-.13.249l-1.099 4.167h-.268l-1.182-4.167a.66.66 0 0 0-.113-.247.329.329 0 0 0-.264-.124h-1.544c-.199 0-.325.066-.372.193a.588.588 0 0 0-.002.37l1.887 5.865c.03.093.08.17.145.232a.388.388 0 0 0 .281.104h.798l-.066.19-.19.547a.872.872 0 0 1-.29.426.7.7 0 0 1-.442.148.956.956 0 0 1-.4-.09 1.842 1.842 0 0 1-.35-.209.62.62 0 0 0-.335-.115h-.016c-.13 0-.243.074-.334.216l-.474.708c-.193.304-.086.504.039.615.234.224.528.399.875.524.344.125.723.186 1.126.186.682 0 1.252-.187 1.689-.565.435-.376.756-.887.952-1.524l2.188-7.258c.05-.155.05-.284.005-.389-.037-.08-.125-.174-.327-.174z" fill="#ffffff"/>\n  </svg>\n',k='\n<svg id="inline-button-wordmark--grey" width="166" height="16" viewBox="0 0 166 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path\n  d="M0.564068 6.26985L1.86515 6.10375C1.85184 5.15143 1.83489 3.71187 1.84942 3.45964C1.95955 1.67927 3.39982 0.16589 5.13056 0.0170127C5.23949 0.00839996 5.34842 0.0034784 5.45371 0.00101762C6.36645 -0.0209585 7.25272 0.313716 7.93 0.936113C8.62472 1.56238 9.07979 2.4864 9.14999 3.4055C9.16815 3.64174 9.1621 5.24002 9.1621 6.18249L10.4886 6.38305L10.4438 14.0767L5.47308 14.7657L0.519287 13.961L0.564068 6.26985ZM5.53359 5.63743L7.62016 5.95241C7.61169 4.80446 7.55965 3.12867 7.30548 2.68696C6.91939 2.0164 6.28156 1.62021 5.55901 1.60421H5.48276C4.7481 1.61406 4.10543 2.0004 3.71813 2.66727C3.44944 3.13236 3.39619 4.70972 3.3974 5.91181L5.53359 5.63743ZM22.5808 12.4378C21.8836 12.4378 21.293 12.3492 20.8089 12.172C20.372 12.0088 19.9719 11.7577 19.6325 11.4338C19.3256 11.1331 19.0833 10.7712 18.9208 10.3707C18.7637 9.95815 18.6612 9.52621 18.6158 9.08621H19.8358C19.8745 9.40119 19.9423 9.70141 20.0391 9.98686C20.136 10.2625 20.286 10.5085 20.4894 10.7251C20.6927 10.9318 20.959 11.0991 21.2882 11.2271C21.6271 11.3452 22.0579 11.4043 22.5808 11.4043C22.9197 11.4043 23.2295 11.36 23.5103 11.2714C23.8008 11.173 24.0525 11.0351 24.2655 10.858C24.4785 10.6808 24.6431 10.4692 24.7593 10.2231C24.8852 9.97701 24.9481 9.70633 24.9481 9.41103C24.9481 9.11574 24.9094 8.85982 24.8319 8.64327C24.7536 8.41559 24.6125 8.21568 24.4253 8.06745C24.196 7.88594 23.9347 7.75064 23.6555 7.6688C23.257 7.54201 22.849 7.4482 22.4355 7.38828C21.9393 7.31041 21.4491 7.19693 20.9686 7.04869C20.5808 6.92967 20.2133 6.75038 19.8794 6.51716C19.5939 6.29685 19.3607 6.01432 19.1968 5.69034C19.0418 5.35567 18.9644 4.9521 18.9644 4.47963C18.9644 4.07607 19.0467 3.70203 19.2113 3.35752C19.3759 3.00317 19.6034 2.69803 19.8939 2.44211C20.194 2.18619 20.5475 1.98441 20.9541 1.83676C21.3608 1.68911 21.811 1.61529 22.3048 1.61529C23.3505 1.61529 24.1784 1.86629 24.7884 2.36829C25.4081 2.86044 25.7711 3.57899 25.8777 4.52393H24.7448C24.6189 3.8546 24.3624 3.37721 23.9751 3.09176C23.5878 2.79646 23.031 2.64882 22.3048 2.64882C21.5883 2.64882 21.0461 2.81123 20.6782 3.13605C20.5037 3.28606 20.3648 3.47417 20.2717 3.68635C20.1787 3.89853 20.1339 4.12931 20.1408 4.36152C20.1408 4.61744 20.1698 4.84875 20.2279 5.05546C20.2957 5.25232 20.4167 5.42457 20.591 5.57222C20.775 5.71987 21.0267 5.85275 21.3463 5.97087C21.7689 6.09987 22.2012 6.19369 22.6389 6.25139C23.2198 6.33998 23.7281 6.4581 24.1639 6.60575C24.5996 6.75339 24.9675 6.94533 25.2677 7.18157C25.5678 7.4178 25.7905 7.70818 25.9358 8.05268C26.0907 8.39719 26.1681 8.82045 26.1681 9.32245C26.1681 9.76539 26.0761 10.1788 25.8922 10.5627C25.7149 10.9408 25.4627 11.2775 25.1515 11.5519C24.8319 11.8275 24.4495 12.0441 24.0041 12.2016C23.5684 12.359 23.094 12.4378 22.5808 12.4378ZM31.2066 12.4378C30.6741 12.4378 30.1803 12.3443 29.7252 12.1573C29.2906 11.9775 28.8956 11.7115 28.5633 11.3747C28.2268 11.0185 27.965 10.5966 27.7936 10.1345C27.6136 9.61796 27.5251 9.07309 27.5321 8.52515V8.40704C27.5321 7.82629 27.6193 7.29476 27.7936 6.81245C27.9679 6.3203 28.2099 5.90196 28.5198 5.55746C28.8393 5.2031 29.2169 4.93242 29.6526 4.7454C30.0883 4.54854 30.5676 4.45011 31.0905 4.45011C31.5262 4.45011 31.9473 4.52393 32.354 4.67158C32.7704 4.80938 33.1383 5.03085 33.4578 5.33599C33.7773 5.64112 34.0291 6.03977 34.213 6.53192C34.4067 7.01424 34.5035 7.5999 34.5035 8.28892V8.68756H28.7812C28.8102 9.57345 29.0281 10.2526 29.4348 10.7251C29.8414 11.1877 30.4369 11.419 31.2212 11.419C32.4121 11.419 33.085 10.9712 33.24 10.0754H34.4454C34.3099 10.8531 33.9516 11.4436 33.3707 11.8472C32.7897 12.2409 32.0684 12.4378 31.2066 12.4378ZM33.269 7.69833C33.2109 6.90104 32.9882 6.33014 32.6009 5.98563C32.2233 5.64112 31.7198 5.46887 31.0905 5.46887C30.4708 5.46887 29.9624 5.67065 29.5655 6.07422C29.1782 6.46794 28.9313 7.00932 28.8248 7.69833H33.269ZM39.3593 12.4378C38.8267 12.4378 38.3329 12.3492 37.8779 12.172C37.4401 11.9901 37.0407 11.7245 36.7014 11.3895C36.3636 11.0315 36.0973 10.6103 35.9172 10.1493C35.7268 9.63002 35.6332 9.07925 35.6412 8.52515V8.40704C35.6412 7.81645 35.738 7.28 35.9317 6.79769C36.1253 6.30553 36.3868 5.8872 36.716 5.54269C37.0548 5.19818 37.447 4.93242 37.8924 4.7454C38.3475 4.54854 38.8267 4.45011 39.3302 4.45011C39.7272 4.45011 40.1097 4.49932 40.4776 4.59775C40.8552 4.69618 41.1893 4.85367 41.4797 5.07022C41.7799 5.27693 42.0316 5.55253 42.235 5.89704C42.4383 6.24155 42.569 6.65988 42.6271 7.15204H41.4362C41.3393 6.54177 41.0924 6.10867 40.6955 5.85275C40.3082 5.59683 39.8531 5.46887 39.3302 5.46887C38.995 5.46599 38.6632 5.53649 38.3571 5.67557C38.0667 5.81338 37.8101 6.01024 37.5874 6.26616C37.3615 6.53514 37.1889 6.84598 37.0791 7.18157C36.9484 7.57626 36.8845 7.99063 36.8902 8.40704V8.52515C36.8902 9.47994 37.1178 10.2034 37.5729 10.6956C38.0376 11.1779 38.6379 11.419 39.3738 11.419C39.6449 11.419 39.9015 11.3797 40.1436 11.3009C40.6361 11.1497 41.0523 10.8113 41.3055 10.356C41.441 10.1197 41.5233 9.84413 41.5524 9.52915H42.6707C42.6338 9.9361 42.5204 10.3321 42.3366 10.6956C42.1663 11.0447 41.9293 11.3559 41.6395 11.611C41.349 11.8669 41.0101 12.0687 40.6228 12.2163C40.2355 12.364 39.8144 12.4378 39.3593 12.4378ZM46.9164 12.4378C46.5568 12.4406 46.199 12.3858 45.8562 12.2754C45.5441 12.1717 45.2605 11.9947 45.0284 11.7586C44.7829 11.4908 44.595 11.1741 44.4765 10.8284C44.3409 10.4544 44.2731 10.0016 44.2731 9.47009V4.58299H45.4786V9.41103C45.4786 10.0902 45.619 10.5873 45.8998 10.9023C46.1903 11.2172 46.6356 11.3747 47.236 11.3747C47.5071 11.3747 47.7685 11.3304 48.0202 11.2419C48.272 11.1533 48.4947 11.0204 48.6883 10.8432C48.882 10.666 49.0369 10.4446 49.1531 10.1788C49.2693 9.91303 49.3274 9.6079 49.3274 9.26339V4.58299H50.5328V12.3049H49.3274V11.0794C49.1531 11.4436 48.8578 11.7635 48.4414 12.0391C48.0348 12.3049 47.5264 12.4378 46.9164 12.4378ZM52.8239 4.58299H54.0294V5.97087C54.2715 5.53777 54.5765 5.18342 54.9444 4.90781C55.322 4.62236 55.8497 4.46979 56.5275 4.45011V5.60175C56.1799 5.61707 55.8346 5.66652 55.4963 5.7494C55.2039 5.81939 54.9308 5.95567 54.6975 6.14804C54.4729 6.35252 54.303 6.6116 54.2037 6.90104C54.0875 7.20618 54.0294 7.59498 54.0294 8.06745V12.3049H52.8239V4.58299ZM61.0347 12.4378C60.5021 12.4378 60.0083 12.3443 59.5533 12.1573C59.1186 11.9775 58.7236 11.7115 58.3914 11.3747C58.0549 11.0185 57.793 10.5966 57.6216 10.1345C57.4416 9.61796 57.3531 9.07309 57.3602 8.52515V8.40704C57.3602 7.82629 57.4473 7.29476 57.6216 6.81245C57.7959 6.3203 58.038 5.90196 58.3478 5.55746C58.6673 5.2031 59.0449 4.93242 59.4806 4.7454C59.9164 4.54854 60.3956 4.45011 60.9185 4.45011C61.3542 4.45011 61.7754 4.52393 62.1821 4.67158C62.5984 4.80938 62.9663 5.03085 63.2859 5.33599C63.6054 5.64112 63.8571 6.03977 64.0411 6.53192C64.2347 7.01424 64.3316 7.5999 64.3316 8.28892V8.68756H58.6092C58.6383 9.57345 58.8561 10.2526 59.2628 10.7251C59.6695 11.1877 60.2649 11.419 61.0492 11.419C62.2401 11.419 62.9131 10.9712 63.068 10.0754H64.2735C64.1379 10.8531 63.7797 11.4436 63.1987 11.8472C62.6178 12.2409 61.8964 12.4378 61.0347 12.4378ZM63.097 7.69833C63.0389 6.90104 62.8162 6.33014 62.429 5.98563C62.0513 5.64112 61.5478 5.46887 60.9185 5.46887C60.2988 5.46887 59.7905 5.67065 59.3935 6.07422C59.0062 6.46794 58.7593 7.00932 58.6528 7.69833H63.097ZM68.8968 12.4378C68.403 12.4378 67.9431 12.3541 67.5171 12.1868C67.1072 12.0141 66.7365 11.7578 66.4278 11.4338C66.1165 11.0803 65.8749 10.6693 65.7161 10.2231C65.5451 9.69956 65.4617 9.15057 65.4692 8.59898V8.48086C65.4692 7.89027 65.5564 7.3489 65.7307 6.85675C65.905 6.36459 66.147 5.94134 66.4569 5.58698C66.7667 5.22279 67.1395 4.94226 67.5752 4.7454C68.0109 4.54854 68.4902 4.45011 69.013 4.45011C69.6521 4.45011 70.1701 4.58791 70.5671 4.86352C70.964 5.12928 71.2739 5.44918 71.4966 5.82322V0.891819H72.702V12.3049H71.4966V10.9761C71.3901 11.1631 71.2448 11.3452 71.0609 11.5224C70.8713 11.7038 70.6617 11.8623 70.4363 11.9949C70.2066 12.1258 69.963 12.2298 69.7102 12.3049C69.4487 12.3935 69.1776 12.4378 68.8968 12.4378ZM69.0275 11.419C69.3761 11.419 69.7053 11.36 70.0152 11.2419C70.325 11.1237 70.5913 10.9466 70.814 10.7103C71.0367 10.4642 71.2109 10.1591 71.3368 9.79492C71.4724 9.42088 71.5401 8.98778 71.5401 8.49562V8.37751C71.5401 7.38335 71.3223 6.65004 70.8866 6.17757C70.4606 5.7051 69.8748 5.46887 69.1292 5.46887C68.374 5.46887 67.7834 5.72479 67.3573 6.23663C66.9313 6.74847 66.7183 7.47686 66.7183 8.4218V8.53992C66.7183 9.02223 66.7764 9.44549 66.8926 9.80968C67.0184 10.1739 67.183 10.4741 67.3864 10.7103C67.5994 10.9466 67.8463 11.1237 68.1271 11.2419C68.4079 11.36 68.708 11.419 69.0275 11.419ZM82.4716 12.4378C81.852 12.4378 81.3243 12.3 80.8886 12.0244C80.485 11.7813 80.146 11.4417 79.901 11.0351V12.3049H78.6955V0.891819H79.901V5.88228C80.0153 5.68531 80.1572 5.50626 80.3221 5.35075C80.5061 5.17357 80.7094 5.02101 80.9321 4.89305C81.1645 4.75524 81.4114 4.64697 81.6729 4.56822C81.9343 4.48948 82.2005 4.45011 82.4716 4.45011C82.9655 4.45011 83.4254 4.53869 83.8514 4.71587C84.2774 4.89305 84.6405 5.14897 84.9407 5.48363C85.2505 5.8183 85.4926 6.22679 85.6669 6.7091C85.8411 7.19141 85.9283 7.73278 85.9283 8.33321V8.45133C85.9283 9.04192 85.846 9.58329 85.6814 10.0754C85.5295 10.535 85.2929 10.9609 84.9843 11.3304C84.6852 11.6839 84.3133 11.9662 83.895 12.1573C83.4445 12.3492 82.96 12.4447 82.4716 12.4378ZM82.3555 11.419C83.1107 11.419 83.6868 11.173 84.0838 10.6808C84.4808 10.1788 84.6793 9.45533 84.6793 8.51039V8.39227C84.6793 7.90012 84.6163 7.47194 84.4904 7.10775C84.3829 6.77559 84.2099 6.46915 83.9821 6.2071C83.7841 5.96487 83.5294 5.77704 83.2414 5.66081C82.9581 5.53232 82.6511 5.46687 82.3409 5.46887C81.9924 5.46887 81.6632 5.52793 81.3533 5.64604C81.0537 5.7638 80.7852 5.95084 80.569 6.19234C80.3464 6.42857 80.1721 6.73371 80.0462 7.10775C79.9127 7.52209 79.8488 7.95635 79.8574 8.39227V8.51039C79.8574 9.4947 80.0898 10.228 80.5545 10.7103C81.0193 11.1828 81.6196 11.419 82.3555 11.419ZM89.6342 11.5076L86.6569 4.58299H87.9495L90.2733 10.1197L92.3792 4.58299H93.6137L89.4164 14.9921H88.1964L89.6342 11.5076ZM105.97 4.51532C105.618 4.13844 105.195 3.83755 104.727 3.63067C104.257 3.42601 103.751 3.32132 103.241 3.32307C102.698 3.32307 102.214 3.42888 101.804 3.64297C101.501 3.7934 101.229 4.00091 101.003 4.25447V4.01947C101.003 3.93064 100.979 3.84347 100.933 3.76781C100.888 3.69214 100.822 3.631 100.744 3.59129C100.691 3.56626 100.633 3.55364 100.574 3.55438H98.9827C98.9241 3.55245 98.8658 3.56433 98.8125 3.58909C98.7592 3.61385 98.7122 3.65082 98.6753 3.69711C98.5956 3.78474 98.5523 3.90019 98.5542 4.01947V15.0561C98.5542 15.1791 98.5954 15.2874 98.6753 15.3735C98.715 15.4152 98.7629 15.4479 98.8158 15.4698C98.8688 15.4916 98.9256 15.502 98.9827 15.5002H100.606C100.661 15.5001 100.715 15.4889 100.766 15.4671C100.817 15.4453 100.863 15.4135 100.901 15.3735C100.945 15.3333 100.979 15.284 101.002 15.229C101.025 15.174 101.036 15.1146 101.034 15.0548V11.2898C101.25 11.5384 101.539 11.7291 101.884 11.8607C102.307 12.0256 102.755 12.1105 103.207 12.1105C103.727 12.1105 104.233 12.0096 104.71 11.8054C105.185 11.599 105.613 11.2958 105.969 10.9146C106.338 10.5135 106.628 10.0422 106.824 9.52669C107.044 8.94733 107.152 8.33033 107.143 7.70941C107.143 7.045 107.038 6.43349 106.824 5.89212C106.631 5.38011 106.341 4.91182 105.97 4.51409V4.51532ZM104.513 8.50178C104.424 8.73555 104.295 8.94718 104.131 9.12928C103.969 9.31219 103.77 9.45789 103.547 9.55674C103.325 9.65558 103.085 9.70531 102.842 9.70264C102.6 9.70387 102.358 9.65342 102.136 9.55499C101.911 9.4556 101.71 9.31074 101.542 9.12928C101.375 8.94704 101.244 8.73407 101.155 8.50178C101.062 8.25439 101.015 7.99155 101.016 7.72663C101.016 7.45102 101.064 7.19141 101.155 6.95026C101.332 6.48635 101.682 6.1122 102.128 5.90935C102.352 5.80353 102.595 5.7494 102.842 5.75063C103.103 5.75063 103.343 5.80476 103.56 5.91058C103.774 6.0127 103.969 6.15542 104.134 6.33014C104.476 6.71058 104.661 7.21105 104.648 7.72663C104.648 8.00347 104.603 8.26308 104.513 8.50178ZM115.859 3.55684H114.249C114.193 3.55751 114.138 3.56987 114.087 3.59315C114.036 3.61643 113.99 3.65013 113.952 3.69219C113.868 3.78 113.821 3.8973 113.821 4.01947V4.22371C113.62 3.9808 113.372 3.78302 113.092 3.64297C112.654 3.42397 112.17 3.31511 111.681 3.32553C111.166 3.32821 110.657 3.43439 110.183 3.63795C109.708 3.84151 109.278 4.13843 108.917 4.51162C108.537 4.91069 108.236 5.37962 108.029 5.89335C107.801 6.47081 107.687 7.08847 107.696 7.71064C107.696 8.37505 107.807 8.98655 108.029 9.52792C108.251 10.0619 108.545 10.5331 108.91 10.9158C109.265 11.2945 109.693 11.5958 110.167 11.8016C110.641 12.0074 111.15 12.1133 111.665 12.113C112.194 12.113 112.675 12.0047 113.085 11.7943C113.388 11.6343 113.637 11.4412 113.821 11.2148V11.4326C113.82 11.4923 113.831 11.5516 113.854 11.6066C113.877 11.6615 113.911 11.7109 113.954 11.7512C113.993 11.7915 114.038 11.8236 114.089 11.8456C114.14 11.8676 114.194 11.879 114.249 11.8792H115.859C115.916 11.8812 115.972 11.8706 116.024 11.8483C116.077 11.826 116.124 11.7925 116.162 11.75C116.203 11.7085 116.235 11.6589 116.256 11.6043C116.277 11.5497 116.287 11.4912 116.285 11.4326V4.0207C116.287 3.90142 116.244 3.78597 116.164 3.69834C116.127 3.65337 116.08 3.61736 116.027 3.5929C115.975 3.56844 115.917 3.55613 115.859 3.55684ZM113.685 8.4907C113.601 8.72324 113.473 8.9368 113.308 9.11943C113.143 9.29538 112.95 9.43933 112.735 9.54269C112.52 9.64727 112.275 9.70141 112.014 9.70141C111.764 9.70141 111.521 9.64727 111.3 9.54146C111.079 9.4398 110.881 9.29437 110.717 9.11372C110.552 8.93306 110.425 8.72082 110.343 8.48947C110.253 8.24551 110.207 7.98712 110.207 7.72663C110.207 7.44979 110.253 7.19018 110.343 6.94903C110.433 6.71156 110.562 6.50116 110.723 6.32891C110.888 6.15296 111.086 6.00901 111.301 5.90812C111.521 5.80353 111.764 5.7494 112.015 5.7494C112.275 5.7494 112.52 5.80353 112.735 5.90935C112.951 6.01393 113.144 6.15542 113.308 6.32891C113.65 6.70961 113.834 7.21001 113.821 7.7254C113.821 7.98993 113.776 8.24709 113.685 8.4907ZM131.919 7.49901C131.685 7.28955 131.417 7.12228 131.127 7.00439C130.828 6.88012 130.511 6.78169 130.177 6.71525L128.95 6.46425C128.635 6.40273 128.416 6.3203 128.293 6.21448C128.242 6.17732 128.201 6.12853 128.172 6.07209C128.144 6.01565 128.128 5.95315 128.128 5.88966C128.128 5.75432 128.204 5.64358 128.357 5.54269C128.523 5.43688 128.755 5.38274 129.042 5.38274C129.357 5.38274 129.669 5.44795 129.958 5.57591C130.252 5.70633 130.528 5.85398 130.769 6.01885C131.126 6.24893 131.43 6.21817 131.649 5.95364L132.238 5.25232C132.351 5.13393 132.416 4.97752 132.422 4.81307C132.422 4.65558 132.345 4.51162 132.198 4.3812C131.948 4.15481 131.553 3.91612 131.023 3.68234C130.494 3.44611 129.829 3.32553 129.042 3.32553C128.525 3.32553 128.049 3.39689 127.628 3.53716C127.205 3.67988 126.842 3.87674 126.547 4.12036C126.251 4.37136 126.017 4.66173 125.858 4.99763C125.699 5.33341 125.617 5.70154 125.618 6.07422C125.618 6.76324 125.82 7.32552 126.218 7.74509C126.615 8.15481 127.145 8.43411 127.796 8.56945L129.072 8.8549C129.435 8.93118 129.711 9.01731 129.889 9.11328C130.045 9.19572 130.119 9.31383 130.119 9.47871C130.119 9.62635 130.045 9.758 129.892 9.87735C129.731 10.0053 129.478 10.0681 129.139 10.0681C128.79 10.0717 128.445 9.99161 128.133 9.83429C127.836 9.68469 127.56 9.49515 127.312 9.27077C127.202 9.17922 127.076 9.1084 126.941 9.0616C126.788 9.01608 126.616 9.0653 126.419 9.22155L125.714 9.78876C125.509 9.96717 125.423 10.1825 125.461 10.431C125.496 10.6697 125.691 10.9158 126.055 11.1939C126.38 11.4313 126.798 11.6467 127.3 11.8312C127.803 12.017 128.391 12.113 129.059 12.113C129.596 12.113 130.092 12.0416 130.529 11.9013C130.967 11.7549 131.354 11.5593 131.668 11.3108C131.98 11.0724 132.231 10.7631 132.404 10.4077C132.576 10.0523 132.663 9.66076 132.659 9.26462C132.659 8.87212 132.595 8.52638 132.46 8.23601C132.331 7.95492 132.147 7.70366 131.919 7.49778V7.49901ZM138.958 9.51193C138.923 9.445 138.872 9.3882 138.809 9.34687C138.747 9.30555 138.675 9.28105 138.601 9.27569C138.451 9.27322 138.305 9.3222 138.186 9.41473C138.071 9.49101 137.946 9.55007 137.815 9.58821C137.649 9.64412 137.47 9.64967 137.3 9.60421C137.219 9.58443 137.144 9.54519 137.081 9.48978C137.005 9.42056 136.946 9.33472 136.908 9.23878C136.855 9.09669 136.83 8.94521 136.836 8.79338V5.76662H138.931C139.051 5.76662 139.159 5.71741 139.253 5.62267C139.295 5.58108 139.329 5.5314 139.352 5.4765C139.376 5.42159 139.388 5.36254 139.389 5.30276V4.02193C139.389 3.96024 139.377 3.89918 139.353 3.84249C139.329 3.78579 139.294 3.73465 139.25 3.69219C139.165 3.60724 139.05 3.55916 138.931 3.55807H136.835V1.49717C136.838 1.43555 136.827 1.37406 136.805 1.31679C136.782 1.25952 136.748 1.20777 136.704 1.16497C136.627 1.08454 136.521 1.03854 136.41 1.03701H134.784C134.695 1.03555 134.609 1.06135 134.535 1.11101C134.462 1.16066 134.405 1.23182 134.372 1.31507C134.349 1.37287 134.338 1.43484 134.339 1.49717V3.55684H133.411C133.353 3.55549 133.294 3.5675 133.241 3.59199C133.188 3.61647 133.14 3.65281 133.102 3.69834C133.025 3.78687 132.982 3.90193 132.984 4.0207V5.304C132.985 5.39177 133.01 5.47753 133.055 5.55238C133.1 5.62724 133.164 5.68846 133.24 5.72971C133.294 5.75555 133.352 5.76908 133.41 5.76662H134.339V9.36551C134.339 9.84536 134.423 10.2588 134.581 10.5996C134.741 10.9367 134.951 11.2197 135.204 11.4313C135.466 11.6503 135.766 11.8128 136.088 11.9087C136.415 12.0121 136.755 12.0638 137.096 12.0638C137.562 12.0638 138.004 11.9887 138.421 11.8423C138.817 11.7053 139.175 11.4722 139.463 11.1631C139.647 10.9404 139.668 10.6943 139.518 10.4483L138.958 9.51316V9.51193ZM147.78 3.55684H146.171C146.116 3.55785 146.061 3.57036 146.01 3.59363C145.959 3.6169 145.914 3.65043 145.876 3.69219C145.835 3.73558 145.802 3.78651 145.779 3.84229C145.758 3.89876 145.746 3.95885 145.747 4.01947V4.22371C145.544 3.98167 145.295 3.78409 145.014 3.64297C144.609 3.43011 144.136 3.32553 143.601 3.32553C143.092 3.32553 142.591 3.42765 142.117 3.6319C141.638 3.83631 141.204 4.13534 140.84 4.51162C140.46 4.9102 140.158 5.37925 139.952 5.89335C139.722 6.47038 139.608 7.08828 139.618 7.71064C139.618 8.37505 139.729 8.98655 139.95 9.52792C140.173 10.0619 140.468 10.5331 140.833 10.9158C141.188 11.2943 141.614 11.5956 142.087 11.8014C142.56 12.0072 143.069 12.1132 143.584 12.113C144.076 12.1217 144.563 12.0125 145.006 11.7943C145.314 11.6343 145.559 11.4412 145.747 11.2148V11.4326C145.745 11.4921 145.756 11.5513 145.778 11.6062C145.801 11.6612 145.834 11.7106 145.877 11.7512C145.916 11.7913 145.961 11.8232 146.012 11.8452C146.062 11.8671 146.116 11.8787 146.171 11.8792H147.78C147.837 11.8806 147.893 11.8699 147.946 11.8476C147.998 11.8254 148.046 11.7921 148.085 11.75C148.166 11.6649 148.21 11.5508 148.208 11.4326V4.0207C148.21 3.90149 148.167 3.78617 148.087 3.69834C148.049 3.65272 148.002 3.61618 147.948 3.59129C147.895 3.56679 147.838 3.555 147.78 3.55684ZM145.606 8.4907C145.437 8.95456 145.095 9.33232 144.655 9.54269C144.43 9.64997 144.184 9.70423 143.936 9.70141C143.685 9.70141 143.446 9.64727 143.224 9.54146C143.004 9.43906 142.806 9.2934 142.642 9.11285C142.477 8.9323 142.349 8.72044 142.266 8.48947C142.175 8.24565 142.129 7.98721 142.129 7.72663C142.129 7.44979 142.174 7.19018 142.264 6.94903C142.353 6.71894 142.481 6.50855 142.645 6.32891C142.812 6.15296 143.008 6.00901 143.224 5.90812C143.447 5.8023 143.69 5.74817 143.936 5.7494C144.199 5.7494 144.438 5.80353 144.655 5.90935C144.874 6.01393 145.066 6.15542 145.226 6.32891C145.388 6.50486 145.517 6.71402 145.606 6.94903C145.796 7.44486 145.796 7.99486 145.606 8.4907ZM156.622 9.40119L155.699 8.67157C155.522 8.52638 155.355 8.48701 155.21 8.54853C155.079 8.60436 154.964 8.69079 154.872 8.80076C154.673 9.05649 154.434 9.27863 154.167 9.45902C153.934 9.60913 153.629 9.68418 153.269 9.68418C153.004 9.68418 152.76 9.63496 152.542 9.53407C152.327 9.43495 152.134 9.2917 151.975 9.11328C151.812 8.93013 151.686 8.71715 151.602 8.48578C151.515 8.24262 151.471 7.98546 151.474 7.72663C151.474 7.4461 151.515 7.18772 151.602 6.94903C151.687 6.71279 151.811 6.50239 151.975 6.33014C152.138 6.15296 152.332 6.01024 152.546 5.90935C152.772 5.80107 153.019 5.74694 153.269 5.7494C153.629 5.7494 153.931 5.82814 154.167 5.97948C154.406 6.13451 154.646 6.35598 154.873 6.63651C154.968 6.7497 155.079 6.83337 155.21 6.88997C155.358 6.94903 155.523 6.90965 155.695 6.7657L156.618 6.03485C156.732 5.95424 156.817 5.83809 156.861 5.70387C156.886 5.63045 156.896 5.55227 156.889 5.47473C156.882 5.39719 156.858 5.32214 156.82 5.25478C156.464 4.67928 155.973 4.20275 155.391 3.86813C154.781 3.51009 154.05 3.32553 153.232 3.32553C152.668 3.32238 152.109 3.43311 151.588 3.65129C151.066 3.86947 150.593 4.19076 150.194 4.59652C149.805 4.99271 149.497 5.4701 149.29 5.99547C149.07 6.54494 148.957 7.13314 148.96 7.72663C148.96 8.33567 149.072 8.91765 149.29 9.45164C149.5 9.97332 149.807 10.4458 150.194 10.8395C150.593 11.2451 151.067 11.5663 151.588 11.7846C152.11 12.003 152.668 12.1142 153.232 12.1117C154.05 12.1117 154.781 11.9284 155.391 11.5654C155.976 11.232 156.468 10.7537 156.822 10.1751C156.86 10.1101 156.882 10.0374 156.889 9.96225C156.896 9.88643 156.886 9.80992 156.861 9.73832C156.813 9.60626 156.731 9.49007 156.622 9.40242V9.40119ZM165.194 11.1299L162.647 7.26277L164.827 4.29138C164.941 4.12036 164.971 3.95672 164.918 3.80292C164.88 3.69219 164.777 3.55684 164.514 3.55684H162.789C162.69 3.55775 162.593 3.58219 162.506 3.62821C162.398 3.68359 162.309 3.77173 162.253 3.88043L160.511 6.39904H160.089V0.447649C160.091 0.329229 160.048 0.214475 159.969 0.127748C159.929 0.0869473 159.881 0.0547186 159.828 0.0329554C159.776 0.0111921 159.719 0.000333517 159.663 0.00101762H158.051C157.964 0.00131009 157.88 0.0270233 157.807 0.0750545C157.735 0.123086 157.678 0.191382 157.643 0.271703C157.62 0.327334 157.608 0.387308 157.61 0.447649V11.4313C157.61 11.5581 157.656 11.6688 157.743 11.75C157.783 11.7911 157.831 11.8236 157.884 11.8456C157.937 11.8676 157.993 11.8786 158.051 11.878H159.664C159.721 11.8798 159.777 11.8692 159.83 11.8469C159.882 11.8246 159.929 11.7912 159.968 11.7488C160.007 11.7068 160.038 11.657 160.058 11.6024C160.08 11.5477 160.09 11.489 160.087 11.4301V8.52392H160.555L162.456 11.5335C162.592 11.7635 162.779 11.8792 163.013 11.8792H164.817C165.091 11.8792 165.205 11.7439 165.251 11.6307C165.316 11.4707 165.297 11.3083 165.194 11.1311V11.1299ZM125.015 3.55684H123.213C123.146 3.55424 123.079 3.56628 123.017 3.59218C122.954 3.61807 122.898 3.6572 122.852 3.70695C122.774 3.79331 122.72 3.89895 122.695 4.01332L121.365 9.14035H121.041L119.61 4.01332C119.586 3.90347 119.539 3.79998 119.473 3.70941C119.435 3.66072 119.386 3.62162 119.331 3.59516C119.276 3.5687 119.215 3.55559 119.154 3.55684H117.285C117.044 3.55684 116.892 3.63805 116.835 3.79431C116.786 3.94184 116.785 4.10149 116.832 4.24955L119.116 11.4658C119.152 11.5802 119.213 11.675 119.292 11.7512C119.337 11.7944 119.391 11.828 119.449 11.8499C119.507 11.8719 119.57 11.8818 119.632 11.8792H120.598L120.518 12.113L120.288 12.786C120.225 12.9927 120.103 13.1754 119.937 13.3101C119.784 13.4312 119.595 13.4954 119.402 13.4922C119.234 13.4914 119.069 13.4536 118.918 13.3815C118.768 13.312 118.625 13.2257 118.494 13.1243C118.375 13.0381 118.234 12.9889 118.089 12.9829H118.069C117.912 12.9829 117.775 13.0739 117.665 13.2486L117.091 14.1197C116.858 14.4938 116.987 14.7399 117.139 14.8764C117.422 15.152 117.778 15.3673 118.198 15.5211C118.614 15.6749 119.073 15.75 119.56 15.75C120.386 15.75 121.076 15.5199 121.605 15.0548C122.131 14.5922 122.52 13.9635 122.757 13.1797L125.405 4.24955C125.465 4.05884 125.465 3.90012 125.411 3.77093C125.366 3.6725 125.26 3.55684 125.015 3.55684Z"\n  fill="#838383"\n/>\n</svg>\n',w='\n  <button type="button" id="apple-pay-close-button">\n    <svg width="10" height="9" fill="none" xmlns="http://www.w3.org/2000/svg">\n      <path\n        d="M5.572 4.033L8.89.71a.4.4 0 0 0-.566-.566L5.003 3.459 1.681.145a.4.4 0 0 0-.566.566L4.44 4.033\n      1.115 7.354a.398.398 0 0 0 0 .566.4.4 0 0 0 .566 0l3.322-3.33 3.322 3.33a.4.4 0 0 0 .566-.566L5.57 4.033z"\n        fill="white"\n      />\n    </svg>\n  </button>\n',x='\n<svg width="74" height="19" viewBox="0 0 74 19" fill="none" xmlns="http://www.w3.org/2000/svg" id="vault-logo">\n  <g clip-path="url(#clip0_9910_9664)">\n    <path\n      d="M32.1273 15.8163H28.9432C28.6448 15.8163 28.4481 15.6622 28.3497 15.3507L25.1886 6.20188C25.1165 6.01825 25.1296 5.85101 25.2214 5.70345C25.3132 5.55589 25.451 5.48047 25.6346 5.48047H27.9693C28.2513 5.48047 28.435 5.63787 28.5202 5.94611L30.6648 12.9077L32.5536 5.94611C32.6388 5.63459 32.829 5.48047 33.1274 5.48047H35.4195C35.6031 5.48047 35.7441 5.55589 35.8425 5.70345C35.9409 5.85101 35.954 6.01825 35.8851 6.20188L32.7241 15.3507C32.6257 15.6622 32.4257 15.8163 32.1305 15.8163H32.1273Z"\n      fill="#343C43" />\n    <path\n      d="M37.6361 14.5842C36.6097 13.5644 36.0981 12.2495 36.0981 10.6362C36.0981 9.02283 36.6097 7.71118 37.6361 6.69792C38.6624 5.68795 39.8757 5.17969 41.2759 5.17969C41.9416 5.17969 42.5384 5.31085 43.0696 5.57318C43.6008 5.83551 43.9943 6.16998 44.2468 6.57988V5.94373C44.2468 5.81584 44.2927 5.70763 44.3845 5.61581C44.4763 5.524 44.578 5.47809 44.6927 5.47809H46.8373C46.9652 5.47809 47.0701 5.524 47.1554 5.61581C47.2406 5.70763 47.2833 5.81584 47.2833 5.94373V15.3679C47.2833 15.4958 47.2406 15.6008 47.1554 15.686C47.0701 15.7713 46.9652 15.8139 46.8373 15.8139H44.6927C44.578 15.8139 44.4763 15.7713 44.3845 15.686C44.2927 15.6008 44.2468 15.4958 44.2468 15.3679V14.7088C43.991 15.1187 43.6008 15.4565 43.0696 15.7155C42.5384 15.9779 41.935 16.109 41.2562 16.109C39.8691 16.109 38.6624 15.6008 37.6361 14.581V14.5842ZM39.9151 8.79985C39.433 9.31795 39.1936 9.93443 39.1936 10.6558C39.1936 11.3772 39.433 11.997 39.9151 12.5118C40.3971 13.0299 40.9972 13.2857 41.7186 13.2857C42.44 13.2857 43.0401 13.0266 43.5221 12.5118C44.0041 11.997 44.2435 11.3772 44.2435 10.6558C44.2435 9.93443 44.0041 9.31467 43.5221 8.79985C43.0401 8.28502 42.44 8.02597 41.7186 8.02597C40.9972 8.02597 40.3938 8.28502 39.9151 8.79985Z"\n      fill="#343C43" />\n    <path\n      d="M51.6315 5.9016V11.2302C51.6315 11.9385 51.8086 12.4959 52.1627 12.9058C52.5169 13.3157 53.0415 13.5223 53.7334 13.5223C54.4253 13.5223 54.9401 13.319 55.3139 12.9058C55.6878 12.4959 55.878 11.9516 55.878 11.2728V5.9016C55.878 5.78683 55.9239 5.68845 56.0157 5.60319C56.1075 5.51794 56.2092 5.47531 56.3239 5.47531H58.4685C58.6095 5.47531 58.7242 5.52122 58.8095 5.61303C58.8948 5.70485 58.9374 5.81306 58.9374 5.94094V15.3652C58.9374 15.4931 58.8948 15.598 58.8095 15.6832C58.7242 15.7685 58.6128 15.8111 58.4685 15.8111H56.3239C56.196 15.8111 56.0911 15.7718 56.0058 15.6931C55.9206 15.6144 55.878 15.5127 55.878 15.3848V14.7257C55.1139 15.6472 54.081 16.1062 52.7792 16.1062C51.4774 16.1062 50.4707 15.7062 49.7132 14.9061C48.9557 14.106 48.5786 13.0501 48.5786 11.7319V5.89504C48.5786 5.78027 48.6278 5.68189 48.7262 5.59664C48.8246 5.51138 48.9295 5.46875 49.0442 5.46875H51.1658C51.2937 5.46875 51.4019 5.51138 51.4938 5.59664C51.5856 5.68189 51.6315 5.78027 51.6315 5.89504V5.9016Z"\n      fill="#343C43" />\n    <path\n      d="M62.9872 15.8148C62.0658 15.8148 61.387 15.582 60.9509 15.113C60.5115 14.6474 60.2917 14.0178 60.2917 13.2243V1.42267C60.2917 1.29478 60.3344 1.18657 60.4196 1.09475C60.5049 1.00294 60.6164 0.957031 60.7607 0.957031H62.8823C63.0233 0.957031 63.138 1.00294 63.2233 1.09475C63.3085 1.18657 63.3512 1.29478 63.3512 1.42267V12.6078C63.3512 12.8045 63.4069 12.9652 63.5217 13.0865C63.6332 13.2079 63.7906 13.2669 63.9873 13.2669H64.6464C64.9448 13.2669 65.0924 13.4144 65.0924 13.7129V15.2409C65.0924 15.6246 64.8956 15.8148 64.4989 15.8148H62.9905H62.9872Z"\n      fill="#343C43" />\n    <path\n      d="M66.722 12.7378V8.04861H65.3644C65.2365 8.04861 65.1316 8.00271 65.0463 7.91089C64.9611 7.81907 64.9185 7.71086 64.9185 7.58298V5.94997C64.9185 5.82208 64.9611 5.71387 65.0463 5.62206C65.1316 5.53024 65.2365 5.48433 65.3644 5.48433H66.722V2.74626C66.722 2.60526 66.7679 2.49049 66.8597 2.40523C66.9515 2.31997 67.0597 2.27734 67.1876 2.27734H69.3518C69.4666 2.27734 69.5683 2.31997 69.6601 2.40523C69.7519 2.49049 69.7978 2.60198 69.7978 2.74626V5.48433H72.7064C72.8343 5.48433 72.9458 5.53024 73.0474 5.62206C73.1458 5.71387 73.195 5.82208 73.195 5.94997V7.58298C73.195 7.69775 73.1458 7.80268 73.0474 7.90105C72.949 7.99943 72.8343 8.04861 72.7064 8.04861H69.7978V12.0164C69.7978 12.4689 69.9027 12.7804 70.1159 12.9509C70.329 13.1214 70.5684 13.2067 70.8373 13.2067C71.1193 13.2067 71.4308 13.1083 71.7718 12.9083C72.1555 12.6689 72.4441 12.6951 72.6408 12.9935L73.3852 14.1806C73.5557 14.4495 73.5327 14.7052 73.3229 14.9446C72.6146 15.6792 71.5948 16.0497 70.2667 16.0497C69.2764 16.0497 68.437 15.7742 67.7516 15.2234C67.0663 14.6725 66.722 13.8428 66.722 12.741V12.7378Z"\n      fill="#343C43" />\n    <path\n      d="M15.2266 0H4.43496C2.26089 0 0.5 1.76089 0.5 3.93496V14.7266C0.5 16.9006 2.26089 18.6615 4.43496 18.6615H15.2266C17.4006 18.6615 19.1615 16.9006 19.1615 14.7266V3.93496C19.1615 1.76089 17.4006 0 15.2266 0ZM15.079 12.2312L12.1442 14.6118C11.9114 14.8086 11.5507 14.6807 11.4949 14.379L10.8161 11.8934C10.7702 11.6934 10.8489 11.4868 11.0096 11.3589C11.4425 11.0113 11.7179 10.4801 11.7179 9.8833C11.7179 8.44048 10.098 7.37476 8.5765 8.40113C8.48468 8.46344 8.40598 8.54214 8.34368 8.63723C7.63539 9.68983 7.92723 10.7883 8.65192 11.3655C8.8126 11.4934 8.88474 11.6967 8.84211 11.8967L8.22891 14.3823C8.17317 14.6839 7.81246 14.8118 7.57964 14.6151L4.57924 12.2344C4.47431 12.1262 4.41856 11.9787 4.4284 11.8278L4.77271 6.69271C4.78582 6.49268 4.91371 6.31561 5.09734 6.23691L9.41924 4.03661C9.68157 3.9284 9.97341 3.9284 10.2357 4.03661L14.5576 6.23691C14.7445 6.31561 14.8691 6.49268 14.8855 6.69271L15.2299 11.8278C15.2397 11.9787 15.1839 12.1262 15.079 12.2344V12.2312Z"\n      fill="#343C43" />\n  </g>\n  <defs>\n    <clipPath id="clip0_9910_9664">\n      <rect width="73" height="18.6615" fill="white" transform="translate(0.5)" />\n    </clipPath>\n  </defs>\n</svg>\n';var M={height:"50px",width:"auto",borderRadius:"3px",padding:"10px",locale:"en",type:"pay"},V=function(n){return n&&"object"===t(n)?Object.keys(M).reduce((function(t,a){return e(e({},t),{},r({},a,n[a]||M[a]))}),{}):M},P='\n  .pre-checkout-modal {\n    display: none;\n    position: fixed;\n    z-index: 1;\n    left: 0;\n    top: 0;\n    width: 100vw;\n    height: 100%;\n    overflow: auto;\n    background-color: rgba(0, 0, 0, 0.75);\n    transition: all 0.2s ease;\n  }\n\n  .pre-checkout-modal.show {\n    display: block;\n  }\n\n  .pre-checkout-modal__content {\n    position: absolute;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    margin-left: auto;\n    margin-right: auto;\n    background-color: #fefefe;\n    padding: 20px;\n    padding-bottom: max(30px, env(safe-area-inset-bottom));\n    width: 100%;\n    border-radius: 6px 6px 0 0;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    max-width: 350px;\n\n    box-sizing: border-box;\n    transform: translateY(238px);\n    transition: transform 0.3s cubic-bezier(.16,.81,.32,1);\n  }\n\n  .modal-wrapper {\n    width: 100%;\n  }\n\n  .payment-info {\n    position: relative;\n    padding-bottom: 15px;\n    border-bottom: solid 1px whitesmoke;\n    display: flex;\n    align-items: flex-start;\n    justify-content: space-between;\n    width: 100%;\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",\n      "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;\n  }\n\n  .customer-email {\n    color: #737373;\n    font-size: 13px;\n    line-height: 16px;\n  }\n\n  .customer-info {\n    flex: 1;\n    text-align: right;\n  }\n\n  .merchant-logo {\n    display: flex;\n    align-items: center;\n    height: 30px;\n  }\n  .transaction-amount {\n    margin-top: 5px;\n    font-size: 13px;\n    line-height: 16px;\n    color: #737373;\n  }\n\n  .amount {\n    color: #29b263;\n    font-weight: bold;\n  }\n\n  @media only screen and (min-width: 500px) {\n    .pre-checkout-modal__content {\n      bottom: 0;\n      top: 0;\n      margin: auto;\n      border-radius: 6px;\n      height: fit-content;\n    }\n  }\n\n  .pre-checkout-modal__content.show {\n    transform: translateY(0);\n    margin: 0 auto;\n    margin-top: 100px;\n  }\n\n  .pre-checkout-modal__content > * {\n    margin-top: 0;\n    margin-bottom: 40px;\n  }\n  .pre-checkout-modal__content > *:last-child {\n    margin-bottom: 0;\n  }\n\n  .pre-checkout-modal__content svg {\n    margin: auto;\n    width: 100%;\n  }\n\n  #inline-button-wordmark--white {\n    position: absolute;\n    bottom: -50px;\n    margin: auto;\n    left: 0;\n    right: 0;\n    width: fit-content;\n  }\n\n  #inline-button-wordmark--grey {\n    display: none;\n  }\n\n  .pre-checkout-modal__content #apple-pay-mark--light {\n    margin-bottom: 16px;\n  }\n\n  .pre-checkout-modal p {\n    -webkit-text-size-adjust: 100%;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    text-rendering: optimizeLegibility;\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",\n      "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;\n    color: #4E4E4E;\n    line-height: 140%;\n    font-size: 14px;\n    font-weight: 500;\n    margin: 0;\n    padding: 0 20px;\n    text-align: center;\n    letter-spacing: -0.3px;\n  }\n\n  .pre-checkout-modal button {\n    height: 42px;\n    width: 100%;\n    \n    box-sizing: border-box;\n    border-radius: 3px;\n    font-size: 14px;\n    line-height: 24px;\n    cursor: pointer;\n    -webkit-text-size-adjust: 100%;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    text-rendering: optimizeLegibility;\n    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",\n      "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;\n  }\n\n  .pre-checkout-modal .open-paystack-pop-button {\n    background: #FAFAFA;\n    border: 1px solid #F2F3F3;\n    color: #4E4E4E;\n    font-weight: 500;\n  }\n\n  .pre-checkout-modal .open-paystack-pop-button:hover, \n  .pre-checkout-modal .open-paystack-pop-button:active, \n  .pre-checkout-modal .open-paystack-pop-button:focus {\n    background: #F2F3F3;\n  }\n\n  .pre-checkout-modal .pay-with-vault-button {\n    font-weight: 700;\n    background: #44b669;\n    background: linear-gradient(to bottom, #44b669 0%, #40ad57 100%);\n    border: solid 1px #49a861;\n    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);\n    outline: none;\n    color: white;\n    transition: all 300ms;\n  }\n\n  .pre-checkout-modal .vault-instruction {\n    color: #2f3d4d;\n    font-size: 14px;\n    letter-spacing: normal;\n    line-height: 1.4;\n    margin: 0 auto 24px;\n    padding: 0;\n  }\n  .vault-logo-container {\n    width: 74px;\n    height: 20px;\n    margin: 0 auto 24px\n  }\n  .vault-logo-container img {\n    height: 100%;\n    width: 100%;\n    border-radius: 8px;\n  }\n  .vault-divider {\n    margin-bottom: 16px;\n    margin-top: 24px;\n    position: relative;\n  }\n  .vault-divider__container {\n    align-items: center;\n    bottom: 0;\n    display: flex;\n    left: 0;\n    position: absolute;\n    right: 0;\n    top: 0;\n  }\n  .vault-divider__line {\n    border: 1px dashed #ccced0;\n    width: 100%;\n  }\n  .vault-divider__text-container {\n    display: flex;\n    justify-content: center;\n    position: relative;\n  }\n  .vault-divider__text {\n    background-color: #fff;\n    color: #999da1;\n    font-size: 14px;\n    font-weight: 500;\n    letter-spacing: -.3px;\n    line-height: 19.6px;\n    margin-bottom: 2px;\n    padding: 0 8px;\n  }\n\n  #payment-request-button {\n    width: 100%;\n    height: fit-content;\n    margin: 24px 0 16px 0;\n  }\n\n  #paystackpop-button {\n    padding: 0 16px;\n  }\n\n  #apple-pay-close-button {\n    position: absolute;\n    text-align: center;\n    top: 0;\n    right: -26px;\n    height: 16px;\n    width: 16px;\n    padding: 0;\n    display: inline-block;\n    z-index: 3;\n    border-radius: 50%;\n    background: transparent;\n    transition: all 300ms;\n    outline: none;\n    cursor: pointer;\n    border: none;\n  }\n\n  #apple-pay-close-button svg {\n    width: initial;\n  }\n  \n  #apple-pay-close-button:hover {\n    background-color: #e22b28;\n  }\n\n  @media only screen and (max-width: 500px) {\n    .pre-checkout-modal__content {\n      max-width: 500px;\n      border-radius: 0;\n      padding-bottom: 0;\n    }\n\n    .modal-wrapper {\n      padding: 0;\n    }\n\n    .vault-logo-container {\n      width: 74px;\n      height: 20px;\n    }\n\n    #inline-button-wordmark--white {\n      display: none\n    }\n    \n    #inline-button-wordmark--grey {\n      display: block;\n      width: 100%;\n      margin: 16px 0;\n      height: 13px;\n    }\n\n    #apple-pay-close-button {\n      display: none;\n    }\n  }\n',L=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return Number(parseFloat(n/100).toFixed(2))},_={headers:{accept:"application/json, text/plain, */*","accept-language":"en-GB,en-US;q=0.9,en;q=0.8","content-type":"application/x-www-form-urlencoded","sec-ch-ua-mobile":"?0","sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"cross-site"},referrerPolicy:"no-referrer-when-downgrade",method:"POST",mode:"cors",credentials:"omit"};function S(n){return Object.keys(n).reduce((function(e,t){var a=encodeURIComponent(t),o=encodeURIComponent(n[t]),i="".concat(a,"=").concat(o);return [].concat(l(e),[i])}),[]).join("&")}var E=function(n){return {biannually:"BIANNUAL PLAN",annually:"ANNUAL PLAN"}[n]||"".concat(n.toUpperCase()," PLAN")},A=function(){try{return window.location&&"https:"===window.location.protocol&&window.ApplePaySession&&window.ApplePaySession.supportsVersion(m.applePayVersion)}catch(n){return  false}},T=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];return A()&&n.includes("apple_pay")};function q(){var n=0;return Array.from(document.querySelectorAll("body *")).forEach((function(e){var t=window.getComputedStyle(e),a=parseFloat(t.zIndex);!Number.isNaN(a)&&a>n&&(n=a);})),n}function H(n){var e=document.createElement("iframe");return e.setAttribute("frameBorder","0"),e.setAttribute("allowtransparency","true"),e.id=n,e.style.display="none",e}function I(n){return n.querySelector("apple-pay-button")||n.querySelector("#apple-pay-button")}function z(n){return document.querySelector("#".concat(n))}function O(n,e,a){var o=e.channels,i=void 0===o?[]:o,r=e.styles,c=void 0===r?{}:r,s={applePay:false};return new Promise((function(e,o){if(n)if(T(i)){if(I(n))return s.applePay=true,void e(s);(function(n,e){var t=e.container,a=e.integrity;return new Promise((function(e,o){var i=document.createElement("script");i.src=n,i.crossOrigin="anonymous",a&&(i.integrity=a),i.addEventListener("load",(function(){e(true);})),i.addEventListener("error",(function(){i.remove(),o(false);})),t?t.appendChild(i):document.head.appendChild(i);}))})("https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js",{container:n,integrity:"sha384-z/6BVHCcSypLSykOVpaT1PQWHOOgU45uOOlMkgi/bElX4yFqmChNMb7qiv80wFav"}).then((function(){if(a&&1077497!==a&&window&&!Array.isArray(window.webpackJsonp))throw new Error("Incorrect data type for 'webpackJsonp', expected array, got ".concat(t(window.webpackJsonp),". Switching to fallback apple pay button"));!function(n,e){var t,a,o,i,r,c=e.styles,s=e.theme,l=document.createElement("style"),p=(a=(t=c).height,o=t.width,i=t.borderRadius,r=t.padding,"\n  apple-pay-button {\n    --apple-pay-button-width: ".concat(o,";\n    --apple-pay-button-height: ").concat(a,";\n    --apple-pay-button-border-radius: ").concat(i,";\n    --apple-pay-button-padding: ").concat(r,";\n    --apple-pay-button-box-sizing: border-box;\n    width: ").concat(o,";\n  }\n"));l.type="text/css",l.styleSheet?l.styleSheet.cssText=p:l.appendChild(document.createTextNode(p)),n.appendChild(l);var u=document.createElement("apple-pay-button");u.setAttribute("buttonstyle","light"===s?"white":"black"),u.setAttribute("type",c.type),u.setAttribute("locale",c.locale),n.appendChild(u);}(n,{styles:V(c.applePay),theme:c.theme}),s.applePay=true,e(s);})).catch((function(){!function(n,e){var t,a,o,i,r,c,s,l=e.styles,p=e.theme,u=document.createElement("style"),d=(a=(t=l).height,o=t.width,i=t.borderRadius,r=t.padding,c=t.type,s=t.locale,"\n  @supports (-webkit-appearance: -apple-pay-button) { \n    .apple-pay-button {\n        display: inline-block;\n        -webkit-appearance: -apple-pay-button;\n        width: ".concat(o,";\n        height: ").concat(a,";\n        border-radius: ").concat(i,";\n        padding: ").concat(r,";\n        -apple-pay-button-type: ").concat(c,";\n        -webkit-locale: ").concat(s,";\n    }\n    .apple-pay-button-black {\n        -apple-pay-button-style: black;\n    }\n    .apple-pay-button-white {\n        -apple-pay-button-style: white;\n    }\n    .apple-pay-button-white-with-line {\n        -apple-pay-button-style: white-outline;\n    }\n  }\n\n  @supports not (-webkit-appearance: -apple-pay-button) {\n    .apple-pay-button {\n        display: inline-block;\n        background-size: 100% 60%;\n        background-repeat: no-repeat;\n        background-position: 50% 50%;\n        border-radius: 5px;\n        padding: 0px;\n        box-sizing: border-box;\n        min-width: 200px;\n        min-height: 32px;\n        max-height: 64px;\n    }\n    .apple-pay-button-black {\n        background-image: -webkit-named-image(apple-pay-logo-white);\n        background-color: black;\n    }\n    .apple-pay-button-white {\n        background-image: -webkit-named-image(apple-pay-logo-black);\n        background-color: white;\n    }\n    .apple-pay-button-white-with-line {\n        background-image: -webkit-named-image(apple-pay-logo-black);\n        background-color: white;\n        border: .5px solid black;\n    }\n  }\n"));u.type="text/css",u.styleSheet?u.styleSheet.cssText=d:u.appendChild(document.createTextNode(d)),n.appendChild(u);var h=document.createElement("button");h.classList.add("apple-pay-button","light"===p?"apple-pay-button-white":"apple-pay-button-black"),h.id="apple-pay-button";var C=document.createElement("span");C.classList.add("logo"),h.appendChild(C),n.appendChild(h);}(n,{styles:V(c.applePay),theme:c.theme}),s.applePay=true,e(s);}));}else o("No wallet payment method is available on this device");else o("Container to mount elements was not provided");}))}function j(n){for(;n.firstChild;)n.removeChild(n.firstChild);}var N="payment-request-button",U="paystackpop-button",F="pay-with-vault-button";function Z(n){var e=document.createElement("button");return e.id=U,e.className="open-paystack-pop-button",e.innerText=n,e}function B(n){return n.querySelector("#".concat(U))}function R(){var n=document.createElement("div");return n.id=N,n}function D(n){return n.querySelector("#".concat(N))}function W(){var n=document.createElement("button");return n.className="pay-with-vault-button",n.id=F,n.innerText="Pay with Vault",n}function J(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=document.createElement("div");t.className="vault-logo-container",t.innerHTML=x,n.appendChild(t);var a=document.createElement("p");a.id="instruction",a.className="vault-instruction",a.innerHTML="Access your saved cards and bank details for faster, more secure payments",n.appendChild(a);var o=W();n.appendChild(o);var i=document.createElement("div");if(i.className="vault-divider",i.innerHTML='<div id="vault-divider" class="vault-divider__container"><div class="vault-divider__line"></div></div><div class="vault-divider__text-container"><span class="vault-divider__text">or</span></div>',n.appendChild(i),e.canPayWithApplePay){var r=R();n.appendChild(r);}var c=Z("Use other payment methods");n.appendChild(c);}function K(n){var e=document.createElement("div");e.innerHTML='\n  <svg width="51" height="32" viewBox="0 0 51 32" fill="none" xmlns="http://www.w3.org/2000/svg" id="apple-pay-mark--light">\n    <g>\n    <path d="M46.0162 0H4.98386C4.81297 0 4.64177 0 4.47118 0.000996555C4.32698 0.00202331 4.18311 0.00362383 4.03925 0.00754966C3.72548 0.0160355 3.40903 0.0345472 3.09919 0.0902335C2.7844 0.146886 2.49148 0.239294 2.20571 0.384791C1.92477 0.52766 1.66757 0.71453 1.44468 0.937516C1.22169 1.1605 1.03482 1.41728 0.891977 1.69852C0.74645 1.98429 0.653982 2.27731 0.597722 2.59234C0.541737 2.90227 0.523101 3.21866 0.514645 3.53209C0.51078 3.67596 0.509122 3.81982 0.508183 3.96366C0.507186 4.13461 0.507519 4.30545 0.507519 4.4767V27.5236C0.507519 27.6949 0.507186 27.8654 0.508183 28.0367C0.509122 28.1805 0.51078 28.3244 0.514645 28.4683C0.523101 28.7814 0.541737 29.0978 0.597722 29.4077C0.653982 29.7228 0.74645 30.0157 0.891977 30.3015C1.03482 30.5827 1.22169 30.8399 1.44468 31.0625C1.66757 31.2859 1.92477 31.4727 2.20571 31.6152C2.49148 31.7611 2.7844 31.8535 3.09919 31.9102C3.40903 31.9655 3.72548 31.9843 4.03925 31.9928C4.18311 31.9961 4.32698 31.998 4.47118 31.9987C4.64177 32 4.81297 32 4.98386 32H46.0162C46.1868 32 46.358 32 46.5286 31.9987C46.6724 31.998 46.8163 31.9961 46.9608 31.9928C47.2739 31.9843 47.5903 31.9655 47.9009 31.9102C48.2153 31.8535 48.5083 31.7611 48.7941 31.6152C49.0753 31.4727 49.3317 31.2859 49.5551 31.0625C49.7777 30.8399 49.9646 30.5827 50.1078 30.3015C50.2537 30.0157 50.346 29.7228 50.402 29.4077C50.458 29.0978 50.4762 28.7814 50.4847 28.4683C50.4886 28.3244 50.4906 28.1805 50.4912 28.0367C50.4925 27.8654 50.4926 27.6949 50.4926 27.5236V4.4767C50.4926 4.30545 50.4925 4.13461 50.4912 3.96366C50.4906 3.81982 50.4886 3.67596 50.4847 3.53209C50.4762 3.21866 50.458 2.90227 50.402 2.59234C50.346 2.27731 50.2537 1.98429 50.1078 1.69852C49.9646 1.41728 49.7777 1.1605 49.5551 0.937516C49.3317 0.71453 49.0753 0.52766 48.7941 0.384791C48.5083 0.239294 48.2153 0.146886 47.9009 0.0902335C47.5903 0.0345472 47.2739 0.0160355 46.9608 0.00754966C46.8163 0.00362383 46.6724 0.00202331 46.5286 0.000996555C46.358 0 46.1868 0 46.0162 0Z" fill="black"/>\n    <path d="M46.0162 1.06662L46.521 1.06759C46.6577 1.06855 46.7945 1.07003 46.932 1.07378C47.1711 1.08024 47.4509 1.09319 47.7117 1.13994C47.9384 1.18077 48.1285 1.24286 48.311 1.33575C48.4911 1.42728 48.6562 1.54723 48.8003 1.69113C48.9449 1.83599 49.065 2.0013 49.1578 2.18343C49.2501 2.36447 49.3118 2.55369 49.3524 2.78205C49.3991 3.04001 49.412 3.32055 49.4185 3.56121C49.4222 3.69704 49.424 3.83287 49.4247 3.97194C49.426 4.14012 49.4259 4.3082 49.4259 4.47671V27.5236C49.4259 27.6921 49.426 27.8599 49.4246 28.0317C49.424 28.1675 49.4222 28.3033 49.4185 28.4394C49.4119 28.6797 49.3991 28.9601 49.3519 29.2211C49.3118 29.4463 49.2502 29.6356 49.1573 29.8175C49.0648 29.9992 48.9449 30.1643 48.8009 30.3083C48.656 30.4532 48.4915 30.5728 48.3092 30.6652C48.1281 30.7576 47.9383 30.8197 47.7138 30.8601C47.4477 30.9075 47.1562 30.9205 46.9367 30.9265C46.7986 30.9296 46.6611 30.9315 46.5203 30.9321C46.3525 30.9334 46.1841 30.9334 46.0162 30.9334H4.98386C4.98162 30.9334 4.97945 30.9334 4.97718 30.9334C4.81127 30.9334 4.64503 30.9334 4.4761 30.9321C4.33836 30.9315 4.20093 30.9296 4.06805 30.9266C3.8435 30.9205 3.55181 30.9075 3.2879 30.8604C3.06151 30.8197 2.87171 30.7576 2.68822 30.664C2.50766 30.5724 2.34329 30.453 2.19831 30.3077C2.05444 30.1641 1.93488 29.9995 1.84245 29.8176C1.74992 29.6358 1.68801 29.446 1.64731 29.218C1.60025 28.9576 1.58733 28.6783 1.58087 28.4396C1.57718 28.303 1.57564 28.1664 1.57476 28.0305L1.5741 27.6295L1.57413 27.5236V4.47671L1.5741 4.37083L1.57473 3.97067C1.57564 3.83402 1.57718 3.6974 1.58087 3.56088C1.58733 3.32197 1.60025 3.04258 1.64769 2.77991C1.68804 2.55405 1.74992 2.36422 1.84293 2.18155C1.93464 2.001 2.05441 1.83617 2.19903 1.69158C2.34308 1.54747 2.50799 1.42767 2.6897 1.33527C2.87122 1.24283 3.06138 1.18077 3.28778 1.14003C3.54864 1.09316 3.82861 1.08024 4.06839 1.07375C4.20507 1.07003 4.34174 1.06855 4.4774 1.06762L4.98386 1.06662H46.0162Z" fill="white"/>\n    <path d="M14.1531 10.7629C14.5811 10.2276 14.8715 9.50886 14.7949 8.77435C14.1684 8.80551 13.4038 9.18768 12.9612 9.72342C12.5638 10.1822 12.212 10.9311 12.3037 11.6348C13.007 11.6958 13.7097 11.2832 14.1531 10.7629Z" fill="black"/>\n    <path d="M14.7869 11.7722C13.7655 11.7114 12.8972 12.3519 12.4094 12.3519C11.9214 12.3519 11.1745 11.8029 10.3667 11.8177C9.31521 11.8331 8.33959 12.4276 7.80602 13.3731C6.70857 15.2646 7.51641 18.0704 8.58362 19.611C9.10188 20.3731 9.72648 21.2123 10.5495 21.1822C11.3271 21.1517 11.6319 20.6787 12.5771 20.6787C13.5216 20.6787 13.7961 21.1822 14.6192 21.1669C15.4729 21.1516 16.0065 20.4044 16.5248 19.6415C17.1193 18.7727 17.3627 17.9338 17.378 17.8877C17.3627 17.8725 15.732 17.2469 15.7169 15.3711C15.7015 13.8004 16.9972 13.0534 17.0581 13.007C16.3265 11.9249 15.1832 11.8029 14.7869 11.7722Z" fill="black"/>\n    <path d="M23.68 9.64661C25.8999 9.64661 27.4457 11.1768 27.4457 13.4046C27.4457 15.6404 25.8681 17.1786 23.6244 17.1786H21.1665V21.0872H19.3907V9.64661H23.68V9.64661ZM21.1665 15.688H23.2041C24.7502 15.688 25.6302 14.8556 25.6302 13.4126C25.6302 11.9697 24.7502 11.1451 23.2121 11.1451H21.1665V15.688Z" fill="black"/>\n    <path d="M27.9097 18.7167C27.9097 17.2578 29.0276 16.3619 31.0098 16.2509L33.293 16.1162V15.474C33.293 14.5464 32.6666 13.9914 31.6203 13.9914C30.629 13.9914 30.0106 14.467 29.8601 15.2124H28.2428C28.3379 13.7059 29.6222 12.5959 31.6836 12.5959C33.7053 12.5959 34.9976 13.6663 34.9976 15.3392V21.0872H33.3563V19.7156H33.3169C32.8333 20.6433 31.7787 21.2299 30.6847 21.2299C29.0514 21.2299 27.9097 20.2151 27.9097 18.7167ZM33.293 17.9635V17.3055L31.2395 17.4323C30.2167 17.5037 29.6381 17.9556 29.6381 18.6691C29.6381 19.3985 30.2406 19.8742 31.1603 19.8742C32.3574 19.8742 33.293 19.0496 33.293 17.9635Z" fill="black"/>\n    <path d="M36.547 24.1556V22.768C36.6736 22.7997 36.959 22.7997 37.1018 22.7997C37.8946 22.7997 38.3228 22.4668 38.5843 21.6105C38.5843 21.5946 38.7351 21.1031 38.7351 21.0952L35.7224 12.7466H37.5774L39.6866 19.5333H39.7181L41.8273 12.7466H43.6349L40.5109 21.5232C39.7976 23.5451 38.973 24.1952 37.2447 24.1952C37.1018 24.1952 36.6736 24.1793 36.547 24.1556Z" fill="black"/>\n    </g>\n    <defs>\n    <clipPath id="clip0">\n    <rect width="49.9851" height="32" fill="white" transform="translate(0.507462)"/>\n    </clipPath>\n    </defs>\n  </svg>\n',n.appendChild(e);var t=document.createElement("p");t.id="apple-pay-description",t.innerHTML="Pay with Apple Pay to complete your purchase without filling a form",n.appendChild(t);var a=R();n.appendChild(a);var o=Z("More payment options");n.appendChild(o);}var Q=[{value:"key",required:true,types:["string"]},{value:"amount",required:true,or:["plan","planCode"],types:["string","number"]},{value:"currency",required:false,types:["string"]},{value:"email",required:true,or:["customerCode"],types:["string"]},{value:"label",required:false,types:["string"]},{value:"firstName",required:false,types:["string"]},{value:"lastName",required:false,types:["string"]},{value:"reference",required:false,types:["string"]},{value:"phone",required:false,types:["string"]},{value:"customerCode",required:false,override:"email",types:["string"]},{value:"channels",required:false,types:["array"]},{value:"paymentRequest",required:false,types:["string","number"]},{value:"paymentPage",required:false,types:["string"]},{value:"hash",required:false,types:["string"]},{value:"container",required:false,types:["string"]},{value:"metadata",required:false,types:["object"]},{value:"subaccountCode",required:false,types:["string"]},{value:"bearer",required:false,types:["string"]},{value:"transactionCharge",required:false,types:["string","number"]},{value:"planCode",required:false,override:"amount",types:["string"]},{value:"subscriptionCount",required:false,types:["number"]},{value:"planInterval",required:false,types:["string"]},{value:"subscriptionLimit",required:false,types:["number"]},{value:"subscriptionStartDate",required:false,types:["string"]},{value:"accessCode",required:false,types:["string"]},{value:"onError",required:false,types:["function"]},{value:"onLoad",required:false,types:["function"]},{value:"onSuccess",required:false,types:["function"]},{value:"onCancel",required:false,types:["function"]},{value:"callback",required:false,types:["function"]},{value:"onClose",required:false,types:["function"]},{value:"onBankTransferConfirmationPending",required:false,types:["function"]},{value:"firstname",required:false,types:["string"]},{value:"lastname",required:false,types:["string"]},{value:"customer_code",required:false,types:["string"]},{value:"payment_request",required:false,types:["string","number"]},{value:"subaccount",required:false,types:["string"]},{value:"transaction_charge",required:false,types:["number","string"]},{value:"plan",required:false,types:["string"]},{value:"quantity",required:false,types:["number"]},{value:"interval",required:false,types:["string"]},{value:"invoice_limit",required:false,types:["number","string"]},{value:"start_date",required:false,types:["string"]},{value:"payment_page",required:false,types:["number","string"]},{value:"order_id",required:false,types:["number"]},{value:"ref",required:false,types:["string"]},{value:"card",required:false,types:["string"]},{value:"bank",required:false,types:["string"]},{value:"split",required:false,types:["object"]},{value:"split_code",required:false,types:["string"]},{value:"transaction_type",required:false,types:["string"]},{value:"subscription",required:false,types:["number"]},{value:"language",required:false,types:["string"]},{value:"connect_account",required:false,types:["string"]},{value:"connect_split",required:false,types:["array"]}];function G(n){return (null==n?void 0:n.length)>500?n.split("?")[0]:n}function Y(n){var t,a,o,i,r=e({},n);r.metadata=n.metadata||{},r.metadata.referrer=(t=window.location,a=t.href,o=void 0===a?"":a,i=t.ancestorOrigins,[o].concat(l(void 0===i?[]:i)).map(G).join(",")),r.metadata=JSON.stringify(r.metadata),r.mode="popup",n.split&&"string"!=typeof n.split&&(r.split=JSON.stringify(r.split));return void 0!==r.card&&["false",false].indexOf(r.card)>-1&&(r.channels=["bank"],delete r.card),void 0!==r.bank&&["false",false].indexOf(r.bank)>-1&&(r.channels=["card"],delete r.bank),[{to:"firstname",from:"firstName"},{to:"lastname",from:"lastName"},{to:"customer_code",from:"customerCode"},{to:"payment_request",from:"paymentRequest"},{to:"subaccount",from:"subaccountCode"},{to:"transaction_charge",from:"transactionCharge"},{to:"plan",from:"planCode"},{to:"quantity",from:"subscriptionCount"},{to:"interval",from:"planInterval"},{to:"invoice_limit",from:"subscriptionLimit"},{to:"start_date",from:"subscriptionStartDate"},{to:"ref",from:"reference"}].forEach((function(n){r[n.from]&&(r[n.to]=r[n.from],delete r[n.from]);})),Object.values(n).forEach((function(e,t){if("function"==typeof e){var a=Object.keys(n)[t];delete r[a];}})),r}var X=["iPad Simulator","iPhone Simulator","iPod Simulator","iPad","iPhone","iPod"],$=window&&window.navigator&&(window.navigator.platform||window.navigator.userAgentData&&window.navigator.userAgentData.platform),nn=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=n.platform,t=n.userAgent,a=void 0===t?window&&window.navigator&&window.navigator.userAgent:t,o=e||$;return X.includes(o)||a.includes("Mac")&&"ontouchend"in document},en=function(n,e,t){var a="".concat(m.paystackApiUrl,"transaction/update_log/").concat(n),o={Authorization:"Bearer ".concat(e)};return fetch(a,{method:"POST",body:JSON.stringify({payload:JSON.stringify(t)}),headers:o})},tn=function(n,e){var t="".concat(m.paystackApiUrl,"transaction/set_ip/").concat(n),a={Authorization:"Bearer ".concat(e)};return fetch(t,{method:"POST",headers:a})},an={initializeLog:function(n){var e=n||{},t=e.attempts,a=e.authentication,o=e.errors,i=e.history;this.log={start_time:Math.round(Date.now()/1e3),time_spent:0,attempts:t||0,authentication:a,errors:o||0,success:false,mobile:nn(),input:[],history:i||[]};},getTimeSpent:function(){var n=Math.round(Date.now()/1e3);return this.log.time_spent=n-this.log.start_time,this.log.time_spent},logAPIResponse:function(n,e){switch(n.status){case "success":return this.logApiSuccess(e);case "failed":return this.logApiError(n.message);default:return  false}},logValidationResponse:function(n){return this.log.history.push({type:"action",message:n,time:this.getTimeSpent()}),this.saveLog()},logAttempt:function(n){var e="Attempted to pay";return n&&(e+=" with ".concat(n)),this.log.attempts+=1,this.log.history.push({type:"action",message:e,time:this.getTimeSpent()}),this.saveLog()},logApiError:function(n){var e="Error";return n&&(e+=": ".concat(n)),this.log.errors+=1,this.log.history.push({type:"error",message:e,time:this.getTimeSpent()}),this.saveLog()},logApiSuccess:function(n){var e="Successfully paid";return n&&(e+=" with ".concat(n)),this.log.success=true,this.log.history.push({type:"success",message:e,time:this.getTimeSpent()}),this.saveLog()},saveLog:function(){try{if(this.response)return en(this.id,this.response.merchant_key,this.log)}catch(n){}},saveIpAddress:function(){try{if(this.response)return tn(this.id,this.response.merchant_key)}catch(n){}}},on=["language","connect_account"],rn={requestInline:function(){var n=this,t=this.urlParameters,a=t.language,o=t.connect_account,i=c(t,on),r=e({"Content-Type":"application/json"},a&&{"Accept-Language":a});return (this.accessCode?fetch(new URL("transaction/verify_access_code/".concat(this.accessCode),m.paystackApiUrl).toString(),{headers:r}):fetch(new URL("/checkout/request_inline",m.paystackApiUrl).toString(),{method:"POST",body:JSON.stringify(i),headers:e(e({},r),o&&{"x-connect-account":o})})).then((function(n){return n.json()})).then((function(e){if(false===e.status)throw new Error(e.message);return n.response=e.data,n.id=e.data.id,n.status=e.data.transaction_status,n.accessCode=e.data.access_code,n.log=null,Object.assign(n,an),n.initializeLog(e.data.log),n.saveIpAddress(),e.data}))}},cn=function(){function n(e){a(this,n),function(n){function e(n,e){this.message=n,this.issues=e||[];}if(!n||"object"!==t(n))throw new e("Transaction parameters should be a non-empty object");var a=n;if("accessCode"in a)return {accessCode:a.accessCode};Object.keys(a).forEach((function(n){ void 0!==Q.find((function(e){return e.value===n}))||delete a[n];}));var o=Object.keys(a),i=[];if(Q.filter((function(n){return n.required})).forEach((function(n){var e=!a[n.value],t=n.or?n.or.some((function(n){return a[n]})):null;e&&!t&&i.push({message:"Required parameter missing: ".concat(n.value)});})),o.forEach((function(n){var e=a[n],o=Q.find((function(e){return e.value===n})),r=t(e);"object"===r&&Array.isArray(e)&&(r="array"),o.types.indexOf(r)<=-1&&i.push({message:"Invalid parameter type: ".concat(n),validTypes:o.types});})),o.forEach((function(n){var e=Q.find((function(e){return e.value===n}));e.override&&delete a[e.override];})),i.length)throw new e("Invalid transaction parameters",i)}(e),this.parameters=e,this.urlParameters=Y(e),this.id=null,this.status=null,this.accessCode=e.accessCode||null,this.authorizationUrl=null,this.errors=[],this.response=null,this.isActive=true;var o=e.onError,i=e.onLoad,r=e.onSuccess,c=e.onCancel,s=e.callback,l=e.onClose,p=e.onBankTransferConfirmationPending;this.callbacks={onError:o,onLoad:i,onSuccess:r,onCancel:c,onBankTransferConfirmationPending:p},this.deprecatedCallbacks={callback:s,onClose:l},Object.assign(this,rn);}return i(n,[{key:"onSetupError",value:function(n){this.logError(n),this.callbacks.onError&&this.callbacks.onError(n);}},{key:"onLoad",value:function(n){var e=n.id,t=n.customer,a=n.accessCode;Object.assign(this,{id:e,customer:t,accessCode:a}),this.authorizationUrl="".concat(m.checkoutUrl).concat(a),this.callbacks.onLoad&&this.callbacks.onLoad({id:e,customer:t,accessCode:a});}},{key:"onSuccess",value:function(n){this.isActive=false,this.response=n,this.status=n.status,this.callbacks.onSuccess&&this.callbacks.onSuccess(n),this.deprecatedCallbacks.callback&&this.deprecatedCallbacks.callback(n);}},{key:"setStatus",value:function(n){this.status=n;}},{key:"onCancel",value:function(){this.callbacks.onCancel&&this.callbacks.onCancel(),this.deprecatedCallbacks.onClose&&this.deprecatedCallbacks.onClose();}},{key:"cancel",value:function(){this.isActive=false,this.onCancel();}},{key:"onBankTransferConfirmationPending",value:function(){this.cancel(),this.callbacks.onBankTransferConfirmationPending&&this.callbacks.onBankTransferConfirmationPending();}},{key:"logError",value:function(n){this.errors.push(n);}}]),n}(),sn=console?console.warn||console.log:function(){};function ln(n,e,t){sn('"'.concat(n,'" has been deprecated, please use "').concat(e,'". ').concat(t));}var pn,un=["preload","inlineTransaction","transactionData"],dn=["container","styles","onElementsMount"];function hn(n,e){if(!n.length)return null;var t=n.filter((function(n){var t,a,o,i,r=!n.status||"abandoned"===n.status,c=(t=n.parameters,a=e,o=Object.keys(t).sort().join("")===Object.keys(a).sort().join(""),i=Object.values(t).sort().join("")===Object.values(a).sort().join(""),o&&i);return r&&c}));return t.length?t[t.length-1]:null}function Cn(n){var e=n.checkoutIframe,t=n.urlParameters;e&&t&&e.contentWindow.postMessage({type:"inline:url",path:"newTransaction",params:t},"*");}var mn="trackCheckoutClosed",yn="trackPaymentError",vn="trackPaymentAttempt",fn="trackPaymentCompletion";function gn(n){throw sn(n),new Error(n)}var bn,kn,wn=function(){function n(e){var t,o;a(this,n),this.id=function(){for(var n="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=0;t<5;t+=1)n+=e.charAt(Math.floor(Math.random()*e.length));return n}(),this.transactions=[],this.isOpen=false,this.isLoaded=false,this.isDeprecatedApi=e&&e.isDeprecatedApi,e&&e.isEmbed?this.isEmbed=true:e&&e.isPaymentRequest&&(e.container&&z(e.container)||gn("A container is required to mount the payment request button"),this.paymentRequestContainer=z(e.container),this.paymentRequestTransaction=null),this.preCheckoutModal=null,this.backgroundIframe=function(n){var e=H("inline-background-".concat(n));e.style.cssText="\n  z-index: 999999999999999;\n  background: transparent;\n  background: rgba(0, 0, 0, 0.75);    \n  border: 0px none transparent;\n  overflow-x: hidden;\n  overflow-y: hidden;\n  margin: 0;\n  padding: 0;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n  position: fixed;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  transition: opacity 0.3s;\n  -webkit-transition: opacity 0.3s;\n  visibility: hidden;\n  display: none;\n",document.body.appendChild(e);var t=e.contentWindow.document;return t.open(),t.write('\n  <!DOCTYPE html>\n  <html lang="en">\n\n  <head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <meta http-equiv="X-UA-Compatible" content="ie=edge">\n    <title>Paystack Popup Loader</title>\n    <style>\n      .app-loader {\n        margin: 200px 0;\n        text-align: center;\n        color: white;\n      }      \n      @keyframes app-loader__spinner {\n        0% {\n          opacity: 1;\n        }\n        100% {\n          opacity: 0;\n        }\n      }\n      @-webkit-keyframes app-loader__spinner {\n        0% {\n          opacity: 1;\n        }\n        100% {\n          opacity: 0;\n        }\n      }\n      .app-loader__spinner {\n        position: relative;\n        display: inline-block;\n      }\n      .app-loader__spinner div {\n        left: 95px;\n        top: 35px;\n        position: absolute;\n        -webkit-animation: app-loader__spinner linear 1s infinite;\n        animation: app-loader__spinner linear 1s infinite;\n        background: white;\n        width: 10px;\n        height: 30px;\n        border-radius: 40%;\n        -webkit-transform-origin: 5px 65px;\n        transform-origin: 5px 65px;\n      }\n      .app-loader__spinner div:nth-child(1) {\n        -webkit-transform: rotate(0deg);\n        transform: rotate(0deg);\n        -webkit-animation-delay: -0.916666666666667s;\n        animation-delay: -0.916666666666667s;\n      }\n      .app-loader__spinner div:nth-child(2) {\n        -webkit-transform: rotate(30deg);\n        transform: rotate(30deg);\n        -webkit-animation-delay: -0.833333333333333s;\n        animation-delay: -0.833333333333333s;\n      }\n      .app-loader__spinner div:nth-child(3) {\n        -webkit-transform: rotate(60deg);\n        transform: rotate(60deg);\n        -webkit-animation-delay: -0.75s;\n        animation-delay: -0.75s;\n      }\n      .app-loader__spinner div:nth-child(4) {\n        -webkit-transform: rotate(90deg);\n        transform: rotate(90deg);\n        -webkit-animation-delay: -0.666666666666667s;\n        animation-delay: -0.666666666666667s;\n      }\n      .app-loader__spinner div:nth-child(5) {\n        -webkit-transform: rotate(120deg);\n        transform: rotate(120deg);\n        -webkit-animation-delay: -0.583333333333333s;\n        animation-delay: -0.583333333333333s;\n      }\n      .app-loader__spinner div:nth-child(6) {\n        -webkit-transform: rotate(150deg);\n        transform: rotate(150deg);\n        -webkit-animation-delay: -0.5s;\n        animation-delay: -0.5s;\n      }\n      .app-loader__spinner div:nth-child(7) {\n        -webkit-transform: rotate(180deg);\n        transform: rotate(180deg);\n        -webkit-animation-delay: -0.416666666666667s;\n        animation-delay: -0.416666666666667s;\n      }\n      .app-loader__spinner div:nth-child(8) {\n        -webkit-transform: rotate(210deg);\n        transform: rotate(210deg);\n        -webkit-animation-delay: -0.333333333333333s;\n        animation-delay: -0.333333333333333s;\n      }\n      .app-loader__spinner div:nth-child(9) {\n        -webkit-transform: rotate(240deg);\n        transform: rotate(240deg);\n        -webkit-animation-delay: -0.25s;\n        animation-delay: -0.25s;\n      }\n      .app-loader__spinner div:nth-child(10) {\n        -webkit-transform: rotate(270deg);\n        transform: rotate(270deg);\n        -webkit-animation-delay: -0.166666666666667s;\n        animation-delay: -0.166666666666667s;\n      }\n      .app-loader__spinner div:nth-child(11) {\n        -webkit-transform: rotate(300deg);\n        transform: rotate(300deg);\n        -webkit-animation-delay: -0.083333333333333s;\n        animation-delay: -0.083333333333333s;\n      }\n      .app-loader__spinner div:nth-child(12) {\n        -webkit-transform: rotate(330deg);\n        transform: rotate(330deg);\n        -webkit-animation-delay: 0s;\n        animation-delay: 0s;\n      }\n      .app-loader__spinner {\n        width: 40px;\n        height: 40px;\n        -webkit-transform: translate(-20px, -20px) scale(0.2) translate(20px, 20px);\n        transform: translate(-20px, -20px) scale(0.2) translate(20px, 20px);\n      }\n    </style>\n  </head>\n\n  <body>\n    <div id="app-loader" class="app-loader">\n      <div id="spinner" class="app-loader__spinner">\n        <div></div><div></div><div></div><div></div><div></div><div></div><div>\n        </div><div></div><div></div><div></div><div></div><div></div>\n      </div>\n    </div>\n  </body>\n\n  </html>\n'),t.close(),e}(this.id),this.checkoutIframe=(t=this.id,(o=H("inline-checkout-".concat(t))).src="".concat(m.checkoutUrl,"popup"),o.style.cssText="\n  z-index: 999999999999999;\n  background: transparent;\n  border: 0px none transparent;\n  overflow-x: hidden;\n  overflow-y: hidden;\n  margin: 0;\n  padding: 0;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n  position: fixed;\n  left: 0;\n  top: 0;\n  width: 100%;\n  visibility: hidden;\n  display: none;\n  height: 100%;\n",o.setAttribute("allowpaymentrequest","true"),o.setAttribute("allow","payment; clipboard-read; clipboard-write"),document.body.appendChild(o),o),this.registerListeners();}return i(n,[{key:"registerListeners",value:function(){var n=this;window.addEventListener("message",(function(e){var t="".concat(e.origin,"/")===m.checkoutUrl,a=n.checkoutIframe&&n.checkoutIframe.contentWindow===e.source,o=n.isEmbed;t||a?n.respondToEvent(e):o&&n.respondToEmbedEvents(e);}));}},{key:"sendAnalyticsEventToCheckout",value:function(n,e){this.checkoutIframe.contentWindow.postMessage({type:"analytics",action:n,params:e},"*");}},{key:"checkout",value:function(n){this.activeTransaction()&&this.activeTransaction().cancel(),pn=this;var e=hn(this.transactions,n)||new cn(n);return new Promise((function(n,t){e.requestInline().then((function(t){var a=function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=n.platform,t=n.userAgent,a=void 0===t?window&&window.navigator&&window.navigator.userAgent:t,o=e||$,i=a&&!!a.match(/Version\/[\d.]+.*Safari/),r=o&&/(Mac)/i.test(o);return nn()||r&&i}()&&T(t.channels),o=function(){var n,e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return !(null===(n=t.link_config)||void 0===n||!n.enabled||null===(e=t.link_config)||void 0===e||!e.has_payment_instruments)}(t);o||a?(pn.preloadTransaction({inlineTransaction:e,transactionData:t}),pn.preCheckoutModal=function(n,e){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=document.querySelector("#pre-checkout-modal-".concat(n));if(a){if(B(a)&&D(a))return a;a.remove();}var o=document.createElement("div");o.classList.add("pre-checkout-modal"),o.id="pre-checkout-modal-".concat(n),o.style.zIndex=q()+1;var i=document.createElement("div");i.classList.add("pre-checkout-modal__content"),o.appendChild(i);var r=e||{},c=r.merchant_logo,s=r.merchant_name,l=r.email,p=r.amount,u=r.currency,d=r.label,h=new Intl.NumberFormat("en",{style:"currency",currency:u,currencyDisplay:"code",maximumFractionDigits:2,minimumFractionDigits:0}).format(p/100),C=document.createElement("div");C.classList.add("payment-info"),C.innerHTML='<img class="merchant-logo" src="'.concat(c,'" alt="').concat(s,' Logo">\n    <div class="customer-info">\n      <div class="customer-email">').concat(d||l,'</div>\n      <div class="transaction-amount">Pay <span class="amount">').concat(h,"</span></div>\n    </div>"),i.appendChild(C),i.innerHTML+=w;var m=document.createElement("div");m.classList.add("modal-wrapper"),t.canPayWithVault?J(m,{canPayWithApplePay:t.canPayWithApplePay}):K(m),m.innerHTML=m.innerHTML+b+k,i.appendChild(m);var y=document.createElement("style");return y.textContent=P,document.body.appendChild(y),document.body.appendChild(o),o}(pn.id,t,{canPayWithVault:o,canPayWithApplePay:a}),a?(pn.paymentRequestContainer=D(pn.preCheckoutModal),O(pn.paymentRequestContainer,{channels:t.channels,styles:{applePay:{width:"100%",type:"pay",height:"42px",padding:"15px",borderRadius:"5px"}}},t.merchant_id).then((function(){pn.registerPaymentRequestEventListeners();})).catch((function(){o?D(pn.preCheckoutModal).remove():(pn.closePreCheckoutModal(),pn.animateCheckoutIn());})).finally((function(){n(e);}))):n(e)):(pn.newTransaction({inlineTransaction:e,transactionData:t}),n(e));})).catch((function(n){e.onSetupError({status:false,message:n.message}),t(n);}));}))}},{key:"openPreCheckoutModal",value:function(){var n;this.registerPreCheckoutModalEventListeners(),n=this.preCheckoutModal,new Promise((function(e,t){try{var a=n.querySelector(".pre-checkout-modal__content");n.classList.add("show"),setTimeout((function(){a.classList.add("show"),e(!0);}),50);}catch(n){t(n);}}));}},{key:"registerPreCheckoutModalEventListeners",value:function(){var n,e=this,t=false,a=this.activeTransaction();document.addEventListener("touchstart",(function(e){e.preventDefault(),t||(t=true,n=setTimeout((function(){t=false;}),125));}),true),document.addEventListener("touchend",(function(e){e.target&&e.target.isSameNode(pn.preCheckoutModal)&&t&&(clearTimeout(n),pn.closePreCheckoutModal(),a&&a.cancel()),t=false;}),true);var o=B(this.preCheckoutModal),i=this.preCheckoutModal.querySelector("#".concat(F));o.onclick=function(){e.closePreCheckoutModal(),e.animateCheckoutIn();},i&&(i.onclick=function(){e.closePreCheckoutModal(),e.animateCheckoutIn(),e.checkoutIframe.contentWindow.postMessage({type:"inline:pay-with-vault"},"*");});var r=function(n){return n.querySelector("#apple-pay-close-button")}(this.preCheckoutModal);r.onclick=function(){e.sendAnalyticsEventToCheckout(mn),e.closePreCheckoutModalAndCancelTransaction();};}},{key:"closePreCheckoutModal",value:function(n){var e;this.preCheckoutModal&&("failed"===n?(e=this.preCheckoutModal)&&(e.querySelector("#apple-pay-mark--light").innerHTML='<svg width="50" height="30" viewBox="0 0 21 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="error-icon">\n    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="error" fill-rule="nonzero">\n            <path d="M9.14672,0.47855 L0.14829,15.47855 C-0.0403320234,15.7872042 -0.0475647902,16.1736607 0.129375884,16.4891566 C0.306316558,16.8046526 0.639843999,16.9999993 1.00157,17 L19.43546,17 C19.797186,16.9999993 20.1307134,16.8046526 20.3076541,16.4891566 C20.4845948,16.1736607 20.477362,15.7872042 20.28874,15.47855 L10.85328,0.47855 C10.671624,0.181297031 10.3483651,3.00996351e-06 10,3.00996351e-06 C9.6516349,3.00996351e-06 9.32837603,0.181297031 9.14672,0.47855 Z" id="Shape" fill="#FFAA22"></path>\n            <rect id="Rectangle-path" fill="#FFFFFF" x="9" y="6" width="2" height="5"></rect>\n            <rect id="Rectangle-path" fill="#FFFFFF" x="9" y="12" width="2" height="2"></rect>\n        </g>\n    </g>\n</svg>',e.querySelector("#apple-pay-description").textContent="An error occurred while paying with Apple Pay. Please try again or use another payment method."):(!function(n){n&&(n.querySelector(".pre-checkout-modal__content").classList.remove("show"),n.classList.remove("show"));}(this.preCheckoutModal),this.preCheckoutModal.remove(),this.preCheckoutModal=null));}},{key:"closePreCheckoutModalAndCancelTransaction",value:function(){this.preCheckoutModal&&(this.cancelTransaction(),this.checkoutIframe&&this.checkoutIframe.contentWindow&&this.checkoutIframe.contentWindow.postMessage("close","*"),this.closePreCheckoutModal());}},{key:"newTransaction",value:function(n){var e=n.preload,t=n.inlineTransaction,a=n.transactionData,o=c(n,un),i=this.paymentRequestContainer&&I(this.paymentRequestContainer);if(this.activeTransaction()&&!i&&this.activeTransaction().cancel(),t&&a)return this.transactions.push(t),this.isDeprecatedApi||this.open({accessCode:a.access_code},e),t;var r=hn(this.transactions,t?t.parameters:o);if(r)return r.isActive=true,this.isDeprecatedApi||this.open({accessCode:r.accessCode},e),r;var s=t||new cn(o),l=s.accessCode?{accessCode:s.accessCode}:s.urlParameters;return this.transactions.push(s),this.isDeprecatedApi||this.open(l,e),s}},{key:"preloadTransaction",value:function(n){var t=this;this.newTransaction(e(e({},n),{},{preload:true}));return function(){return t.animateCheckoutIn()}}},{key:"paymentRequest",value:function(n){var e=n.container,t=n.styles,a=n.onElementsMount,o=c(n,dn);return pn=this,new Promise((function(i,r){var c=document.querySelector("#".concat(n.loadPaystackCheckoutButton));if(A()){pn.activeTransaction()&&pn.activeTransaction().cancel(),e&&z(e)||gn("A container is required to mount the payment request button"),pn.paymentRequestContainer=z(e);var s=hn(pn.transactions,o),l=s||new cn(o);l.requestInline().then((function(n){O(pn.paymentRequestContainer,{channels:n.channels,styles:t},n.merchant_id).then((function(n){a&&a(n);})).catch((function(){a&&a(null);})).finally((function(){if(s?l.isActive=true:pn.transactions.push(l),pn.registerPaymentRequestEventListeners(),c){var e=pn.preloadTransaction({inlineTransaction:l,transactionData:n});c.onclick=e;}i(l);}));})).catch((function(n){l.onSetupError({status:false,message:n.message}),r(n);}));}else {if(n&&n.loadPaystackCheckoutButton)if(c){var p=pn.preloadTransaction(o);c.onclick=p;}else sn("This device does not support any payment request wallet options. Please consult our documentation at https://developers.paystack.co/docs/paystack-inline to see how to load alternative payment options using 'loadPaystackCheckoutButton'");a&&a(null);var u=pn.activeTransaction();i(u);}}))}},{key:"registerApplePayEventListener",value:function(){var n=this;I(this.paymentRequestContainer).onclick=function(){return n.startApplePay()};}},{key:"registerPaymentRequestEventListeners",value:function(){var n=this.activeTransaction();n&&T(n.response.channels)?this.registerApplePayEventListener():j(this.paymentRequestContainer);}},{key:"startApplePay",value:function(){var n,t,a,o,i,r=this,c="apple pay",s=this.activeTransaction();if(s){var l={channel:"apple_pay",paymentMethod:c,currency:s.currency,amount:s.amount},p={channel:"apple_pay",currency:s.currency,amount:s.amount,timeSpent:s.getTimeSpent()};try{s.logAttempt(c),this.sendAnalyticsEventToCheckout(vn,l);var u=(n={currency:s.response.currency,amount:s.response.amount,merchantName:s.response.merchant_name,interval:s.response.plan_details&&s.response.plan_details.interval},t=n.currency,a=n.amount,o=n.merchantName,i=n.interval,e({countryCode:"NG",currencyCode:t,merchantCapabilities:["supports3DS","supportsCredit","supportsDebit"],supportedNetworks:["visa","masterCard"],requiredBillingContactFields:["postalAddress","name","phone","email"],total:{label:"".concat(o," - Paystack"),type:"final",amount:String(L(a))}},"string"==typeof i&&""!==i.trim()&&{lineItems:[{label:E(i),amount:String(L(a))}]})),d=new window.ApplePaySession(m.applePayVersion,u);d.onvalidatemerchant=function(n){var t=function(n){var t=n.transactionId,a=n.validationURL,o=n.merchantName,i=n.domainName,r=void 0===i?window&&window.location&&window.location.hostname:i,c="".concat(m.paymentBaseUrl).concat(m.applePayValidateSessionPath),s=S({transaction:t,sessionUrl:a,displayName:o,domainName:r});return fetch(c,e(e({},_),{},{body:s})).then((function(n){return n.json()}))}({validationURL:n.validationURL,transactionId:s.id,merchantName:s.response.merchant_name});t.then((function(n){"success"!==n.status?s.onSetupError(n):d.completeMerchantValidation(n.data),s.logValidationResponse(n.message);})).catch((function(n){s.onSetupError(n);}));},d.oncancel=function(){pn.preCheckoutModal||s.onCancel();},d.onpaymentauthorized=function(n){var t=n.payment,a=function(n){var t=n.transactionId,a=n.payment,o="".concat(m.paymentBaseUrl).concat(m.applePayChargePath),i=S({transaction:t,paymentObject:JSON.stringify(a)});return fetch(o,e(e({},_),{},{body:i})).then((function(n){return n.json()}))}({transactionId:s.id,payment:t});a.then((function(n){s.logAPIResponse(n,c),"success"===n.status?(d.completePayment(d.STATUS_SUCCESS),s.onSuccess(n),r.sendAnalyticsEventToCheckout(fn,p)):(d.completePayment(d.STATUS_FAILURE),s.onSetupError(n),r.sendAnalyticsEventToCheckout(yn,{channel:"apple_pay",message:n&&n.message||"Transaction attempt failed"})),pn.closePreCheckoutModal(n.status);})).catch((function(n){d.completePayment(d.STATUS_FAILURE),s.onSetupError(n),r.sendAnalyticsEventToCheckout(yn,{channel:"apple_pay",message:n&&n.message||"Error occurred"}),pn.closePreCheckoutModal("failed");}));},d.begin();}catch(n){s.onSetupError(n);}}else gn("Could not initiate apple pay transaction");}},{key:"resumeTransaction",value:function(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=e.onSuccess,a=e.onCancel,o=e.onLoad,i=e.onError;return this.newTransaction({accessCode:n,onSuccess:t,onCancel:a,onLoad:o,onError:i})}},{key:"activeTransaction",value:function(){var n=this.transactions.filter((function(n){return n.isActive})),e=n.length?n[n.length-1]:null;return e}},{key:"cancelTransaction",value:function(n){var e=this.transactions.find((function(e){return e.id===n}))||this.activeTransaction();e&&(e.cancel(),this.close());}},{key:"respondToEvent",value:function(n){if(n){var e,t,a=this.activeTransaction();try{var o=n.data||n.message,i=o.event,r=o.data;if(i)switch(i){case "loaded:checkout":if(this.isLoaded=!0,a){var c=this.checkoutIframe,s=a.urlParameters,l=a.response;Cn({checkoutIframe:c,urlParameters:l?{accessCode:l.access_code}:s});}break;case "loaded:transaction":e=this.backgroundIframe,(t=e.contentWindow.document)&&(t.getElementById("app-loader").style.display="none"),this.preCheckoutModal&&this.openPreCheckoutModal(),a.onLoad(r);break;case "error":"setup"===r.type?a.onSetupError(r):a.logError(r);break;case "cancel":case "close":this.close();var p=r&&r.status;p&&a.setStatus(p),!(this.paymentRequestContainer&&I(this.paymentRequestContainer)&&!this.preCheckoutModal)&&(a.isActive=!1),a.onCancel();break;case "transfer:pending":this.close();var u=r&&r.status;u&&a.setStatus(u),a.onBankTransferConfirmationPending();break;case "success":this.close(),a.onSuccess(r);}}catch(n){}}}},{key:"respondToEmbedEvents",value:function(n){var e,t,a=this.activeTransaction(),o=n.data||n.message;if(o&&("string"==typeof o||o instanceof String)){var i={action:t=(e=o)&&"string"==typeof e?e.split(" ")[0]:null,data:t?e.split(" ").slice(2).join(" "):null};if(i&&"PaystackClose"===i.action)i.data&&a.onSuccess(o);"PaystackTLSClose"===i.action&&a.cancel();}}},{key:"animateCheckoutIn",value:function(){var n,e=this;if(!this.isOpen){var t=this.checkoutIframe,a=this.backgroundIframe;(n={checkoutIframe:t,backgroundIframe:a},new Promise((function(e,t){n||t("No dom element provided");var a=n.checkoutIframe,o=n.backgroundIframe;a&&o||t("No dom element provided"),a.style.display="",a.style.visibility="visible",o.style.display="",o.style.visibility="visible",e();}))).then((function(){e.checkoutIframe.contentWindow.postMessage("render","*");})),this.isOpen=true;}}},{key:"open",value:function(n,e){n&&(Cn({checkoutIframe:this.checkoutIframe,urlParameters:n}),e||this.animateCheckoutIn());}},{key:"close",value:function(){var n=this;if(this.isOpen){var e,t=this.checkoutIframe,a=this.backgroundIframe;(e={checkoutIframe:t,backgroundIframe:a},new Promise((function(n,t){e||t("No dom element provided");var a=e.checkoutIframe,o=e.backgroundIframe;a&&o||t("No dom element provided"),o.style.opacity=0,a.style.display="none",a.style.visibility="hidden",setTimeout((function(){o.style.display="none",o.style.visibility="hidden",o.style.opacity=1,n();}),300);}))).then((function(){n.checkoutIframe.contentWindow.postMessage("close","*");})),this.isOpen=false;}}},{key:"isLoaded",value:function(){return this.isLoaded}}],[{key:"setup",value:function(e){var t=e&&e.container;pn||(pn=new n({isDeprecatedApi:true,isEmbed:t})),ln("PaystackPop.setup()","new PaystackPop()","Please consult our documentation at https://developers.paystack.co/docs/paystack-inline");var a=pn.newTransaction(e,"deprecated"),o=a.urlParameters;if(t){var i="".concat(m.siteUrl,"/assets/payment/production/inline.html?").concat(y(o)),r=function(n,e){var t=H("embed-checkout-".concat(n));return t.style.cssText="\n  background: transparent;\n  background: rgba(0,0,0,0);\n  border: 0px none transparent;\n  overflow-x: hidden;\n  overflow-y: hidden;\n  nmargin: 0;\n  padding: 0;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-touch-callout: none;\n  left: 0;\n  top: 0;\n  width: 100%;\n  height: 100%;\n  visibility: hidden;\n  display: none;\n",t.src=e,t.id=n,t.name=n,t}(pn.id,i);!function(n,e){var t=document.getElementById(n);t.innerHTML="",t.removeAttribute("style"),t.className="paystack-embed-container",t.style.position="relative",t.style.width="100%",t.appendChild(e);}(e.container,r),r.onload=function(){var n;r.contentWindow.postMessage("PaystackOpen ".concat(pn.id),"*"),n=r,new Promise((function(e,t){n||t("No dom element provided"),n.style.display="",n.style.visibility="visible",e();}));};}else a.openIframe=function(){ln("openIframe","open","Please consult our documentation at https://developers.paystack.co/docs/paystack-inline"),pn.open(o);};return a}}]),n}();if(bn=g().length>0,kn=f()&&"FORM"===f().parentElement.tagName,bn&&kn){var xn,Mn=function(){var n={},t=f();return g().forEach((function(e){var a=t.getAttribute(e),o=e.split("data-")[1].replace(/-([a-z])/g,(function(n){return n[1].toUpperCase()}));n[o]=a;})),function(n){if(n.buttonId&&!document.getElementById(n.buttonId))throw new Error("Please make sure the buttonId is an element available in the DOM");var t=e({},n);t.buttonText=n.buttonText||"Pay",t.buttonVariant="normal",t.buttonWordmarkVariant="normal";var a=["normal","light"];return n.buttonVariant&&a.indexOf(n.buttonVariant)>-1&&(t.buttonVariant=n.buttonVariant),n.buttonWordmarkVariant&&a.indexOf(n.buttonWordmarkVariant)>-1&&(t.buttonWordmarkVariant=n.buttonWordmarkVariant),t}(n)}(),Vn=f().parentElement;pn||(pn=new wn),function(n){var e;if(n.id)(e=document.getElementById(n.id)).setAttribute("data-inline-id",n.id);else {var t=document.createElement("div");t.id="inline-button-".concat(n.inlineId),t.innerHTML=function(n){var e,t,a={normal:'\n  <svg id="inline-button-wordmark" width="137" height="13" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M.037 5.095l1.075-.135c-.011-.774-.025-1.944-.013-2.149C1.19 1.364 2.38.134 3.81.013 3.9.006 3.99.002 4.077 0a2.947 2.947 0 0 1 2.046.76c.574.509.95 1.26 1.008 2.007.015.192.01 1.491.01 2.257l1.096.163L8.2 11.44 4.093 12 0 11.346l.037-6.251zm4.106-.514l1.724.256c-.007-.933-.05-2.295-.26-2.654-.319-.545-.846-.867-1.443-.88h-.063c-.607.008-1.138.322-1.458.864-.222.378-.266 1.66-.265 2.637l1.765-.223zM18.228 10.108c-.576 0-1.064-.072-1.464-.216a2.864 2.864 0 0 1-.972-.6 2.552 2.552 0 0 1-.588-.864 4.067 4.067 0 0 1-.252-1.044h1.008c.032.256.088.5.168.732.08.224.204.424.372.6.168.168.388.304.66.408.28.096.636.144 1.068.144.28 0 .536-.036.768-.108.24-.08.448-.192.624-.336.176-.144.312-.316.408-.516.104-.2.156-.42.156-.66 0-.24-.032-.448-.096-.624a1.02 1.02 0 0 0-.336-.468 1.885 1.885 0 0 0-.636-.324 6.4 6.4 0 0 0-1.008-.228 8.79 8.79 0 0 1-1.212-.276 3.246 3.246 0 0 1-.9-.432 1.982 1.982 0 0 1-.564-.672c-.128-.272-.192-.6-.192-.984 0-.328.068-.632.204-.912.136-.288.324-.536.564-.744.248-.208.54-.372.876-.492.336-.12.708-.18 1.116-.18.864 0 1.548.204 2.052.612.512.4.812.984.9 1.752h-.936c-.104-.544-.316-.932-.636-1.164-.32-.24-.78-.36-1.38-.36-.592 0-1.04.132-1.344.396a1.255 1.255 0 0 0-.444.996c0 .208.024.396.072.564.056.16.156.3.3.42.152.12.36.228.624.324a6.72 6.72 0 0 0 1.068.228c.48.072.9.168 1.26.288.36.12.664.276.912.468s.432.428.552.708c.128.28.192.624.192 1.032 0 .36-.076.696-.228 1.008a2.472 2.472 0 0 1-.612.804c-.264.224-.58.4-.948.528-.36.128-.752.192-1.176.192zM25.355 10.108c-.44 0-.848-.076-1.224-.228a2.916 2.916 0 0 1-.96-.636 2.966 2.966 0 0 1-.636-1.008 3.77 3.77 0 0 1-.216-1.308v-.096c0-.472.072-.904.216-1.296.144-.4.344-.74.6-1.02.264-.288.576-.508.936-.66.36-.16.756-.24 1.188-.24.36 0 .708.06 1.044.18.344.112.648.292.912.54.264.248.472.572.624.972.16.392.24.868.24 1.428v.324h-4.728c.024.72.204 1.272.54 1.656.336.376.828.564 1.476.564.984 0 1.54-.364 1.668-1.092h.996c-.112.632-.408 1.112-.888 1.44-.48.32-1.076.48-1.788.48zm1.704-3.852c-.048-.648-.232-1.112-.552-1.392-.312-.28-.728-.42-1.248-.42-.512 0-.932.164-1.26.492-.32.32-.524.76-.612 1.32h3.672zM32.091 10.108c-.44 0-.848-.072-1.224-.216a3.054 3.054 0 0 1-.972-.636 3.12 3.12 0 0 1-.648-1.008 3.626 3.626 0 0 1-.228-1.32v-.096c0-.48.08-.916.24-1.308.16-.4.376-.74.648-1.02.28-.28.604-.496.972-.648.376-.16.772-.24 1.188-.24.328 0 .644.04.948.12.312.08.588.208.828.384.248.168.456.392.624.672.168.28.276.62.324 1.02h-.984c-.08-.496-.284-.848-.612-1.056-.32-.208-.696-.312-1.128-.312a1.93 1.93 0 0 0-.804.168c-.24.112-.452.272-.636.48a2.23 2.23 0 0 0-.42.744 2.991 2.991 0 0 0-.156.996v.096c0 .776.188 1.364.564 1.764.384.392.88.588 1.488.588.224 0 .436-.032.636-.096a1.651 1.651 0 0 0 .96-.768c.112-.192.18-.416.204-.672h.924a2.595 2.595 0 0 1-.276.948 2.386 2.386 0 0 1-.576.744c-.24.208-.52.372-.84.492-.32.12-.668.18-1.044.18zM38.335 10.108a2.83 2.83 0 0 1-.876-.132 1.724 1.724 0 0 1-.684-.42 2.145 2.145 0 0 1-.456-.756c-.112-.304-.168-.672-.168-1.104V3.724h.996v3.924c0 .552.116.956.348 1.212.24.256.608.384 1.104.384.224 0 .44-.036.648-.108.208-.072.392-.18.552-.324.16-.144.288-.324.384-.54.096-.216.144-.464.144-.744V3.724h.996V10h-.996v-.996c-.144.296-.388.556-.732.78-.336.216-.756.324-1.26.324zM43.216 3.724h.996v1.128c.2-.352.452-.64.756-.864.312-.232.748-.356 1.308-.372v.936a4.461 4.461 0 0 0-.852.12 1.647 1.647 0 0 0-.66.324 1.472 1.472 0 0 0-.408.612c-.096.248-.144.564-.144.948V10h-.996V3.724zM50 10.108c-.44 0-.848-.076-1.224-.228a2.916 2.916 0 0 1-.96-.636 2.966 2.966 0 0 1-.636-1.008 3.77 3.77 0 0 1-.216-1.308v-.096c0-.472.072-.904.216-1.296.144-.4.344-.74.6-1.02.264-.288.576-.508.936-.66.36-.16.756-.24 1.188-.24.36 0 .708.06 1.044.18.344.112.648.292.912.54.264.248.472.572.624.972.16.392.24.868.24 1.428v.324h-4.728c.024.72.204 1.272.54 1.656.336.376.828.564 1.476.564.984 0 1.54-.364 1.668-1.092h.996c-.112.632-.408 1.112-.888 1.44-.48.32-1.076.48-1.788.48zm1.704-3.852c-.048-.648-.232-1.112-.552-1.392-.312-.28-.728-.42-1.248-.42-.512 0-.932.164-1.26.492-.32.32-.524.76-.612 1.32h3.672zM56.496 10.108c-.408 0-.788-.068-1.14-.204a2.683 2.683 0 0 1-.9-.612 3.01 3.01 0 0 1-.588-.984 4.01 4.01 0 0 1-.204-1.32v-.096c0-.48.072-.92.216-1.32.144-.4.344-.744.6-1.032.256-.296.564-.524.924-.684.36-.16.756-.24 1.188-.24.528 0 .956.112 1.284.336.328.216.584.476.768.78V.724h.996V10h-.996V8.92c-.088.152-.208.3-.36.444a2.792 2.792 0 0 1-.516.384 2.874 2.874 0 0 1-.6.252c-.216.072-.44.108-.672.108zm.108-.828c.288 0 .56-.048.816-.144.256-.096.476-.24.66-.432.184-.2.328-.448.432-.744.112-.304.168-.656.168-1.056v-.096c0-.808-.18-1.404-.54-1.788-.352-.384-.836-.576-1.452-.576-.624 0-1.112.208-1.464.624-.352.416-.528 1.008-.528 1.776v.096c0 .392.048.736.144 1.032.104.296.24.54.408.732.176.192.38.336.612.432.232.096.48.144.744.144zM67.712 10.108c-.512 0-.948-.112-1.308-.336a2.38 2.38 0 0 1-.816-.804V10h-.996V.724h.996V4.78a1.92 1.92 0 0 1 .348-.432c.152-.144.32-.268.504-.372.192-.112.396-.2.612-.264.216-.064.436-.096.66-.096.408 0 .788.072 1.14.216.352.144.652.352.9.624.256.272.456.604.6.996.144.392.216.832.216 1.32v.096c0 .48-.068.92-.204 1.32a3.103 3.103 0 0 1-.576 1.02 2.583 2.583 0 0 1-.9.672 2.937 2.937 0 0 1-1.176.228zm-.096-.828c.624 0 1.1-.2 1.428-.6.328-.408.492-.996.492-1.764V6.82c0-.4-.052-.748-.156-1.044a2.095 2.095 0 0 0-.42-.732 1.53 1.53 0 0 0-.612-.444 1.798 1.798 0 0 0-.744-.156c-.288 0-.56.048-.816.144a1.71 1.71 0 0 0-.648.444c-.184.192-.328.44-.432.744a3.152 3.152 0 0 0-.156 1.044v.096c0 .8.192 1.396.576 1.788.384.384.88.576 1.488.576zM73.63 9.352l-2.46-5.628h1.068l1.92 4.5 1.74-4.5h1.02l-3.468 8.46h-1.008l1.188-2.832zM87.127 3.669A3.138 3.138 0 0 0 86.1 2.95a3.09 3.09 0 0 0-1.228-.25c-.448 0-.848.086-1.187.26a2.199 2.199 0 0 0-.662.497v-.191a.387.387 0 0 0-.214-.348.323.323 0 0 0-.14-.03h-1.315a.314.314 0 0 0-.254.116.377.377 0 0 0-.1.262v8.97c0 .1.034.188.1.258a.34.34 0 0 0 .254.103h1.341a.342.342 0 0 0 .244-.103.336.336 0 0 0 .11-.259v-3.06c.178.202.417.357.702.464.35.134.72.203 1.093.203.43 0 .848-.082 1.242-.248a3.124 3.124 0 0 0 1.04-.724c.305-.326.545-.709.707-1.128a3.93 3.93 0 0 0 .263-1.477c0-.54-.086-1.037-.263-1.477a3.387 3.387 0 0 0-.706-1.12zm-1.204 3.24c-.073.19-.18.362-.315.51a1.415 1.415 0 0 1-1.065.466c-.2.001-.4-.04-.584-.12a1.484 1.484 0 0 1-.49-.346 1.593 1.593 0 0 1-.32-.51 1.738 1.738 0 0 1-.115-.63c0-.224.04-.435.115-.631a1.532 1.532 0 0 1 .804-.846c.185-.086.386-.13.59-.129.215 0 .414.044.593.13.177.083.338.199.474.341a1.622 1.622 0 0 1 .425 1.135c0 .225-.037.436-.112.63zM95.298 2.89h-1.33a.339.339 0 0 0-.246.11.384.384 0 0 0-.108.266v.166a1.856 1.856 0 0 0-.602-.472 2.525 2.525 0 0 0-1.166-.258 3.227 3.227 0 0 0-2.284.964 3.554 3.554 0 0 0-.734 1.123 3.827 3.827 0 0 0-.275 1.477c0 .54.092 1.037.275 1.477.184.434.427.817.728 1.128a3.146 3.146 0 0 0 2.277.973c.437 0 .834-.088 1.173-.259.25-.13.456-.287.608-.471v.177a.34.34 0 0 0 .11.259.341.341 0 0 0 .244.104h1.33a.324.324 0 0 0 .25-.105.349.349 0 0 0 .102-.258V3.267a.377.377 0 0 0-.1-.262.325.325 0 0 0-.252-.115zM93.502 6.9a1.55 1.55 0 0 1-.312.511c-.136.143-.296.26-.473.344-.178.085-.38.129-.596.129-.207 0-.407-.044-.59-.13a1.501 1.501 0 0 1-.791-.855 1.766 1.766 0 0 1-.112-.62c0-.225.038-.436.112-.632.075-.193.181-.364.314-.504.137-.143.3-.26.478-.342.182-.085.382-.129.59-.129.215 0 .417.044.595.13.178.085.338.2.473.341a1.623 1.623 0 0 1 .424 1.135c0 .215-.037.424-.112.622zM108.567 6.094a2.265 2.265 0 0 0-.654-.402c-.247-.101-.509-.181-.785-.235l-1.014-.204c-.26-.05-.441-.117-.543-.203a.328.328 0 0 1-.136-.264c0-.11.063-.2.189-.282.137-.086.329-.13.566-.13.26 0 .518.053.757.157.243.106.471.226.67.36.295.187.546.162.727-.053l.487-.57a.543.543 0 0 0 .152-.357c0-.128-.064-.245-.185-.351-.207-.184-.533-.378-.971-.568-.437-.192-.987-.29-1.637-.29-.427 0-.82.058-1.168.172-.35.116-.65.276-.893.474-.245.204-.438.44-.57.713a2 2 0 0 0-.198.875c0 .56.167 1.017.496 1.358.328.333.766.56 1.304.67l1.054.232c.3.062.528.132.675.21.129.067.19.163.19.297 0 .12-.061.227-.188.324-.133.104-.342.155-.622.155a1.83 1.83 0 0 1-.831-.19 3.056 3.056 0 0 1-.678-.458.995.995 0 0 0-.307-.17c-.126-.037-.268.003-.431.13l-.583.461c-.169.145-.24.32-.209.522.029.194.19.394.491.62.269.193.614.368 1.029.518.415.151.901.229 1.453.229.444 0 .854-.058 1.215-.172.362-.119.681-.278.941-.48a2.056 2.056 0 0 0 .819-1.663c0-.319-.053-.6-.165-.836a1.843 1.843 0 0 0-.447-.6zM114.383 7.73a.363.363 0 0 0-.295-.192.55.55 0 0 0-.343.113c-.095.062-.198.11-.306.141a.75.75 0 0 1-.426.013.43.43 0 0 1-.181-.093.554.554 0 0 1-.143-.204.92.92 0 0 1-.059-.362v-2.46h1.731c.099 0 .188-.04.266-.117a.368.368 0 0 0 .112-.26V3.268a.369.369 0 0 0-.115-.268.38.38 0 0 0-.263-.109h-1.732V1.216a.354.354 0 0 0-.108-.27.347.347 0 0 0-.243-.104h-1.344a.36.36 0 0 0-.34.226.371.371 0 0 0-.027.148V2.89h-.767a.324.324 0 0 0-.255.115.385.385 0 0 0-.098.262V4.31a.4.4 0 0 0 .212.346c.044.021.092.032.14.03h.768v2.925c0 .39.069.726.2 1.003.132.274.305.504.514.676.217.178.465.31.731.388.27.084.551.126.833.126.385 0 .75-.061 1.094-.18a2.13 2.13 0 0 0 .861-.552c.152-.181.17-.381.046-.581l-.463-.76zM121.672 2.89h-1.329a.339.339 0 0 0-.244.11.39.39 0 0 0-.08.122.394.394 0 0 0-.027.144v.166a1.906 1.906 0 0 0-.605-.472c-.335-.173-.726-.258-1.168-.258-.42 0-.834.083-1.226.249a3.24 3.24 0 0 0-1.055.715 3.528 3.528 0 0 0-.734 1.123 3.79 3.79 0 0 0-.276 1.477c0 .54.092 1.037.275 1.477.184.434.428.817.729 1.128a3.138 3.138 0 0 0 2.273.973 2.59 2.59 0 0 0 1.175-.259c.255-.13.457-.287.612-.471v.177a.34.34 0 0 0 .108.259.343.343 0 0 0 .243.104h1.329a.335.335 0 0 0 .252-.105.364.364 0 0 0 .102-.258V3.267a.38.38 0 0 0-.1-.262.332.332 0 0 0-.115-.087.311.311 0 0 0-.139-.028zM119.876 6.9a1.534 1.534 0 0 1-.786.855 1.362 1.362 0 0 1-.594.129c-.207 0-.405-.044-.588-.13a1.516 1.516 0 0 1-.792-.855 1.757 1.757 0 0 1-.113-.62c0-.225.037-.436.112-.632.073-.187.179-.358.314-.504.138-.143.3-.26.479-.342.184-.086.385-.13.588-.129.217 0 .415.044.594.13.181.085.34.2.472.341.134.143.24.313.314.504a1.73 1.73 0 0 1 0 1.253zM128.978 7.64l-.763-.593c-.146-.118-.284-.15-.404-.1a.742.742 0 0 0-.279.205 2.527 2.527 0 0 1-.583.535c-.192.122-.444.183-.742.183-.219 0-.42-.04-.6-.122a1.423 1.423 0 0 1-.469-.342 1.575 1.575 0 0 1-.308-.51 1.751 1.751 0 0 1-.106-.617c0-.228.034-.438.106-.632.07-.192.173-.363.308-.503.135-.144.295-.26.472-.342.187-.088.391-.132.597-.13.298 0 .547.064.742.187.198.126.396.306.584.534.078.092.17.16.278.206.122.048.259.016.401-.101l.762-.594a.53.53 0 0 0 .201-.269.437.437 0 0 0-.034-.365 3.329 3.329 0 0 0-1.18-1.127c-.504-.291-1.108-.441-1.784-.441a3.519 3.519 0 0 0-2.51 1.033c-.322.322-.576.71-.747 1.137a3.68 3.68 0 0 0-.273 1.407c0 .495.093.968.273 1.402.173.424.427.808.747 1.128a3.527 3.527 0 0 0 2.51 1.034c.676 0 1.28-.149 1.784-.444a3.286 3.286 0 0 0 1.182-1.13.411.411 0 0 0 .055-.173.415.415 0 0 0-.023-.182.624.624 0 0 0-.197-.273zM136.06 9.045l-2.104-3.143 1.801-2.415c.094-.139.119-.272.075-.397-.031-.09-.116-.2-.334-.2h-1.425a.52.52 0 0 0-.234.058.482.482 0 0 0-.209.205L132.191 5.2h-.349V.363a.37.37 0 0 0-.099-.26.352.352 0 0 0-.253-.103h-1.332a.37.37 0 0 0-.337.22.346.346 0 0 0-.027.143V9.29c0 .103.038.193.11.259a.353.353 0 0 0 .254.104h1.333a.328.328 0 0 0 .251-.105.346.346 0 0 0 .075-.119.333.333 0 0 0 .024-.14V6.927h.386l1.571 2.446c.112.187.267.281.46.281h1.491c.226 0 .32-.11.358-.202.054-.13.038-.262-.047-.406zM102.863 2.89h-1.489a.389.389 0 0 0-.298.122.544.544 0 0 0-.13.249l-1.099 4.167h-.268l-1.182-4.167a.66.66 0 0 0-.113-.247.329.329 0 0 0-.264-.124h-1.544c-.199 0-.325.066-.372.193a.588.588 0 0 0-.002.37l1.887 5.865c.03.093.08.17.145.232a.388.388 0 0 0 .281.104h.798l-.066.19-.19.547a.872.872 0 0 1-.29.426.7.7 0 0 1-.442.148.956.956 0 0 1-.4-.09 1.842 1.842 0 0 1-.35-.209.62.62 0 0 0-.335-.115h-.016c-.13 0-.243.074-.334.216l-.474.708c-.193.304-.086.504.039.615.234.224.528.399.875.524.344.125.723.186 1.126.186.682 0 1.252-.187 1.689-.565.435-.376.756-.887.952-1.524l2.188-7.258c.05-.155.05-.284.005-.389-.037-.08-.125-.174-.327-.174z" fill="#011B33"/>\n    </svg>',light:b};return "\n    <style>\n      #inline-button-".concat(n.inlineId," {\n        position: relative;\n        text-align: center;\n        display: inline-block;\n      }\n      #inline-button-").concat(n.inlineId,"__trigger {\n        ").concat((e=n.variant||"normal",t={normal:"\n    background: linear-gradient(180deg,#44b669 0,#40ad57);\n    text-shadow: 1px 1px 1px rgba(0,0,0,.1);\n    color: #ffffff;\n  ",light:"\n    background: white;\n    text-shadow: none;\n    color: #011b33;\n  "},"".concat("\n    box-sizing: border-box;\n    display: inline-block;\n    line-height: 1;\n    white-space: nowrap;\n    margin: 0 0 10px;\n    text-align: center;\n    -webkit-appearance: none;\n    outline: none;\n    font-size: 14px;\n    font-weight: 600;\n    border-radius: 6px;\n    cursor: pointer;\n    padding: 16px 24px;\n    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);\n    transition: all .3s ease;\n    border: none;\n    min-width: 190px;\n  ").concat(t[e])),"\n      }\n      #inline-button-").concat(n.inlineId,"__trigger:hover {\n        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);\n      }\n      #inline-button-").concat(n.inlineId,'__trigger:active {\n        transform: translateY(3px);\n      }\n    </style>\n    <button id="inline-button-').concat(n.inlineId,'__trigger" data-inline-id="').concat(n.inlineId,'">').concat(n.text||"Pay"," ").concat(n.currency||"NGN"," ").concat(n.amount,'</button>\n    <div id="inline-button-').concat(n.inlineId,'__wordmark">\n      ').concat(a[n.wordmarkVariant||"normal"],"\n    </div>\n  ")}(n),n.parent.parentNode.insertBefore(t,n.parent.nextSibling),e=s(t.getElementsByTagName("button"),1)[0];}return e}({inlineId:pn.id,amount:Mn.amount/100,currency:Mn.currency,id:Mn.buttonId,text:Mn.buttonText,variant:Mn.buttonVariant,wordmarkVariant:Mn.buttonWordmarkVariant,parent:f()}).addEventListener("click",(function(n){n.preventDefault(),xn?pn.resumeTransaction(xn.accessCode):xn=pn.newTransaction(e(e({},Mn),{},{onSuccess:function(n){var e,t,a,o,i,r;e={type:"hidden",name:"reference",value:n.reference,parent:Vn},t=e.type,a=e.value,o=e.name,i=e.parent,(r=document.createElement("input")).type=t,r.value=a,r.name=o,i.appendChild(r),Vn.submit();}}));}));}

  const Checkout = ({
    handleCloseModal,
    setOpenCheckout,
    listedTickets,
    setListedTickets,
    selectedTickets,
    setSelectedTickets,
    questionsToDisplay,
    eventDetailsWithId,
    setShowTicketPurchaseSuccess,
    setOpenPaymentsModal,
    currentCurrency,
    rates,
    openPaymentsModal,
    coupons,
    updatedTicketsData,
    BACKEND_URL,
    BASE_URL,
    buttonColor
  }) => {
    var _a, _b, _c;
    const [tickets, setTickets] = react.useState(listedTickets);
    const [isMultiple, setIsMultiple] = react.useState("yes");
    const [userAnswerArray, setUserAnswerArray] = react.useState([]);
    const [errorMessage, setErrorMessage] = react.useState("");
    const [isSubmitting, setIsSubmitting] = react.useState(false);
    const [totalPrice, setTotalPrice] = react.useState(0);
    const [showApplyCoupon, setShowApplyCoupon] = react.useState(false);
    const [discountCodeRes, setDiscountCodeRes] = react.useState({});
    const [couponError, setCouponError] = react.useState("");
    const max = findTicketTypeIdWithHighestQuantity(tickets);
    const rate = rates[`NGN${currentCurrency}`];
    const defaultCoupon = (_a = coupons.find(elem => elem.ticketType === max)) !== null && _a !== void 0 ? _a : coupons[0];
    const isTicketSupportAutoDis = (defaultCoupon === null || defaultCoupon === void 0 ? void 0 : defaultCoupon.ticketTypeId) > 0 ? ((_b = listedTickets.filter(eachticket => (eachticket === null || eachticket === void 0 ? void 0 : eachticket._ticketType) == (defaultCoupon === null || defaultCoupon === void 0 ? void 0 : defaultCoupon.ticketType))) === null || _b === void 0 ? void 0 : _b.length) > 0 : ((_c = listedTickets.filter(eachticket => (eachticket === null || eachticket === void 0 ? void 0 : eachticket.cost) > 0)) === null || _c === void 0 ? void 0 : _c.length) > 0;
    const [couponAppliedAmount, setCouponAppliedAmount] = react.useState(0);
    const [discountCode, setDiscountCode] = react.useState(isTicketSupportAutoDis === true ? defaultCoupon === null || defaultCoupon === void 0 ? void 0 : defaultCoupon.code : "");
    react.useEffect(() => {
      if (!tickets.length) return;
      const updatedTickets = tickets.map(eachTicket => {
        let questions = [];
        if (isMultiple === "no") {
          questions = questionsToDisplay.filter(q => q.ticketId === eachTicket.ticketTypeId);
        } else {
          questions = questionsToDisplay.filter(q => q.sectionName === eachTicket.ticketName);
        }
        return {
          ...eachTicket,
          requiredQuestion: questions
        };
      });
      setTickets(updatedTickets);
    }, [isMultiple, questionsToDisplay, listedTickets]);
    const handleFreeEventHandler = async ({
      walletAddress,
      eventId,
      eventAddress,
      email,
      tickets,
      userAnswerArray = []
    }) => {
      var _a, _b;
      const data = {
        address: walletAddress,
        eventId,
        eventAddress,
        email,
        amount: 0,
        tickets,
        discountCode
      };
      setIsSubmitting(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/add_free_event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          setShowTicketPurchaseSuccess(true);
          await submitUserAnswers(userAnswerArray);
        }
      } catch (e) {
        setIsSubmitting(false);
        const errorMessage = ((_b = (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || e.message || "Something went wrong";
        setErrorMessage(errorMessage);
      }
    };
    const submitUserAnswers = async userAnswerArray => {
      if (!Array.isArray(userAnswerArray) || userAnswerArray.length === 0) return;
      try {
        const response = await fetch(`${BASE_URL}/api/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userAnswerArray
          })
        });
        if (!response.ok) {
          throw new Error(`Failed to submit answers: ${response.statusText}`);
        }
        return await response.json();
      } catch (error) {
        console.error("Error submitting user answers:", error);
      }
    };
    const handleSubmit = async data => {
      let totalPrice = 0;
      data === null || data === void 0 ? void 0 : data.forEach(eachTickets => {
        totalPrice += (eachTickets === null || eachTickets === void 0 ? void 0 : eachTickets.cost) * (eachTickets === null || eachTickets === void 0 ? void 0 : eachTickets.quantity);
      });
      const userAnswerArray = createUserAnswerArray(data);
      setUserAnswerArray(userAnswerArray);
      if (totalPrice === 0) {
        handleFreeEventHandler({
          walletAddress: randomizeLastFourDigits("0x0000000000000000000000000000000000000002"),
          eventId: eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.id,
          eventAddress: eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.eventAddress,
          email: "package@gmail.com",
          tickets: data,
          userAnswerArray
        });
      } else {
        setOpenPaymentsModal(true);
      }
    };
    const coupon = couponAppliedAmount === 0 ? "" : discountCode;
    const handleDeleteTicket = indexToRemove => {
      const removedTicket = listedTickets[indexToRemove];
      const updatedListedTickets = listedTickets.filter((_, index) => index !== indexToRemove);
      setListedTickets(updatedListedTickets);
      if (updatedListedTickets.length === 0) {
        setOpenCheckout(false);
      }
      const updatedSelectedTickets = selectedTickets.map(ticket => {
        if (ticket._ticketType === removedTicket._ticketType && ticket.ticketName === removedTicket.ticketName) {
          if (ticket.quantity > 1) {
            return {
              ...ticket,
              quantity: ticket.quantity - 1
            };
          } else {
            return null;
          }
        }
        return ticket;
      }).filter(ticket => ticket !== null);
      setSelectedTickets(updatedSelectedTickets);
      const updatedTickets = tickets.filter((_, index) => index !== indexToRemove);
      setTickets(updatedTickets);
    };
    const handlePaymentHandler = async ({
      walletAddress,
      eventId,
      email,
      eventAddress,
      tickets
    }) => {
      let newEmail = email === null || email === void 0 ? void 0 : email.split("++gruve");
      newEmail = newEmail[0] + newEmail[1];
      email = (email === null || email === void 0 ? void 0 : email.includes("++gruve")) ? newEmail : email;
      const payload = {
        address: walletAddress !== null && walletAddress !== void 0 ? walletAddress : randomizeLastFourDigits("0x0000000000000000000000000000000000000002"),
        eventId,
        eventAddress,
        email,
        tickets,
        ...(coupon ? {
          discountCode: coupon
        } : {})
      };
      let _request;
      setIsSubmitting(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/payment/paystack`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const result = await res.json();
        _request = result === null || result === void 0 ? void 0 : result.data;
        const data = {
          email,
          amount: _request.amountToPay,
          tickets: tickets,
          eventAddress
        };
        const amount = totalPrice * rate * 100;
        const _payStack = new wn();
        _payStack.newTransaction({
          key: PAYSTACK_KEY,
          amount: amount.toString() === "0" ? 1 : amount,
          currency: "NGN",
          email,
          reference: _request.paystackOrder.reference,
          metadata: {
            custom_fields: [{
              display_name: "Email",
              variable_name: "email",
              value: email
            }, {
              display_name: "Amount",
              variable_name: "amount",
              value: amount
            }, {
              display_name: "Tickets",
              variable_name: "tickets",
              value: (tickets === null || tickets === void 0 ? void 0 : tickets.length) || 0
            }, {
              display_name: "Event Address",
              variable_name: "event_address",
              value: eventAddress
            }]
          },
          onLoad() {},
          onSuccess(transaction) {
            setShowTicketPurchaseSuccess(true);
            setOpenPaymentsModal(false);
          },
          onCancel() {
            setIsSubmitting(false);
          },
          onError() {
            setIsSubmitting(false);
          }
        });
        await submitUserAnswers(userAnswerArray);
      } catch (e) {
        setIsSubmitting(false);
      }
    };
    const handleGoBack = () => {
      setOpenCheckout(false);
    };
    const handleClosePayment = () => {
      setOpenPaymentsModal(false);
    };
    const handleCoupon = async (eventAddress, code) => {
      var _a;
      try {
        setShowApplyCoupon(true);
        const res = await fetch(`${BACKEND_URL}/api/discount/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            eventAddress,
            code: code.toUpperCase()
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }
        setShowApplyCoupon(false);
        setDiscountCodeRes({});
        const coupon = data === null || data === void 0 ? void 0 : data.data;
        const eventCurrency = (eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.currency) ? eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.currency : "NGN";
        const costMap = updatedTicketsData && updatedTicketsData.map((elem, index) => ({
          ...elem,
          _ticketType: index + 1
        })).reduce((result, value) => ({
          ...result,
          [value._ticketType]: value.cost
        }), {});
        const [modifiedTickets, discountAmountApplied] = applyDiscount(tickets.map(elem => ({
          ...elem,
          discountAmount: 0,
          isDiscounted: false
        })), coupon.ticketType, Math.min(coupon.utilityLeft, coupon.limitPerUser), eventCurrency, coupon.discountValue, coupon.discountType, costMap);
        setCouponAppliedAmount(discountAmountApplied);
        setTickets(modifiedTickets);
      } catch (e) {
        setDiscountCodeRes({
          ...discountCodeRes,
          message: (_a = e === null || e === void 0 ? void 0 : e.response) === null || _a === void 0 ? void 0 : _a.data.message
        });
        setShowApplyCoupon(false);
        setCouponError(e.message);
      }
      return;
    };
    const generateTicketTypes = (ticketArray, currentCurrency) => {
      var _a, _b;
      if (!ticketArray || ticketArray.length === 0) return;
      let totalPrice = 0;
      ticketArray.forEach(eachTicket => {
        const ticketCost = eachTicket.discountedCost !== eachTicket.cost ? eachTicket.discountedCost : eachTicket.cost;
        totalPrice += ticketCost * eachTicket.quantity;
      });
      const defaultCurrency = (_a = eventDetailsWithId === null || eventDetailsWithId === void 0 ? void 0 : eventDetailsWithId.currency) !== null && _a !== void 0 ? _a : "NGN";
      setTotalPrice((totalPrice - couponAppliedAmount) * ((_b = rates[`${currentCurrency}${defaultCurrency}`]) !== null && _b !== void 0 ? _b : 1));
    };
    react.useEffect(() => {
      if (tickets) {
        generateTicketTypes(tickets, currentCurrency);
      }
    }, [tickets, currentCurrency, couponAppliedAmount]);
    return jsxRuntime.jsx("div", {
      className: "",
      children: jsxRuntime.jsx("div", {
        className: "modal",
        children: jsxRuntime.jsx(TicketForm, {
          rates: rates,
          handleSubmit: handleSubmit,
          handlePaymentHandler: handlePaymentHandler,
          handleCloseModal: handleCloseModal,
          eventDetailsWithId: eventDetailsWithId,
          isMultiple: isMultiple,
          setIsMultiple: setIsMultiple,
          goBack: handleGoBack,
          handleClosePayment: handleClosePayment,
          tickets: tickets,
          isSubmitting: isSubmitting,
          totalPrice: totalPrice,
          setErrorMessage: setErrorMessage,
          errorMessage: errorMessage,
          currentCurrency: currentCurrency,
          selectedTickets: selectedTickets,
          handleCoupon: handleCoupon,
          handleDeleteTicket: handleDeleteTicket,
          openPaymentsModal: openPaymentsModal,
          discountCode: discountCode,
          setDiscountCode: setDiscountCode,
          showApplyCoupon: showApplyCoupon,
          coupon: coupon,
          couponError: couponError,
          buttonColor: buttonColor,
          setCouponError: setCouponError,
          couponAppliedAmount: couponAppliedAmount
        })
      })
    });
  };

  const SucessfulConnect = props => {
    return jsxRuntime.jsxs("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 120 120",
      ...props,
      children: [jsxRuntime.jsx("rect", {
        width: "119",
        height: "119",
        x: ".5",
        y: ".5",
        fill: "#F4F6F5",
        rx: "59.5"
      }), jsxRuntime.jsx("rect", {
        width: "100",
        height: "100",
        x: "10",
        y: "10",
        fill: "#BDE3CD",
        rx: "50"
      }), jsxRuntime.jsx("rect", {
        width: "80",
        height: "80",
        x: "20",
        y: "20",
        fill: "#40B773",
        rx: "40"
      }), jsxRuntime.jsx("mask", {
        id: "a",
        width: "32",
        height: "32",
        x: "44",
        y: "44",
        maskUnits: "userSpaceOnUse",
        children: jsxRuntime.jsx("path", {
          fill: "#D9D9D9",
          d: "M44 44h32v32H44z"
        })
      }), jsxRuntime.jsx("g", {
        mask: "url(#a)",
        children: jsxRuntime.jsx("path", {
          fill: "#fff",
          d: "m56.73 69.07-8.66-8.67 3-3 5.66 5.67 12.2-12.2 3 3-15.2 15.2Z"
        })
      }), jsxRuntime.jsx("rect", {
        width: "119",
        height: "119",
        x: ".5",
        y: ".5",
        stroke: "transparent",
        rx: "59.5"
      })]
    });
  };

  const TicketPurchaseSuccessfulModal = ({
    close,
    BASE_URL,
    buttonColor
  }) => {
    return jsxRuntime.jsxs("div", {
      className: "modal-body",
      children: [jsxRuntime.jsxs("div", {
        className: "modal-top",
        children: [jsxRuntime.jsx("h3", {}), jsxRuntime.jsx("div", {
          onClick: close,
          className: "close-icon",
          children: jsxRuntime.jsx(CloseIcon, {})
        })]
      }), jsxRuntime.jsxs("div", {
        className: "modal-flex",
        children: [jsxRuntime.jsx(SucessfulConnect, {
          height: "96px",
          width: "96px"
        }), jsxRuntime.jsx("h2", {
          className: "modal-heading",
          children: "Ticket acquired successfully"
        }), jsxRuntime.jsx("p", {
          className: "modal-text",
          children: "Your ticket will be sent to the provided email(s) and WhatsApp numbers. If you don't receive it immediately, please check your spam folder. Sign in to view more details and manage your registration."
        }), jsxRuntime.jsx("a", {
          href: BASE_URL,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "sign-in-button",
          children: jsxRuntime.jsx("div", {
            className: "",
            style: {
              background: buttonColor
            },
            children: "Sign in to Gruve"
          })
        })]
      })]
    });
  };

  const EventDetails = ({
    eventDetails,
    open,
    setOpen,
    rates,
    questions,
    eventDetailsWithId,
    coupons,
    couponData,
    ticketBalances,
    BACKEND_URL,
    BASE_URL,
    buttonColor
  }) => {
    var _a, _b, _c, _d;
    const [currentCurrency, setCurrentCurrency] = react.useState("NGN");
    const [selectedTickets, setSelectedTickets] = react.useState([]);
    const [listedTickets, setListedTickets] = react.useState([]);
    const [openCheckout, setOpenCheckout] = react.useState(false);
    const [openPaymentsModal, setOpenPaymentsModal] = react.useState(false);
    const [showTicketPurchaseSuccess, setShowTicketPurchaseSuccess] = react.useState(false);
    const questionsIds = ((_a = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.tickets) === null || _a === void 0 ? void 0 : _a.map(eachTicket => eachTicket === null || eachTicket === void 0 ? void 0 : eachTicket.sectionName)) || [];
    const questionsToDisplay = questions.filter(eachQuestion => questionsIds.includes(eachQuestion === null || eachQuestion === void 0 ? void 0 : eachQuestion.sectionName));
    const handleClose = () => {
      setOpen(false);
      setOpenCheckout(false);
      setSelectedTickets([]);
      setShowTicketPurchaseSuccess(false);
    };
    const isSelected = selectedTickets.length > 0;
    const handleGetTickets = () => {
      if (isSelected) {
        setListedTickets(expandTickets(selectedTickets));
        setOpenCheckout(true);
      }
    };
    const updatedTicketsData = updatedTickets(listedTickets, eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.tickets, couponData);
    return jsxRuntime.jsxs(Modal, {
      isOpen: open,
      openCheckout: openCheckout,
      openPaymentsModal: openPaymentsModal,
      children: [showTicketPurchaseSuccess ? jsxRuntime.jsx(TicketPurchaseSuccessfulModal, {
        close: handleClose,
        BASE_URL: BASE_URL,
        buttonColor: buttonColor
      }) : jsxRuntime.jsx(jsxRuntime.Fragment, {
        children: openCheckout ? jsxRuntime.jsx(jsxRuntime.Fragment, {
          children: jsxRuntime.jsx(Checkout, {
            rates: rates,
            coupons: coupons,
            setOpenCheckout: setOpenCheckout,
            setOpenPaymentsModal: setOpenPaymentsModal,
            openPaymentsModal: openPaymentsModal,
            listedTickets: listedTickets,
            currentCurrency: currentCurrency,
            setListedTickets: setListedTickets,
            selectedTickets: selectedTickets,
            eventDetailsWithId: eventDetailsWithId,
            setShowTicketPurchaseSuccess: setShowTicketPurchaseSuccess,
            setSelectedTickets: setSelectedTickets,
            questionsToDisplay: questionsToDisplay,
            updatedTicketsData: updatedTicketsData,
            buttonColor: buttonColor,
            handleCloseModal: handleClose,
            BACKEND_URL: BACKEND_URL,
            BASE_URL: BASE_URL
          })
        }) : jsxRuntime.jsxs(jsxRuntime.Fragment, {
          children: [jsxRuntime.jsxs("div", {
            className: "modal-top",
            children: [jsxRuntime.jsx("h3", {
              children: "Details"
            }), jsxRuntime.jsx("div", {
              onClick: handleClose,
              className: "close-icon",
              children: jsxRuntime.jsx(CloseIcon, {})
            })]
          }), eventDetails && Object.keys(eventDetails).length > 0 && jsxRuntime.jsxs("div", {
            className: "event-details-container",
            children: [jsxRuntime.jsx("div", {
              className: "event-img-container",
              children: jsxRuntime.jsx("img", {
                className: "event-img max-w-[400px] max-h-[400px] size-[400px] rounded-lg",
                src: (_b = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.info) === null || _b === void 0 ? void 0 : _b.eventImage,
                alt: ""
              })
            }), jsxRuntime.jsxs("div", {
              className: "details",
              children: [jsxRuntime.jsxs("h3", {
                className: "",
                children: [" ", (_c = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.info) === null || _c === void 0 ? void 0 : _c.eventName]
              }), jsxRuntime.jsxs("div", {
                className: "date-container",
                children: [jsxRuntime.jsx(ScheduleInfo, {
                  eventData: eventDetails
                }), jsxRuntime.jsx(Location, {
                  location: (_d = eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.info) === null || _d === void 0 ? void 0 : _d.eventLocation.label
                })]
              }), jsxRuntime.jsx("div", {
                className: "",
                children: jsxRuntime.jsx(Tickets, {
                  currentCurrency: currentCurrency,
                  setCurrentCurrency: setCurrentCurrency,
                  tickets: updatedTicketsData,
                  eventDetails: eventDetails,
                  selectedTickets: selectedTickets,
                  rates: rates,
                  ticketBalances: ticketBalances,
                  setSelectedTickets: setSelectedTickets
                })
              }), jsxRuntime.jsx("button", {
                disabled: !isSelected,
                style: {
                  background: buttonColor
                },
                className: `get-tickets-btn ${!isSelected && "not-selected"}`,
                onClick: handleGetTickets,
                children: "Get Tickets"
              })]
            })]
          })]
        })
      }), jsxRuntime.jsxs("div", {
        className: "modal-footer",
        children: [jsxRuntime.jsxs("div", {
          className: "",
          children: [jsxRuntime.jsx("span", {
            className: "",
            children: "View Full Event Page"
          }), jsxRuntime.jsx(ArrowRight, {})]
        }), jsxRuntime.jsx("div", {
          className: "",
          children: jsxRuntime.jsx(PoweredBy, {})
        })]
      })]
    });
  };

  const Loader = () => {
    return jsxRuntime.jsx("div", {
      className: "loader-container",
      children: jsxRuntime.jsx("div", {
        className: "loader-spinner"
      })
    });
  };

  const GruveEventWidgets = ({
    eventAddress,
    isTest = false,
    config
  }) => {
    const [eventDetails, setEventDetails] = react.useState(null);
    const [eventDetailsWithId, setEventDetailsWithId] = react.useState(null);
    const [questions, setQuestions] = react.useState([]);
    const [coupons, setCoupons] = react.useState([]);
    const [ticketBalances, setTicketBalances] = react.useState([]);
    const [couponData, setCouponData] = react.useState([]);
    const BASE_URL = isTest ? "http://localhost:3000" : "https://beta.gruve.events";
    const BACKEND_URL = isTest ? "https://backend.gruve.events" : "https://secure.gruve.events";
    const [rates, setRates] = react.useState({});
    const [loading, setLoading] = react.useState(false);
    const [error, setError] = react.useState(null);
    const [open, setOpen] = react.useState(false);
    const fetchRates = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/fetch-rates`);
        const result = await response.json();
        setRates(result);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/fetch-event-details?eventAddress=${eventAddress}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        setQuestions(result === null || result === void 0 ? void 0 : result.questions);
        setTicketBalances(result === null || result === void 0 ? void 0 : result.balances);
        setLoading(false);
        setEventDetails(result === null || result === void 0 ? void 0 : result.data);
        setEventDetailsWithId(result === null || result === void 0 ? void 0 : result.eventDetailsWithId);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    const fetchCoupon = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/discount/check/${eventAddress.toLowerCase()}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        setCouponData(result === null || result === void 0 ? void 0 : result.data);
      } catch (error) {
        console.log(error);
      }
    };
    const handleClick = () => {
      fetchCoupon();
      setOpen(true);
      if (!eventDetails) {
        fetchEventDetails();
        fetchRates();
      }
    };
    const buttonColor = (config === null || config === void 0 ? void 0 : config.buttonColor) ? config === null || config === void 0 ? void 0 : config.buttonColor : "#ea445a";
    return jsxRuntime.jsxs("div", {
      className: "",
      children: [jsxRuntime.jsx("div", {
        onClick: handleClick,
        style: {
          background: buttonColor
        },
        className: "event-details-btn",
        children: "Get ticket"
      }), loading ? jsxRuntime.jsx("div", {
        className: "loader-container_",
        children: jsxRuntime.jsx(Loader, {})
      }) : jsxRuntime.jsx(EventDetails, {
        eventDetails: eventDetails,
        open: open,
        eventDetailsWithId: eventDetailsWithId,
        setOpen: setOpen,
        questions: questions,
        rates: rates,
        coupons: coupons,
        couponData: couponData,
        ticketBalances: ticketBalances,
        BACKEND_URL: BACKEND_URL,
        BASE_URL: BASE_URL,
        buttonColor: buttonColor
      })]
    });
  };

  exports.GruveEventWidgets = GruveEventWidgets;

}));
//# sourceMappingURL=index.umd.js.map
