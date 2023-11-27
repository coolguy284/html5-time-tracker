function switchPage(page) {
  switch (page) {
    case 'events':
      events_div.style.display = '';
      charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = 'none';
      
      events_div_button.classList.add('current_tab');
      charts_div_button.classList.remove('current_tab');
      data_div_button.classList.remove('current_tab');
      extras_div_button.classList.remove('current_tab');
      break;
    
    case 'charts':
      if (parseEventsDirtyBit) {
        updateChartsSection();
        parseEventsDirtyBit = false;
      }
      events_div.style.display = 'none';
      charts_section_div.style.display = '';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = 'none';
      
      events_div_button.classList.remove('current_tab');
      charts_div_button.classList.add('current_tab');
      data_div_button.classList.remove('current_tab');
      extras_div_button.classList.remove('current_tab');
      break;
    
    case 'data':
      events_div.style.display = 'none';
      charts_section_div.style.display = 'none';
      data_section_div.style.display = '';
      extras_section_div.style.display = 'none';
      
      events_div_button.classList.remove('current_tab');
      charts_div_button.classList.remove('current_tab');
      data_div_button.classList.add('current_tab');
      extras_div_button.classList.remove('current_tab');
      break;
    
    case 'extras':
      events_div.style.display = 'none';
      charts_section_div.style.display = 'none';
      data_section_div.style.display = 'none';
      extras_section_div.style.display = '';
      
      events_div_button.classList.remove('current_tab');
      charts_div_button.classList.remove('current_tab');
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
      settings_section_div.style.display = 'none';
      break;
    
    case 'raw data':
      extras_section_main_page.style.display = 'none';
      raw_data_section_div.style.display = '';
      settings_section_div.style.display = 'none';
      break;
    
    case 'settings':
      extras_section_main_page.style.display = 'none';
      raw_data_section_div.style.display = 'none';
      settings_section_div.style.display = '';
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
    let currentHighlightedEventSplit = (currentHighlightedEvent ?? '').split(MULTI_EVENT_SPLIT);
    let currentEventSplit = (currentEvent ?? '').split(MULTI_EVENT_SPLIT);
    
    if (eventArrOnlyToggles(currentHighlightedEventSplit)) {
      currentHighlightedEventSplit.push('Nothing');
    }
    
    if (eventArrOnlyToggles(currentEventSplit)) {
      currentEventSplit.push('Nothing');
    }
    
    let currentHighlightedEventSet = new Set(currentHighlightedEventSplit);
    let currentEventSet = new Set(currentEventSplit);
    
    for (highlightedEvent of currentHighlightedEventSet) {
      if (!currentEventSet.has(highlightedEvent) && highlightedEvent in eventButtons) {
        eventButtons[highlightedEvent].classList.remove('current_event');
      }
    }
    
    for (newEvent of currentEventSet) {
      if (!currentHighlightedEventSet.has(newEvent) && newEvent in eventButtons) {
        eventButtons[newEvent].classList.add('current_event');
      }
    }
    
    currentHighlightedEvent = currentEvent;
  }
}

function updateCurrentEventCheckboxes() {
  let latestEventIndex = eventStorage.getLatestVisibleEventIndex();
  if (latestEventIndex > -1) {
    let togglesOnSet = new Set(eventStorage.getEventByIndex(latestEventIndex)[1].split(MULTI_EVENT_SPLIT).filter(x => x in toggleInputsObject));
    
    for (toggleEvent in toggleInputsObject) {
      toggleInputsObject[toggleEvent].checked = togglesOnSet.has(toggleEvent);
    }
  } else {
    for (toggleEvent in toggleInputsObject) {
      toggleInputsObject[toggleEvent].checked = false;
    }
  }
}

function updateDisplay(redoToggles) {
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
  
  if (redoToggles) {
    updateCurrentEventCheckboxes();
  }
  
  refreshLocalStorageCapacityView();
}

function updateWeekSelect() {
  // clear out select
  removeAllChildren(week_picker_div_select);
  
  for (let weekIndex = 0; weekIndex < parsedEvents.weekly_stats.length; weekIndex++) {
    let weekDateString = parsedEvents.weekly_stats[weekIndex][0];
    
    let weekOption = document.createElement('option');
    weekOption.textContent = `Week of ${weekDateString}`;
    weekOption.setAttribute('value', weekIndex);
    if (weekIndex == parsedEvents.weekly_stats.length - 1) {
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
    
    let spanElemTextNode = document.createTextNode(`${entry[2].toFixed(3).padStart(6, '0')}% (${(Math.floor(entry[1] / 3_600) + '').padStart(2, '0')}:${(Math.floor(entry[1] / 60 % 60) + '').padStart(2, '0')}) ${entry[0]}`);
    
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
    
    totalTimeSeconds += entry[1];
  }
  
  totalTimeSeconds = Math.round(totalTimeSeconds * 1000) / 1000;
  
  return totalTimeSeconds;
}

function updateTableAndWeekStatsDisplay() {
  let weekData = parsedEvents.weekly_stats[week_picker_div_select.value];
  
  let startDayMiddleMillis = new Date(weekData[0]).getTime() + 12 * 3600 * 1000;
  
  for (let day = 0; day < 7; day++) {
    let dayMiddleMillis = startDayMiddleMillis + 24 * 3600 * 1000 * day;
    let dayString = dateToDateString(new Date(dayMiddleMillis));
    
    let dayData = parsedEvents.day_events.get(dayString) ?? [];
    
    let dayTd = tableTds[day];
    
    removeAllChildrenButOne(dayTd);
    
    dayData.forEach((x, i) => {
      let eventDiv = document.createElement('div');
      if (i == 0 && x[1] != 0) {
        eventDiv.style.marginTop = `${x[1] / 86_400 * TABLE_DATA_FULL_HEIGHT}rem`;
      }
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
  
  let totalTimeSeconds = updateStatsDisplay_Helper(weekData[1], stats_div);
  
  total_time_p.textContent = `Total: ${(totalTimeSeconds / 86_400 / 7 * 100).toFixed(3).padStart(6, '0')}% (${(Math.floor(totalTimeSeconds / 3_600) + '').padStart(2, '0')}:${(Math.floor(totalTimeSeconds / 60 % 60) + '').padStart(2, '0')} / 168:00)`;
}

function updateAllStatsDisplay() {
  let totalTimeSeconds = updateStatsDisplay_Helper(parsedEvents.all_time_stats, all_time_stats_div);
  
  all_time_total_time_p.textContent = `Total: ${(totalTimeSeconds / 86_400 / 7).toFixed(3)} weeks (${(Math.floor(totalTimeSeconds / 3_600) + '').padStart(2, '0')}:${(Math.floor(totalTimeSeconds / 60 % 60) + '').padStart(2, '0')})`;
}

function updateChartsSectionMappingSelect() {
  removeAllChildren(event_mappings_select);
  
  for (let eventMapping in eventMappings) {
    let mappingOption = document.createElement('option');
    mappingOption.textContent = eventMapping;
    mappingOption.setAttribute('value', eventMapping);
    if (eventMapping == DEFAULT_EVENT_MAPPING) {
      mappingOption.setAttribute('selected', '');
    }
    
    event_mappings_select.appendChild(mappingOption);
  }
}

function updateChartsSectionRenderingOnly() {
  updateTableAndWeekStatsDisplay();
  updateAllStatsDisplay();
}

function updateChartsSectionMainEventsUpdate() {
  eventMappings = eventStorage.getEventMappings();
  eventPriorities = eventStorage.getEventPriorities();
  eventPriorities = Object.fromEntries(Object.entries(eventPriorities).map(x => [x[1], eventPriorities.length - x[0]]));
  updateChartsSectionMappingSelect();
}

function updateChartsSection() {
  fillParsedEvents();
  updateWeekSelect();
  updateChartsSectionRenderingOnly();
}

function temporarilyBlankLocalStorageCapacityView() {
  localstorage_used_meter.value = 0;
  localstorage_total_text.textContent = '-- KB';
  localstorage_used_text.textContent = '-- KB (--%)';
  localstorage_free_text.textContent = '-- KB (--%)';
}

function setLocalStorageCapacityView(totalBytes, usedBytes, freeBytes) {
  localstorage_used_meter.value = usedBytes / totalBytes;
  localstorage_total_text.textContent = `${Math.round(totalBytes / 1000)} KB`;
  localstorage_used_text.textContent = `${Math.round(usedBytes / 1000)} KB (${(usedBytes / totalBytes * 100).toFixed(1)}%)`;
  localstorage_free_text.textContent = `${Math.round(freeBytes / 1000)} KB (${(freeBytes / totalBytes * 100).toFixed(1)}%)`;
}

function showLocalStorageCalcProgressDiv() {
  if (localstorage_size_calc_progress_div.style.display == 'none') {
    localstorage_size_calc_progress_div.style.display = '';
  }
}

function hideLocalStorageCalcProgressDiv() {
  if (localstorage_size_calc_progress_div.style.display != 'none') {
    localstorage_size_calc_progress_div.style.display = 'none';
  }
}

function setLocalStorageCalcProgressText(value) {
  showLocalStorageCalcProgressDiv();
  localstorage_size_calc_progress_text.textContent = value;
}

let refreshLocalStorageCapacityView = asyncManager.wrapAsyncFunction({
  name: 'refreshLocalStorageCapacityView',
  critical: true,
  alreadyRunningBehavior: 'wait',
}, async () => {
  temporarilyBlankLocalStorageCapacityView();
  localstorage_recalculate_max_btn.setAttribute('disabled', '');
  
  try {
    let report = await localStorageReport(setLocalStorageCalcProgressText);
    
    setLocalStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!localStorageErrorPrinted) {
      alert(e.toString());
      localStorageErrorPrinted = true;
    }
    
    throw e;
  } finally {
    localstorage_recalculate_max_btn.removeAttribute('disabled');
    hideLocalStorageCalcProgressDiv();
  }
});

let resetAndRefreshLocalStorageCapacityView = asyncManager.wrapAsyncFunction({
  name: 'resetAndRefreshLocalStorageCapacityView',
  critical: true,
  alreadyRunningBehavior: 'stop',
}, async () => {
  localstorage_recalculate_max_btn.setAttribute('disabled', '');
  
  // reset localstorage error flag since user requested refresh
  localStorageErrorPrinted = false;
  
  temporarilyBlankLocalStorageCapacityView();
  await localStorageInfoRecalculate(setLocalStorageCalcProgressText);
  hideLocalStorageCalcProgressDiv();
  
  try {
    let report = await localStorageReport();
    setLocalStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!localStorageErrorPrinted) {
      alert(e.toString());
      localStorageErrorPrinted = true;
    }
    
    throw e;
  } finally {
    localstorage_recalculate_max_btn.removeAttribute('disabled');
  }
});

function updateDisplayedButtons(parentElem, eventButtonsSubset) {
  if (!parentElem) {
    parentElem = events_div;
    eventButtonsSubset = eventStorage.getEventButtons();
    
    toggleInputs = [];
    eventButtons = {};
  }
  
  if (parentElem == events_div) {
    removeAllChildren(parentElem);
  }
  
  for (let [ eventOrCategoryName, data ] of Object.entries(eventButtonsSubset)) {
    if (data == 'button') {
      let buttonElem = document.createElement('button');
      buttonElem.textContent = eventOrCategoryName;
      buttonElem.dataset.event = eventOrCategoryName;
      buttonElem.addEventListener('click', addEvent.bind(null, buttonElem));
      parentElem.appendChild(buttonElem);
      
      eventButtons[eventOrCategoryName] = buttonElem;
    } else if (data == 'toggle') {
      let labelElem = document.createElement('label');
      let inputElem = document.createElement('input');
      inputElem.type = 'checkbox';
      inputElem.addEventListener('change', addEvent.bind(null, inputElem));
      let textElem = document.createTextNode(eventOrCategoryName);
      labelElem.appendChild(inputElem);
      labelElem.appendChild(textElem);
      parentElem.appendChild(labelElem);
      
      toggleInputs.push([eventOrCategoryName, inputElem]);
      eventButtons[eventOrCategoryName] = labelElem;
    } else if (typeof data == 'object') {
      let fieldsetElem = document.createElement('fieldset');
      let legendElem = document.createElement('legend');
      legendElem.textContent = eventOrCategoryName;
      fieldsetElem.appendChild(legendElem);
      parentElem.appendChild(fieldsetElem);
      updateDisplayedButtons(fieldsetElem, data);
    }
  }
  
  if (parentElem == events_div) {
    toggleInputsObject = Object.fromEntries(toggleInputs);
    toggleEventsSet = new Set(toggleInputs.map(x => x[0]));
  }
}
