function addEvent(button_elem) {
  // get data
  let eventTimeDate = new Date();
  let eventTime = dateToFullString(eventTimeDate);
  let eventName = button_elem.textContent;
  
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
