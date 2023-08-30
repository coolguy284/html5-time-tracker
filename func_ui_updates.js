function switchPage(page) {
  switch (page) {
    case 'events':
      events_div.style.display = '';
      data_section_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'data':
      events_div.style.display = 'none';
      data_section_div.style.display = '';
      tables_and_charts_section_div.style.display = 'none';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'tables & charts':
      if (parseWeeksDirtyBit) {
        updateTablesAndChartsSection();
        parseWeeksDirtyBit = false;
      }
      events_div.style.display = 'none';
      data_section_div.style.display = 'none';
      tables_and_charts_section_div.style.display = '';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'raw data':
      events_div.style.display = 'none';
      data_section_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      raw_data_section_div.style.display = '';
      break;
  }
}

function updateDataSectionDisplay() {
  // put array contents on data_div
  let visibleEventsArr = eventsArr.filter(x => x[2]);
  
  if (visibleEventsArr.length > 0) {
    let processedEventsArr;
    
    if (data_section_collapse_duplicates.checked) {
      processedEventsArr = [];
      
      let lastEventName = null;
      for (let event of visibleEventsArr) {
        if (event[1] != lastEventName) {
          processedEventsArr.push(event);
          lastEventName = event[1];
        }
      }
    } else {
      processedEventsArr = visibleEventsArr;
    }
    
    data_div.textContent = processedEventsArr.map(x =>
      `${x[0]}: ${x[1]}` +
      (x.length > 4 ?
        (DATA_VIEW_ADDL_INFO_BIG_INDENT ?
          '\n                                      ' :
          '\n  ') +
        `Addl. Info: ${x[4]}` : '')
    ).join('\n');
  } else {
    data_div.textContent = 'No Events';
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
  
  updateDataSectionDisplay();
  
  updateRawDataDisplay();
}

function removeAllChildren(elem) {
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript/3955238#3955238
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

function removeAllChildrenButOne(elem) {
  while (elem.children.length > 1) {
    elem.removeChild(elem.lastChild);
  }
}

function updateWeekSelect() {
  // clear out select
  removeAllChildren(week_picker_div_select);
  
  for (let weekIndex = 0; weekIndex < parsedWeeks[0].length; weekIndex++) {
    let weekDateString = parsedWeeks[0][weekIndex][0];
    
    let weekOption = document.createElement('option');
    weekOption.textContent = `Week of ${weekDateString}`;
    weekOption.setAttribute('value', weekIndex);
    if (weekIndex == parsedWeeks[0].length - 1) {
      weekOption.setAttribute('selected', '');
    }
    
    week_picker_div_select.appendChild(weekOption);
  }
}

function updateStatsDisplay(statsArr, statsElem) {
  removeAllChildren(statsElem);
  
  for (let entry of statsArr) {
    let spanElem = document.createElement('span');
    spanElem.textContent = `██ ${entry[1].toFixed(3).padStart(6, '0')}% ${entry[0]}`;
    spanElem.style.color = getEventColor(entry[0]);
    
    statsElem.appendChild(spanElem);
  }
}

function updateTableAndWeekStatsDisplay() {
  let weekData = parsedWeeks[0][week_picker_div_select.value];
  
  for (let day = 0; day < 7; day++) {
    let dayData = weekData[1][day];
    let dayTd = tableTds[day];
    
    removeAllChildrenButOne(dayTd);
    
    dayData.forEach(x => {
      let eventDiv = document.createElement('div');
      eventDiv.style.height = `${x[2] / 86_400 * TABLE_DATA_FULL_HEIGHT}rem`;
      eventDiv.style.backgroundColor = getEventColor(x[0]);
      
      dayTd.appendChild(eventDiv);
    });
  }
  
  updateStatsDisplay(weekData[2], stats_div);
}

function updateAllStatsDisplay() {
  updateStatsDisplay(parsedWeeks[1], all_time_stats_div);
}

function updateTablesAndChartsSection() {
  fillParsedWeeks();
  updateWeekSelect();
  updateTableAndWeekStatsDisplay();
  updateAllStatsDisplay();
}
