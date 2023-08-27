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
  parsedWeeks[0].splice(0, Infinity);
  
  if (eventsArr.length == 0) return;
  
  let alteredEventsArr = [[dateToFullString(new Date('2023-08-05T00:00:00.000Z')), 'Programmatic Unlogged'], ...eventsArr, [dateToFullString(new Date()), 'Programmatic Unlogged']];
  
  let firstWeekMilliseconds = getBeginningOfWeekMilliseconds(eventsArr[0][0]);
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
      
      for (let eventIndex = eventDayStartingIndex - 1; eventIndex < eventDayEndingIndex + 1; eventIndex++) {
        let eventStartMilliseconds = dateStringToDate(alteredEventsArr[eventIndex][0]).getTime();
        let eventEndMilliseconds = dateStringToDate(alteredEventsArr[eventIndex + 1][0]).getTime();
        
        let eventStartMillisecondsRelative = Math.max(eventStartMilliseconds - dayStartMilliseconds, 0);
        let eventEndMillisecondsRelative = Math.min(eventEndMilliseconds - dayStartMilliseconds, 86_400_000);
        
        dayArray.push([
          alteredEventsArr[eventIndex][1],
          eventStartMillisecondsRelative / 1_000,
          (eventEndMillisecondsRelative - eventStartMillisecondsRelative) / 1_000,
        ]);
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
      .map(x => [x[0], x[1] / 86_400_000 / 7 * 100])
      .sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
    
    parsedWeeks[0].push([weekStartDateStr, daysArray, weeklyPercentagesArray]);
  }
  
  parsedWeeks[0].forEach(x => normalizePercentagesArray(x[2]));
  
  let totalEventWeeklyPercentages = {};
  
  parsedWeeks[0].forEach(x => x[2].forEach(y => {
    if (y[0] in totalEventWeeklyPercentages)
      totalEventWeeklyPercentages[y[0]] += y[1];
    else
      totalEventWeeklyPercentages[y[0]] = y[1];
  }));
  
  let totalPercentagesArray = Object.entries(totalEventWeeklyPercentages)
    .map(x => [x[0], x[1] / parsedWeeks[0].length])
    .sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
  
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
