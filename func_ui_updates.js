function switchPage(page) {
  switch (page) {
    case 'events':
      events_div.style.display = '';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = 'none';
      
      events_div_button.classList.add('current_tab');
      tables_and_charts_div_button.classList.remove('current_tab');
      data_div_button.classList.remove('current_tab');
      extras_div_button.classList.remove('current_tab');
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
      
      events_div_button.classList.remove('current_tab');
      tables_and_charts_div_button.classList.add('current_tab');
      data_div_button.classList.remove('current_tab');
      extras_div_button.classList.remove('current_tab');
      break;
    
    case 'data':
      events_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = '';
      extras_section_div.style.display = 'none';
      
      events_div_button.classList.remove('current_tab');
      tables_and_charts_div_button.classList.remove('current_tab');
      data_div_button.classList.add('current_tab');
      extras_div_button.classList.remove('current_tab');
      break;
    
    case 'extras':
      events_div.style.display = 'none';
      tables_and_charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = '';
      
      events_div_button.classList.remove('current_tab');
      tables_and_charts_div_button.classList.remove('current_tab');
      data_div_button.classList.remove('current_tab');
      extras_div_button.classList.add('current_tab');
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
  let visibleEventsArr = eventStorage.getAllEvents().filter(x => x[2]);
  
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
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] != null) {
    raw_data_text.value = localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    if (raw_data_text.style.display != '') raw_data_text.style.display = '';
  } else {
    if (raw_data_text.style.display != 'none') raw_data_text.style.display = 'none';
    raw_data_text.value = '';
  }
}

function updateCurrentEventButtonHighlight() {
  if (currentEvent != currentHighlightedEvent) {
    let currentHighlightedEventSplit = new Set((currentHighlightedEvent ?? '').split(MULTI_EVENT_SPLIT));
    let currentEventSplit = new Set((currentEvent ?? '').split(MULTI_EVENT_SPLIT));
    for (highlightedEvent of currentHighlightedEventSplit) {
      if (!currentEventSplit.has(highlightedEvent) && highlightedEvent in eventButtons) {
        eventButtons[highlightedEvent].classList.remove('current_event');
      }
    }
    for (newEvent of currentEventSplit) {
      if (!currentHighlightedEventSplit.has(newEvent) && newEvent in eventButtons) {
        eventButtons[newEvent].classList.add('current_event');
      }
    }
    currentHighlightedEvent = currentEvent;
  }
}

function updateDisplay() {
  // put current event on current_event_text and highlight buttons and toggles
  let currentEventIndex = eventStorage.getLatestVisibleEventIndex();
  
  if (currentEventIndex >= 0) {
    currentEvent = eventStorage.getEventByIndex(currentEventIndex)[1];
  } else {
    currentEvent = 'None';
  }
  
  current_event_text.textContent = currentEvent;
  
  updateDataSectionDisplay();
  
  updateRawDataDisplay();
  
  updateCurrentEventButtonHighlight();
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
    
    let spanElemColorBlock = document.createElement('span');
    spanElemColorBlock.style.minWidth = `${STATS_ENTRY_COLOR_BLOCK_WIDTH}rem`;
    
    let spanElemTextNode = document.createTextNode(`${entry[1].toFixed(3).padStart(6, '0')}% (${(Math.floor(entry[2] / 3_600) + '').padStart(2, '0')}:${(Math.floor(entry[2] / 60 % 60) + '').padStart(2, '0')}) ${entry[0]}`);
    
    spanElem.appendChild(spanElemColorBlock);
    spanElem.appendChild(spanElemTextNode);
    
    let expectedColor = collapse_event_groups.checked ?
      getEventGroupColor(entry[0]) :
      getEventColor(entry[0]);
    
    spanElemColorBlock.style.backgroundColor = expectedColor;
    spanElem.style.color = expectedColor;
    spanElem.style.gap = `${STATS_ENTRY_GAP_WIDTH}rem`;
    
    // must add elem to DOM before able to read its color
    statsElem.appendChild(spanElem);
    
    // if average color value of element is over 192, give it a black background for contrast
    if (
      (/rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/.exec(getComputedStyle(spanElem).color) ?? [])
      .slice(1)
      .map(x => parseInt(x))
      .reduce((a, b) => a + b, 0) / 3 > 160
    ) {
      spanElem.style.backgroundColor = 'rgb(170, 170, 170)';
    }
    
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
