function getBeginningOfWeekMilliseconds(dateStr) {
  let dateObject = new Date(dateStr);
  let dayOfWeek = dateObject.getDay();
  return new Date(dateStr.split(' ')[0]).getTime() - dayOfWeek * 86_400_000;
}

function fillParsedWeeks() {
  parsedWeeks[0].splice(0, Infinity);
  
  if (eventsArr.length == 0) return;
  
  let alteredEventsArr = [...eventsArr, [dateToFullString(new Date()), 'Nothing']];
  
  let firstWeekMilliseconds = getBeginningOfWeekMilliseconds(alteredEventsArr[0][0]);
  let totalWeeks = (getBeginningOfWeekMilliseconds(alteredEventsArr[alteredEventsArr.length - 1][0]) - firstWeekMilliseconds) / 86_400_000 / 7;
  
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
        if (new Date(alteredEventsArr[eventDayStartingIndex][0]).getTime() > dayStartMilliseconds) break;
      }
      
      let eventDayEndingIndex;
      for (eventDayEndingIndex = eventDayStartingIndex; eventDayEndingIndex < alteredEventsArr.length; eventDayEndingIndex++) {
        if (new Date(alteredEventsArr[eventDayEndingIndex][0]).getTime() > dayEndMilliseconds) break;
      }
      eventDayEndingIndex -= 1;
      
      let dayArray = [];
      
      for (let eventIndex = eventDayStartingIndex - 1; eventIndex < eventDayEndingIndex; eventIndex++) {
        let eventStartMilliseconds = new Date(eventsArr[eventIndex][0]).getTime();
        let eventEndMilliseconds = new Date(eventsArr[eventIndex + 1][0]).getTime()
        
        dayArray.push([
          eventsArr[eventIndex][1],
          Math.max(eventStartMilliseconds - dayStartMilliseconds, 0) / 1_000,
          (eventEndMilliseconds - eventStartMilliseconds) / 1_000,
        ]);
      }
      
      daysArray.push(dayArray);
    }
    
    let weeklyEventDurations = {};
    
    daysArray.forEach(x =>
      x.forEach(y => {
        if (y[0] in weeklyEventDurations)
          weeklyEventDurations[y[0]] += y[2];
        else
          weeklyEventDurations[y[0]] = y[2];
      })
    );
    
    let weeklyPercentagesArray = Object.entries(weeklyEventDurations)
      .map(x => [x[0], x[1] / 86_400_000 / 7 * 100])
      .sort((a, b) => a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0);
    
    parsedWeeks[0].push([weekStartDateStr, daysArray, weeklyPercentagesArray]);
  }
  
  let totalEventWeeklyPercentages = {};
  
  parsedWeeks[0].forEach(x => x[2].forEach(y => {
    if (y[0] in totalEventWeeklyPercentages)
      totalEventWeeklyPercentages[y[0]] += y[1];
    else
      totalEventWeeklyPercentages[y[0]] = y[1];
  }));
  
  let totalPercentagesArray = Object.entries(totalEventWeeklyPercentages)
    .map(x => [x[0], x[1] / parsedWeeks[0].length])
    .sort((a, b) => a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0);
  
  parsedWeeks[1] = totalPercentagesArray;
}

function decreaseWeek() {
  if (week_picker_div_select.value > 0) {
    week_picker_div_select.value--;
    updateTableAndWeekStatsDisplay();
  }
}

function increaseWeek() {
  if (week_picker_div_select.value < parsedWeeks.length - 1) {
    week_picker_div_select.value++;
    updateTableAndWeekStatsDisplay();
  }
}
