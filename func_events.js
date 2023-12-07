function addEvent(elem) {
  // get data
  
  let eventTime = new Date();
  
  let eventNamesArr = toggleInputs.map(x => x[1].checked ? x[0] : null).filter(x => x);
  
  if (elem.tagName == 'BUTTON') {
    let eventName;
    
    switch (elem.dataset.type) {
      case 'normal':
        eventName = elem.dataset.event;
        break;
      
      case 'one time custom':
        eventName = prompt('Event name?');
        
        if (eventName == null) return;
        break;
      
      case 'custom': {
        eventName = prompt('Event name?');
        
        if (eventName == null) return;
        
        let categoryPath = 'categoryPath' in elem.dataset ? JSON.parse(elem.dataset.categoryPath) : [];
        
        addEventButtonIfNotAlready(eventName, categoryPath);
        break;
      }
    }
    
    if (eventName == EVENT_UNLOGGED) {
      eventNamesArr = [EVENT_UNLOGGED];
    } else if (eventName != EVENT_NOTHING) {
      eventNamesArr.push(eventName);
    }
  } else {
    let latestEventIndex = eventStorage.getLatestVisibleEventIndex();
    if (latestEventIndex > -1) {
      let latestEventNameArr = eventStorage.getEventByIndex(latestEventIndex)[1].split(MULTI_EVENT_SPLIT).filter(x => !(x in toggleInputsObject));
      if (latestEventNameArr.length > 1) {
        eventNamesArr.push(...latestEventNameArr);
      } else if (latestEventNameArr.length == 1) {
        if (latestEventNameArr[0] == EVENT_UNLOGGED) {
          eventNamesArr = [EVENT_UNLOGGED];
        } else if (latestEventNameArr[0] != EVENT_NOTHING) {
          eventNamesArr.push(...latestEventNameArr);
        }
      }
    }
  }
  
  let eventName = eventNamesArr.length ? eventNamesArr.join(MULTI_EVENT_SPLIT) : EVENT_NOTHING;
  
  // add to internal events array
  eventStorage.addEvent(eventName, eventTime);
}

function removeLastEvent() {
  let latestVisibleEventIndex = eventStorage.getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex >= 0) {
    let eventEntry = eventStorage.getEventByIndex(latestVisibleEventIndex);
    eventEntry[2] = false;
    eventStorage.setEventAtIndex(latestVisibleEventIndex, eventEntry);
  }
}

function unRemoveLastEvent() {
  let latestVisibleEventIndex = eventStorage.getLatestVisibleEventIndex();
  
  if (eventStorage.getNumEvents() > 0 && latestVisibleEventIndex < eventStorage.getNumEvents() - 1) {
    let eventEntry = eventStorage.getEventByIndex(latestVisibleEventIndex + 1);
    eventEntry[2] = true;
    eventStorage.setEventAtIndex(latestVisibleEventIndex + 1, eventEntry);
  }
}

// removes events that are invisible
function purgeRemovedEntries(suppressUIUpdate) {
  if (!suppressUIUpdate && !confirm('Are you sure?')) return;
  
  for (let i = eventStorage.getNumEvents() - 1; i >= 0; i--) {
    if (!eventStorage.getEventByIndex(i)[2]) {
      eventStorage.removeEventAtIndex(i);
    }
  }
}

// removes events where a future event has a smaller date/time than a past one
function purgeBacktemporalEntries(suppressUIUpdate) {
  if (!suppressUIUpdate && !confirm('Are you sure?')) return;
  
  eventStorage.setAllEvents(
    eventStorage.getAllEvents()
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
      }, [])
      .reverse()
  );
}

function bothPurgeEntries() {
  if (!confirm('Are you sure?')) return;
  
  purgeRemovedEntries(true);
  purgeBacktemporalEntries(true);
}

function duplicateEventBackwards() {
  let minutesBack = Number(prompt('Minutes back?'));
  
  if (!Number.isFinite(minutesBack) || minutesBack == 0) return;
  
  let latestVisibleEventIndex = eventStorage.getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex <= 0) return;
  
  let lastEvent = eventStorage.getEventByIndex(latestVisibleEventIndex);
  
  eventStorage.spliceAndAddEvents(
    latestVisibleEventIndex,
    0,
    [dateToFullString(new Date(Math.floor(dateStringToDate(lastEvent[0]).getTime() - minutesBack * 60_000))), lastEvent[1], lastEvent[2], true, ...lastEvent.slice(4)]
  );
}

function setLastEventAnnotation() {
  let annotation = prompt('Annotation?');
  
  if (annotation == null) return;
  
  let latestVisibleEventIndex = eventStorage.getLatestVisibleEventIndex();
  
  if (latestVisibleEventIndex <= 0) return;
  
  let lastEvent = eventStorage.getEventByIndex(latestVisibleEventIndex);
  
  if (annotation.length > 0) {
    lastEvent[4] = annotation;
  } else {
    lastEvent.length = 4;
  }
  
  eventStorage.setEventAtIndex(latestVisibleEventIndex, lastEvent);
}

function updateStorageVersion() {
  switch (storage_version_select.value) {
    case 'V1':
      eventStorage.setMediumVer({
        major: 1,
        minor: 0,
        binary: false,
      });
      break;
    
    case 'V2':
      eventStorage.setMediumVer({
        major: 2,
        minor: 0,
        binary: false,
      });
      break;
  }
}
