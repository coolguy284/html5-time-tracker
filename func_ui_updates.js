function switchPage(page) {
  switch (page) {
    case 'events':
      events_div.style.display = '';
      data_section_div.style.display = 'none';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'data':
      events_div.style.display = 'none';
      data_section_div.style.display = '';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'raw data':
      events_div.style.display = 'none';
      data_section_div.style.display = 'none';
      raw_data_section_div.style.display = '';
      break;
  }
}

function updateRawDataDisplay() {
  // put raw data contents on raw_data_text
  if (localStorage.html5_time_planner_events_arr != null) {
    raw_data_text.value = localStorage.html5_time_planner_events_arr;
    if (raw_data_text.style.display != '') raw_data_text.style.display = '';
  } else {
    if (raw_data_text.style.display != 'none') raw_data_text.style.display = 'none';
    raw_data_text.value = '';
  }
}

function updateDisplay() {
  // put current event on current_event_text
  let currentEventIndex = getLatestVisibleEventIndex();
  
  if (currentEventIndex >= 0) {
    current_event_text.textContent = eventsArr[currentEventIndex][1];
  } else {
    current_event_text.textContent = 'None';
  }
  
  // put array contents on data_div
  let visibleEventsArr = eventsArr.filter(x => x[2]);
  if (visibleEventsArr.length > 0) {
    data_div.textContent = visibleEventsArr.map(x => `${x[0]}: ${x[1]}` + (x.length > 4 ? (DATA_VIEW_ADDL_INFO_BIG_INDENT ? '\n                                      ' : '\n  ') + `Addl. Info: ${x[4]}` : '')).join('\n');
  } else {
    data_div.textContent = 'No Events';
  }
  
  updateRawDataDisplay();
}
