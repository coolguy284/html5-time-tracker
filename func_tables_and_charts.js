function getBeginningOfWeekMilliseconds(dateStr) {
  let dateObject = dateStringToDate(dateStr);
  let dayOfWeek = dateObject.getDay();
  return new Date(dateStr.split(' ')[0] + ' 00:00').getTime() - dayOfWeek * 86_400_000;
}

function normalizePercentagesArray(percentageArr) {
  let totalPercent = percentageArr.reduce((a, c) => a + c[1], 0);
  let percentFactor = 100 / totalPercent;
  
  percentageArr.forEach(x => x[1] *= percentFactor);
}

function fillParsedWeeks() {
  if (getLatestVisibleEventIndex() == -1) {
    parsedWeeks = [
      [
        [
          dateToDateString(new Date()),
          [[], [], [], [], [], [], []],
          [],
        ]
      ],
      [],
    ];
    return;
  }
  
  parsedWeeks[0].splice(0, Infinity);
  
  // preliminary filter of events array to only have visible events, and to ignore events where a future event has a smaller date/time than a past one
  let preAlteredEventsArr = eventsArr
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
  
  let alteredEventsArr = [[dateToFullString(new Date(dateStringToDate(preAlteredEventsArr[0][0]).getTime() - 86_400_000 * 7)), 'Programmatic Unlogged'], ...preAlteredEventsArr, [dateToFullString(new Date()), 'Programmatic Unlogged']];
  
  let firstWeekMilliseconds = getBeginningOfWeekMilliseconds(preAlteredEventsArr[0][0]);
  let totalWeeks = (getBeginningOfWeekMilliseconds(alteredEventsArr[alteredEventsArr.length - 1][0]) - firstWeekMilliseconds) / 86_400_000 / 7 + 1;
  
  alteredEventsArr.push([dateToFullString(new Date(Date.now() + 86_400_000 * 7)), 'Programmatic Unlogged']);
  
  for (let week = 0; week < totalWeeks; week++) {
    let weekMilliseconds = firstWeekMilliseconds + week * 86_400_000 * 7;
    let weekStartDate = new Date(weekMilliseconds);
    
    let weekStartDateStr = dateToDateString(weekStartDate);
    
    let daysArray = [];
    
    for (let day = 0; day < 7; day++) {
      let dayStartMilliseconds = weekMilliseconds + day * 86_400_000;
      let dayEndMilliseconds = dayStartMilliseconds + 86_400_000;
      
      let eventDayStartingIndex;
      for (eventDayStartingIndex = 0; eventDayStartingIndex < alteredEventsArr.length; eventDayStartingIndex++) {
        if (dateStringToDate(alteredEventsArr[eventDayStartingIndex][0]).getTime() > dayStartMilliseconds) break;
      }
      
      let eventDayEndingIndex;
      for (eventDayEndingIndex = eventDayStartingIndex; eventDayEndingIndex < alteredEventsArr.length; eventDayEndingIndex++) {
        if (dateStringToDate(alteredEventsArr[eventDayEndingIndex][0]).getTime() > dayEndMilliseconds) break;
      }
      eventDayEndingIndex -= 1;
      
      let dayArray = [];
      
      let lastEventName = null;
      
      for (let eventIndex = eventDayStartingIndex - 1; eventIndex < eventDayEndingIndex + 1; eventIndex++) {
        let eventName = alteredEventsArr[eventIndex][1];
        
        if (eventName == lastEventName) {
          let eventStartMilliseconds = dateStringToDate(alteredEventsArr[eventIndex][0]).getTime();
          let eventEndMilliseconds = dateStringToDate(alteredEventsArr[eventIndex + 1][0]).getTime();
          
          let eventStartMillisecondsRelative = Math.max(eventStartMilliseconds - dayStartMilliseconds, 0);
          let eventEndMillisecondsRelative = Math.min(eventEndMilliseconds - dayStartMilliseconds, 86_400_000);
          
          //if ((eventEndMillisecondsRelative - eventStartMillisecondsRelative) / 1_000 < 0) console.log(`adding negative event delta week:${week} day:${day} eventIndex:${eventIndex}`);
          
          dayArray[dayArray.length - 1][2] += (eventEndMillisecondsRelative - eventStartMillisecondsRelative) / 1_000;
        } else {
          let eventStartMilliseconds = dateStringToDate(alteredEventsArr[eventIndex][0]).getTime();
          let eventEndMilliseconds = dateStringToDate(alteredEventsArr[eventIndex + 1][0]).getTime();
          
          let eventStartMillisecondsRelative = Math.max(eventStartMilliseconds - dayStartMilliseconds, 0);
          let eventEndMillisecondsRelative = Math.min(eventEndMilliseconds - dayStartMilliseconds, 86_400_000);
          
          //if ((eventEndMillisecondsRelative - eventStartMillisecondsRelative) / 1_000 < 0) console.log(`creating negative event week:${week} day:${day} eventIndex:${eventIndex}`);
          
          dayArray.push([
            eventName,
            eventStartMillisecondsRelative / 1_000,
            (eventEndMillisecondsRelative - eventStartMillisecondsRelative) / 1_000,
          ]);
          
          lastEventName = eventName;
        }
      }
      
      daysArray.push(dayArray);
    }
    
    let weeklyEventDurations = {};
    
    daysArray.forEach(x =>
      x.forEach(y => {
        if (y[0] == 'Programmatic Unlogged') return;
        if (y[0] in weeklyEventDurations)
          weeklyEventDurations[y[0]] += y[2];
        else
          weeklyEventDurations[y[0]] = y[2];
      })
    );
    
    let weeklyPercentagesArray = Object.entries(weeklyEventDurations)
      .map(x => [x[0], x[1] / 86_400 / 7 * 100, x[1]])
      .sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
    
    parsedWeeks[0].push([weekStartDateStr, daysArray, weeklyPercentagesArray]);
  }
  
  let totalEventWeeklyPercentages = {};
  
  parsedWeeks[0].forEach(x => x[2].forEach(y => {
    if (y[0] in totalEventWeeklyPercentages) {
      totalEventWeeklyPercentages[y[0]][0] += y[1];
      totalEventWeeklyPercentages[y[0]][1] += y[2];
    } else {
      totalEventWeeklyPercentages[y[0]] = [y[1], y[2]];
    }
  }));
  
  let totalPercentagesArray = Object.entries(totalEventWeeklyPercentages)
    .map(x => [x[0], x[1][0] / parsedWeeks[0].length, x[1][1]]) // this division isn't really needed because of the normalization that occurs immediately after
    .sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
  
  parsedWeeks[0].forEach(x => normalizePercentagesArray(x[2]));
    
  normalizePercentagesArray(totalPercentagesArray);
  
  parsedWeeks[1] = totalPercentagesArray;
}

function decreaseWeek() {
  if (week_picker_div_select.value > 0) {
    week_picker_div_select.value--;
    updateTableAndWeekStatsDisplay();
  }
}

function increaseWeek() {
  if (week_picker_div_select.value < parsedWeeks[0].length - 1) {
    week_picker_div_select.value++;
    updateTableAndWeekStatsDisplay();
  }
}
