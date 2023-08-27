function updateEventStorage() {
  // save array to localstorage, or wipe localstorage entry if array empty and localstorage entry exists
  if (eventsArr.length == 0) {
    if (localStorage.html5_time_planner_events_arr != null) {
      delete localStorage.html5_time_planner_events_arr;
    }
  } else {
    localStorage.html5_time_planner_events_arr = JSON.stringify(eventsArr);
  }
}

function updateEventStorageAndDisplay() {
  updateEventStorage();
  updateDisplay();
  
  parseWeeksDirtyBit = true; // messy but works
}
