function updateEventStorage() {
  // save array to localstorage, or wipe localstorage entry if array empty and localstorage entry exists
  if (eventsArr.length == 0) {
    if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] != null) {
      delete localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    }
  } else {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = JSON.stringify(eventsArr);
  }
}

function updateEventStorageAndDisplay() {
  updateEventStorage();
  updateDisplay();
  
  parseWeeksDirtyBit = true; // messy but works
}
