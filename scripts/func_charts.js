function getBeginningOfDayMilliseconds(dateStr) {
  return new Date(dateStr.split(' ')[0] + ' 00:00').getTime();
}

function getBeginningOfWeekMilliseconds(dateStr) {
  let dateObject = new Date(dateStr + ' 00:00');
  
  let dayOfWeek = dateObject.getDay();
  
  dateObject.setDate(dateObject.getDate() - dayOfWeek);
  
  return getBeginningOfDayMilliseconds(dateToDateString(dateObject));
}

function getBeginningOfMonthMilliseconds(dateStr) {
  let dateObject = new Date(dateStr + ' 00:00');
  
  dateObject.setDate(1);
  
  return getBeginningOfDayMilliseconds(dateToDateString(dateObject));
}

function getBeginningOfYearMilliseconds(dateStr) {
  let dateObject = new Date(dateStr + ' 00:00');
  
  dateObject.setMonth(0);
  dateObject.setDate(1);
  
  return getBeginningOfDayMilliseconds(dateToDateString(dateObject));
}

function normalizePercentagesArray(percentageArr) {
  let totalPercent = percentageArr.reduce((a, c) => a + c[1], 0);
  let percentFactor = 100 / totalPercent;
  
  percentageArr.forEach(x => x[1] *= percentFactor);
}

function fillParsedDays(eventsArr) {
  if (eventsArr.length == 0) {
    let now = new Date();
    let nowDateString = dateToDateString(now);
    
    parsedEvents.day_events = new Map([
      [nowDateString, []],
    ]);
    return;
  }
  
  parsedEvents.day_events.clear();
  
  let firstDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[0][0]);
  let lastDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[eventsArr.length - 1][0]);
  let totalDays = Math.round((lastDayStartingMillis - firstDayStartingMillis) / 1000 / 3600 / 24) + 1; // rounding due to daylight savings changes
  
  let currentEventIndex = 0;
  let currentMillis = firstDayStartingMillis;
  let eventEndMillis;
  
  for (let day = 0; day < totalDays; day++) {
    let dayMiddleMillis = firstDayStartingMillis + 24 * 3600 * 1000 * day + 12 * 3600 * 1000;
    let dayStartMillis = getBeginningOfDayMilliseconds(dateToDateString(new Date(dayMiddleMillis)));
    let nextDayMiddleMillis = dayMiddleMillis + 24 * 3600 * 1000;
    let dayString = dateToDateString(new Date(dayMiddleMillis));
    let nextDayStartMillis = getBeginningOfDayMilliseconds(dateToDateString(new Date(nextDayMiddleMillis)));
    
    let dayEvents = [];
    
    if (eventsArr[currentEventIndex] && eventsArr[currentEventIndex - 1] && dateStringToDate(eventsArr[currentEventIndex][0]).getTime() > dayStartMillis) {
      dayEvents.push([
        eventsArr[currentEventIndex - 1][1],
        0,
        (Math.min(eventEndMillis, nextDayStartMillis) - dayStartMillis) / 1000,
      ]);
    }
    
    while (currentMillis < nextDayStartMillis && currentEventIndex < eventsArr.length) {
      let currentEvent = eventsArr[currentEventIndex];
      let nextEvent = eventsArr[currentEventIndex + 1];
      let eventStartMillis = dateStringToDate(currentEvent[0]).getTime();
      eventEndMillis = nextEvent != null ? dateStringToDate(nextEvent[0]).getTime() : eventStartMillis;
      
      dayEvents.push([
        currentEvent[1],
        (eventStartMillis - dayStartMillis) / 1000,
        (Math.min(eventEndMillis, nextDayStartMillis) - eventStartMillis) / 1000,
      ]);
      
      currentMillis = eventEndMillis;
      currentEventIndex++;
    }
    
    // merge duplicates and trim zero length events
    
    dayEvents = dayEvents
      .filter(x => x[2] > 0)
      .reduce((a, c) => {
        if (a.length > 0) {
          let lastC = a[a.length - 1];
          
          if (lastC[0] == c[0]) {
            lastC[2] += c[2];
          } else {
            a.push(c);
          }
        } else {
          a.push(c);
        }
        
        return a;
      }, []);
    
    parsedEvents.day_events.set(dayString, dayEvents);
  }
}

function getEventStatsMap(startDayMiddleMillis, days) {
  let eventDurations = new Map();
  
  // tally up event durations for each day
  if (startDayMiddleMillis != null) {
    for (let day = 0; day < days; day++) {
      let dayMiddleMillis = startDayMiddleMillis + 24 * 3600 * 1000 * day;
      let dayString = dateToDateString(new Date(dayMiddleMillis));
      
      let dayEvents = parsedEvents.day_events.get(dayString);
      
      if (dayEvents != null) {
        for (let event of dayEvents) {
          if (eventDurations.has(event[0])) {
            eventDurations.set(event[0], eventDurations.get(event[0]) + event[2]);
          } else {
            eventDurations.set(event[0], event[2]);
          }
        }
      }
    }
  } else {
    for (let dayEventEntry of parsedEvents.day_events) {
      let dayEvents = dayEventEntry[1];
      for (let event of dayEvents) {
        if (eventDurations.has(event[0])) {
          eventDurations.set(event[0], eventDurations.get(event[0]) + event[2]);
        } else {
          eventDurations.set(event[0], event[2]);
        }
      }
    }
  }
  
  // calculate total seconds
  let totalSeconds = 0;
  
  for (let entry of eventDurations) {
    totalSeconds += entry[1];
  }
  
  // convert event durations to percentage of total
  for (let entry of eventDurations) {
    eventDurations.set(entry[0], [entry[1], entry[1] / totalSeconds * 100]);
  }
  
  return eventDurations;
}

function eventStatsMapToArr(eventStatsMap) {
  return Array.from(eventStatsMap)
    .map(x => x.flat())
    .sort((a, b) => b[1] - a[1]); // reversed order
}

function fillParsedWeeks(eventsArr) {
  if (eventsArr.length == 0) {
    let now = new Date();
    let nowDateString = dateToDateString(now);
    let beginningOfWeekMillis = getBeginningOfWeekMilliseconds(nowDateString);
    let beginningOfWeekDateString = dateToDateString(new Date(beginningOfWeekMillis));
    
    parsedEvents.weekly_stats = [
      [beginningOfWeekDateString, []]
    ];
    return;
  }
  
  parsedEvents.weekly_stats.splice(0, Infinity);
  
  let firstDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[0][0]);
  let firstWeekStartingMillis = getBeginningOfWeekMilliseconds(dateToDateString(new Date(firstDayStartingMillis)));
  let lastDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[eventsArr.length - 1][0]);
  let lastWeekStartingMillis = getBeginningOfWeekMilliseconds(dateToDateString(new Date(lastDayStartingMillis)));
  let totalWeeks = Math.round((lastWeekStartingMillis - firstWeekStartingMillis) / 1000 / 3600 / 24 / 7) + 1; // rounding due to daylight savings changes
  
  for (let week = 0; week < totalWeeks; week++) {
    let weekMiddleMillis = firstWeekStartingMillis + 7 * 24 * 3600 * 1000 * week + 12 * 3600 * 1000;
    let weekStartDateStr = dateToDateString(new Date(weekMiddleMillis));
    
    parsedEvents.weekly_stats.push([
      weekStartDateStr,
      eventStatsMapToArr(getEventStatsMap(weekMiddleMillis, 7)),
    ]);
  }
}

function fillParsedMonths(eventsArr) {
  if (eventsArr.length == 0) {
    let now = new Date();
    let nowDateString = dateToDateString(now);
    let beginningOfMonthMillis = getBeginningOfMonthMilliseconds(nowDateString);
    let beginningOfMonthDateString = dateToDateString(new Date(beginningOfMonthMillis));
    
    parsedEvents.monthly_stats = [
      [beginningOfMonthDateString, []]
    ];
    return;
  }
  
  parsedEvents.monthly_stats.splice(0, Infinity);
  
  let firstDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[0][0]);
  let firstMonthStartingMillis = getBeginningOfMonthMilliseconds(dateToDateString(new Date(firstDayStartingMillis)));
  let lastDayStartingMillis = getBeginningOfDayMilliseconds(eventsArr[eventsArr.length - 1][0]);
  let lastMonthStartingMillis = getBeginningOfMonthMilliseconds(dateToDateString(new Date(lastDayStartingMillis)));
  let totalMonths = Math.round((lastMonthStartingMillis - firstMonthStartingMillis) / 1000 / 3600 / 24 / (365.2425 / 12)) + 1; // rounding due to daylight savings changes
  
  for (let month = 0; month < totalMonths; month++) {
    let monthMiddleMillis = firstMonthStartingMillis + (365.2425 / 12) * 24 * 3600 * 1000 * month + 12 * 3600 * 1000 + (365.2425 / 12) * 24 * 1000 * 0.5;
    let monthStartMillis = getBeginningOfMonthMilliseconds(dateToDateString(new Date(monthMiddleMillis)));
    let monthEndMilis = getBeginningOfMonthMilliseconds(dateToDateString(new Date(monthMiddleMillis + (365.2425 / 12) * 24 * 3600 * 1000)));
    let monthStartDateStr = dateToDateString(new Date(monthStartMillis));
    let monthDays = Math.round((monthEndMilis - monthStartMillis) / 24 / 3600 / 1000);
    
    parsedEvents.monthly_stats.push([
      monthStartDateStr,
      eventStatsMapToArr(getEventStatsMap(weekMiddleMillis, monthDays)),
    ]);
  }
}

function fillParsedAllTime(eventsArr) {
  if (eventsArr.length == 0) {
    parsedEvents.all_time_stats = [];
    return;
  }
  
  parsedEvents.all_time_stats = eventStatsMapToArr(getEventStatsMap());
}

async function fillParsedEvents() {
  // preliminary filter of events array to only have visible events, and to ignore events where a future event has a smaller date/time than a past one
  let eventsArr =
    (await eventManager.getAllEvents())
    .filter(x => x[2])
    .reduceRight((a, c) => {
      if (a.length == 0) {
        a.push(c);
        return a;
      } else {
        let futureEvent = a[a.length - 1]; // accessing backwards for future event because array is reversed
        let futureEventTime = dateStringToDate(futureEvent[0]).getTime();
        let currentEventTime = dateStringToDate(c[0]).getTime();
        if (currentEventTime > futureEventTime) {
          return a;
        } else {
          a.push(c);
          return a;
        }
      }
    }, []).reverse();
  
  eventsArr.push([dateToFullString(new Date()), EVENT_NOTHING]);
  
  fillParsedDays(eventsArr);
  fillParsedWeeks(eventsArr);
  //fillParsedMonths(eventsArr);
  fillParsedAllTime(eventsArr);
}

function decreaseWeek() {
  if (week_picker_div_select.value > 0) {
    week_picker_div_select.value--;
    updateTableAndWeekStatsDisplay();
  }
}

function increaseWeek() {
  if (week_picker_div_select.value < parsedEvents.weekly_stats.length - 1) {
    week_picker_div_select.value++;
    updateTableAndWeekStatsDisplay();
  }
}
