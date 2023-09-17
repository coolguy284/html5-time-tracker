function addEvent(elem) {
  // get data
  
  let eventTimeDate = new Date();
  let eventTime = dateToFullString(eventTimeDate);
  
  let eventNamesArr = toggleInputs.map(x => x[1].checked ? x[0] : null).filter(x => x);
  
  if (elem.tagName == 'BUTTON') {
    if (elem.textContent == 'Unlogged') {
      eventNamesArr = ['Unlogged'];
    } else if (elem.textContent != 'Nothing') {
      eventNamesArr.push(elem.textContent);
    }
  } else {
    let latestEventIndex = getLatestVisibleEventIndex();
    if (latestEventIndex > -1) {
      let latestEventNameArr = eventsArr[latestEventIndex][1].split(MULTI_EVENT_SPLIT).filter(x => !(x in toggleInputsObject));
      if (latestEventNameArr.length > 1) {
        eventNamesArr.push(...latestEventNameArr);
      } else if (latestEventNameArr.length == 1) {
        if (latestEventNameArr[0] == 'Unlogged') {
          eventNamesArr = ['Unlogged'];
        } else if (latestEventNameArr[0] != 'Nothing') {
          eventNamesArr.push(...latestEventNameArr);
        }
      }
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

// removes events that are invisible
function purgeRemovedEntries(suppressUIUpdate) {
  if (!suppressUIUpdate && !confirm('Are you sure?')) return;
  
  for (let i = eventsArr.length - 1; i >= 0; i--) {
    if (!eventsArr[i][2]) {
      eventsArr.splice(i, 1);
    }
  }
  
  if (!suppressUIUpdate) updateEventStorageAndDisplay();
}

// removes events where a future event has a smaller date/time than a past one
function purgeBacktemporalEntries(suppressUIUpdate) {
  if (!suppressUIUpdate && !confirm('Are you sure?')) return;
  
  eventsArr = eventsArr
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
  
  if (!suppressUIUpdate) updateEventStorageAndDisplay();
}

function bothPurgeEntries() {
  if (!confirm('Are you sure?')) return;
  
  purgeRemovedEntries(true);
  purgeBacktemporalEntries(true);
  
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
