function getPseudoRawDataFromStorage() {
  let events = eventStorage.getAllEvents();
  
  let maxEventsShown = editPageEventsShown.get();
  
  if (!Number.isSafeInteger(maxEventsShown)) {
    maxEventsShown = Infinity;
  }
  
  if (maxEventsShown < 0) {
    maxEventsShown = 0;
  }
  
  if (events.length > maxEventsShown) {
    let elidedNum = events.length - maxEventsShown;
    
    events = [
      `<${elidedNum} event${elidedNum != 1 ? 's' : ''} elided>`,
      ...events.slice(elidedNum),
    ];
  }
  
  return {
    eventButtons: eventStorage.getEventButtons(),
    eventPriorities: eventStorage.getEventPriorities(),
    eventMappings: eventStorage.getEventMappings(),
    events,
  };
}

function setPseudoRawDataInStorage(pseudoRawData) {
  eventStorage.setEventButtons(pseudoRawData.eventButtons);
  eventStorage.setEventPriorities(pseudoRawData.eventPriorities);
  eventStorage.setEventMappings(pseudoRawData.eventMappings);
  
  if (typeof pseudoRawData.events[0] == 'string') {
    let match = /^<(\d+) events? elided>$/.exec(pseudoRawData.events[0]);
    
    let startIndex = parseInt(match[1]);
    
    if (Number.isSafeInteger(startIndex)) {
      eventStorage.spliceAndAddEvents(startIndex, Infinity, pseudoRawData.events.slice(1));
    } else {
      alert('Index elided statement invalid');
    }
  } else {
    eventStorage.setAllEvents(pseudoRawData.events);
  }
}

function setPseudoRawData() {
  let parsedJson;
  
  try {
    parsedJson = JSON.parse(pseudo_raw_data_text.value);
  } catch {
    alert('JSON invalid');
  }
  
  setPseudoRawDataInStorage(parsedJson);
}

function reloadPseudoRawData() {
  pseudo_raw_data_text.value = prettifyJson(getPseudoRawDataFromStorage());
}

function editPageScrollToTop() {
  scrollToTop(pseudo_raw_data_text);
}

function editPageScrollToBottom() {
  scrollToBottom(pseudo_raw_data_text);
}
