function switchPage(page) {
  switch (page) {
    case 'events':
      events_div.style.display = '';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = 'none';
      break;
    
    case 'tables & charts':
      if (parseWeeksDirtyBit) {
        updateTablesAndChartsSection();
        parseWeeksDirtyBit = false;
      }
      events_div.style.display = 'none';
      tables_and_charts_section_div.style.display = '';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = 'none';
      break;
    
    case 'data':
      events_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = '';
      extras_section_div.style.display = 'none';
      break;
    
    case 'extras':
      events_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = '';
      break;
  }
}

function switchExtrasPage(page) {
  switch (page) {
    case 'main':
      extras_section_main_page.style.display = '';
      raw_data_section_div.style.display = 'none';
      break;
    
    case 'raw data':
      extras_section_main_page.style.display = 'none';
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
      
      let lastEventName = null, lastEventAnnotation = null;
      for (let event of visibleEventsArr) {
        if (event[1] != lastEventName || event[4] != lastEventAnnotation) {
          processedEventsArr.push(event);
          lastEventName = event[1];
          lastEventAnnotation = event[4];
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

function updateStatsDisplay_Helper(statsArr, statsElem) {
  removeAllChildren(statsElem);
  
  // if collapse event groups is checked, stats should only list event groups not individual events
  if (collapse_event_groups.checked) {
    statsArr = Object.entries(statsArr.map(entry => [getEventGroupSingle(entry[0]), entry[1], entry[2]]).reduce((a, c) => {
      if (c[0] in a) {
        a[c[0]][0] += c[1];
        a[c[0]][1] += c[2];
      } else a[c[0]] = [c[1], c[2]];
      return a;
    }, {})).map(x => [x[0], x[1][0], x[1][1]]).sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
  }
  
  let totalTimeSeconds = 0;
  
  for (let entry of statsArr) {
    let spanElem = document.createElement('span');
    spanElem.textContent = `██ ${entry[1].toFixed(3).padStart(6, '0')}% (${(Math.floor(entry[2] / 3_600) + '').padStart(2, '0')}:${(Math.floor(entry[2] / 60 % 60) + '').padStart(2, '0')}) ${entry[0]}`;
    spanElem.style.color = collapse_event_groups.checked ?
      getEventGroupColor(entry[0]) :
      getEventColor(entry[0]);
    
    statsElem.appendChild(spanElem);
    
    totalTimeSeconds += entry[2];
  }
  
  return totalTimeSeconds;
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
      let eventDivColors = getEventColors(x[0]);
      
      if (eventDivColors.length == 1) {
        eventDiv.style.backgroundColor = eventDivColors[0];
      } else {
        eventDiv.style.background = `repeating-linear-gradient(45deg, ${eventDivColors.map((y, i) => `${y}${i == 0 ? '' : ' ' + TABLE_STRIPE_WIDTH * i + 'rem'}, ${y} ${TABLE_STRIPE_WIDTH * (i + 1)}rem`).join(', ')})`;
      }
      
      dayTd.appendChild(eventDiv);
    });
  }
  
  let totalTimeSeconds = updateStatsDisplay_Helper(weekData[2], stats_div);
  
  total_time_p.textContent = `Total: ${(totalTimeSeconds / 86_400 / 7 * 100).toFixed(3).padStart(6, '0')}% (${(Math.floor(totalTimeSeconds / 3_600) + '').padStart(2, '0')}:${(Math.floor(totalTimeSeconds / 60 % 60) + '').padStart(2, '0')} / 168:00)`;
}

function updateAllStatsDisplay() {
  let totalTimeSeconds = updateStatsDisplay_Helper(parsedWeeks[1], all_time_stats_div);
  
  all_time_total_time_p.textContent = `Total: ${(totalTimeSeconds / 86_400 / 7).toFixed(3)} weeks (${(Math.floor(totalTimeSeconds / 3_600) + '').padStart(2, '0')}:${(Math.floor(totalTimeSeconds / 60 % 60) + '').padStart(2, '0')})`;
}

function updateTablesAndChartsSectionRenderingOnly() {
  updateTableAndWeekStatsDisplay();
  updateAllStatsDisplay();
}

function updateTablesAndChartsSection() {
  fillParsedWeeks();
  updateWeekSelect();
  updateTablesAndChartsSectionRenderingOnly();
}
