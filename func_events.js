function addEvent(elem) {
  // get data
  
  let eventTimeDate = new Date();
  let eventTime = dateToFullString(eventTimeDate);
  
  let eventNamesArr = toggleInputs.map(x => x[1].checked ? x[0] : null).filter(x => x);
  
  if (elem.tagName == 'BUTTON') {
    eventNamesArr.push(elem.textContent);
  } else {
    let latestEventIndex = getLatestVisibleEventIndex();
    if (latestEventIndex > -1) {
      let latestEventNameArr = eventsArr[latestEventIndex][1].split(MULTI_EVENT_SPLIT).filter(x => !toggleInputsObject.has(x));
      eventNamesArr.push(...latestEventNameArr);
    }
  }
  
  let eventName = eventNamesArr.length ? eventNamesArr.join(' | ') : 'Nothing';
  
  // add to internal events array
  eventsArr.push([eventTime, eventName, true, false]);
  
  updateEventStorageAndDisplay();
}

function getLatestVisibleEventIndex() {
  for (let i = eventsArr.length - 1; i >= 0; i--) {
    if (eventsArr[i][2]) return i;
  }
  
  return -1;
}

function removeLastEvent() {
  let latestVisibleEventIndex = getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex >= 0) {
    eventsArr[latestVisibleEventIndex][2] = false;
    
    updateEventStorageAndDisplay();
  }
}

function unRemoveLastEvent() {
  let latestVisibleEventIndex = getLatestVisibleEventIndex();
  
  if (eventsArr.length > 0 && latestVisibleEventIndex < eventsArr.length - 1) {
    eventsArr[latestVisibleEventIndex + 1][2] = true;
    
    updateEventStorageAndDisplay();
  }
}

function purgeRemovedEntries() {
  for (let i = eventsArr.length - 1; i >= 0; i--) {
    if (!eventsArr[i][2]) {
      eventsArr.splice(i, 1);
    }
  }
  
  updateEventStorageAndDisplay();
}

function duplicateEventBackwards() {
  let minutesBack = Number(prompt('Minutes back?'));
  
  if (!Number.isFinite(minutesBack) || minutesBack == 0) return;
  
  let latestVisibleEventIndex = getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex <= 0) return;
  
  let lastEvent = eventsArr[latestVisibleEventIndex];
  
  eventsArr.splice(latestVisibleEventIndex, 0, [dateToFullString(new Date(Math.floor(dateStringToDate(lastEvent[0]).getTime() - minutesBack * 60_000))), lastEvent[1], lastEvent[2], true, ...lastEvent.slice(4)]);
  
  updateEventStorageAndDisplay();
}

function setLastEventAnnotation() {
  let annotation = prompt('Annotation?');
  
  if (annotation == null) return;
  
  let latestVisibleEventIndex = getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex <= 0) return;
  
  let lastEvent = eventsArr[latestVisibleEventIndex];
  
  if (annotation.length > 0) {
    lastEvent[4] = annotation;
  } else {
    lastEvent.length = 4;
  }
  
  updateEventStorageAndDisplay();
}
