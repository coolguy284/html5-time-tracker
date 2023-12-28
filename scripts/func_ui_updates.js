// top banner update

function updateTopBanner() {
  let latestEventName = eventStorage.getLatestVisibleEvent()?.[1] ?? 'None';
  
  current_event_text.textContent = latestEventName;
}

// main > events page updates

function updateDisplayedButtons(parentElem, eventButtonsSubset) {
  if (!parentElem) {
    parentElem = events_section_div;
    eventButtonsSubset = eventStorage.getEventButtons();
    
    toggleInputs = [];
    eventButtons = {};
    currentHighlightedEvent = null;
  }
  
  if (parentElem == events_section_div) {
    removeAllChildren(parentElem);
  }
  
  for (let [ eventOrCategoryName, data ] of Object.entries(eventButtonsSubset)) {
    if (typeof data == 'object' && !Array.isArray(data)) {
      // handle nested group
      let fieldsetElem = document.createElement('fieldset');
      let legendElem = document.createElement('legend');
      legendElem.textContent = eventOrCategoryName;
      fieldsetElem.appendChild(legendElem);
      parentElem.appendChild(fieldsetElem);
      updateDisplayedButtons(fieldsetElem, data);
    } else {
      // handle object
      
      let objectType, objectParams;
      
      if (typeof data == 'string') {
        objectType = data;
      } else if (Array.isArray(data)) {
        objectType = data[0];
        objectParams = data[1];
      }
      
      if (objectType == 'button') {
        let buttonElem = document.createElement('button');
        buttonElem.textContent = eventOrCategoryName;
        buttonElem.dataset.type = 'normal';
        buttonElem.dataset.event = eventOrCategoryName;
        buttonElem.addEventListener('click', addEvent.bind(null, buttonElem));
        parentElem.appendChild(buttonElem);
        
        eventButtons[eventOrCategoryName] = buttonElem;
      } else if (objectType == 'toggle') {
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
      } else if (objectType == 'seperator') {
        let hrElem = document.createElement('hr');
        parentElem.appendChild(hrElem);
      } else if (objectType == 'button-custom-one-time') {
        let buttonElem = document.createElement('button');
        buttonElem.textContent = eventOrCategoryName;
        buttonElem.dataset.type = 'one time custom';
        buttonElem.addEventListener('click', addEvent.bind(null, buttonElem));
        parentElem.appendChild(buttonElem);
      } else if (objectType == 'button-custom') {
        let buttonElem = document.createElement('button');
        buttonElem.textContent = eventOrCategoryName;
        buttonElem.dataset.type = 'custom';
        
        let categoryPath = objectParams?.categoryPath;
        
        if (categoryPath != null) {
          buttonElem.dataset.categoryPath = JSON.stringify(categoryPath);
        }
        
        buttonElem.addEventListener('click', addEvent.bind(null, buttonElem));
        parentElem.appendChild(buttonElem);
      }
    }
  }
  
  if (parentElem == events_section_div) {
    toggleInputsObject = Object.fromEntries(toggleInputs);
    toggleEventsSet = new Set(toggleInputs.map(x => x[0]));
  
    updateCurrentEventCheckboxes();
    updateCurrentEventButtonHighlight();
  }
}

function updateCurrentEventButtonHighlight() {
  let currentEvent = eventStorage.getLatestVisibleEvent()?.[1];
  
  let currentHighlightedEventSplit = currentHighlightedEvent == null ? [] : currentHighlightedEvent.split(MULTI_EVENT_SPLIT);
  let currentEventSplit = currentEvent == null ? [] : currentEvent.split(MULTI_EVENT_SPLIT);
  
  if (eventArrOnlyToggles(currentEventSplit) && currentEventSplit.length != 0) {
    currentEventSplit.push(EVENT_NOTHING);
  }
  
  currentEvent = currentEvent == null ? null : currentEventSplit.join(MULTI_EVENT_SPLIT);
  
  if (currentEvent != currentHighlightedEvent) {
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
    
    currentHighlightedEvent = currentEventSplit.length == 0 ? null : eventArrToEventString(currentEventSplit.filter(x => x in eventButtons));
  }
}

function updateCurrentEventCheckboxes() {
  let latestEvent = eventStorage.getLatestVisibleEvent();
  
  if (latestEvent != null) {
    let togglesOnSet = new Set(latestEvent[1].split(MULTI_EVENT_SPLIT).filter(x => x in toggleInputsObject));
    
    for (toggleEvent in toggleInputsObject) {
      toggleInputsObject[toggleEvent].checked = togglesOnSet.has(toggleEvent);
    }
  } else {
    for (toggleEvent in toggleInputsObject) {
      toggleInputsObject[toggleEvent].checked = false;
    }
  }
}

function getAllEventsFromEventButtonsList(currentEventButtons, eventsWithButtons) {
  if (!eventsWithButtons) {
    eventsWithButtons = new Set();
  }
  
  for (let [ key, value ] of Object.entries(currentEventButtons)) {
    if (typeof value == 'object' && !Array.isArray(value)) {
      getAllEventsFromEventButtonsList(value, eventsWithButtons);
    } else if (value == 'button' || value == 'toggle') {
      eventsWithButtons.add(key);
    } else if (Array.isArray(value) && (value[0] == 'button' || value[0] == 'toggle')) {
      eventsWithButtons.add(key);
    }
  }
  
  return eventsWithButtons;
}

function addEventButtonIfNotAlready(eventName, categoryPath) {
  let currentEventButtons = eventStorage.getEventButtons();
  
  let eventsWithButtons = getAllEventsFromEventButtonsList(currentEventButtons);
  
  if (eventsWithButtons.has(eventName)) return;
  
  let categoryObject = currentEventButtons;
  
  for (let pathEntry of categoryPath) {
    if (!(pathEntry in categoryObject)) {
      categoryObject[pathEntry] = {};
    }
    
    categoryObject = categoryObject[pathEntry];
  }
  
  categoryObject[eventName] = 'button';
  
  eventStorage.setEventButtons(currentEventButtons);
}

// main > charts page updates > initial updating

function updateChartsSectionMainEventsUpdate() {
  eventMappings = eventStorage.getEventMappings();
  eventPriorities = eventStorage.getEventPriorities();
  eventPriorities = Object.fromEntries(Object.entries(eventPriorities).map(x => [x[1], eventPriorities.length - x[0]]));
  updateChartsSectionMappingSelect();
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

// main > charts page updates > main updating

function updateChartsSection() {
  fillParsedEvents();
  updateWeekSelect();
  updateChartsSectionRenderingOnly();
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

function updateChartsSectionRenderingOnly() {
  updateTableAndWeekStatsDisplay();
  updateAllStatsDisplay();
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
      
      let eventDivColors;
      
      switch (getRadioButtonValue('collapse_table_by')) {
        case 'None':
          eventDivColors = getEventColors(x[0]);
          break;
        
        case 'Identical Colors':
          eventDivColors = getEventUniqueColors(x[0]);
          break;
        
        case 'Main Event':
          eventDivColors = getEventColors(getEventSingle(x[0]));
          break;
      }
      
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

function updateStatsDisplay_Helper_RecalculatePercentages(statsArr) {
  return Object.entries(
      statsArr.reduce((a, c) => {
        if (c[0] in a) {
          a[c[0]][0] += c[1];
          a[c[0]][1] += c[2];
        } else a[c[0]] = [c[1], c[2]];
        return a;
      }, {})
    )
    .map(x => [x[0], x[1][0], x[1][1]])
    .sort((a, b) => a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0);
}

function updateStatsDisplay_Helper(statsArr, statsElem) {
  removeAllChildren(statsElem);
  
  // if collapse event groups is checked, stats should only list event groups not individual events
  switch (getRadioButtonValue('collapse_stats_by')) {
    case 'None':
      break;
    
    case 'Main Event':
      statsArr = updateStatsDisplay_Helper_RecalculatePercentages(
        statsArr
          .map(entry => [getEventSingle(entry[0]), entry[1], entry[2]])
      );
      break;
    
    case 'Group':
      statsArr = updateStatsDisplay_Helper_RecalculatePercentages(
        statsArr
          .map(entry => [getEventGroupSingle(entry[0]), entry[1], entry[2]])
      );
      break;
  }
  
  let totalTimeSeconds = 0;
  
  for (let entry of statsArr) {
    let spanElem = document.createElement('span');
    
    let spanElemColorBlock = document.createElement('span');
    spanElemColorBlock.style.minWidth = `${STATS_ENTRY_COLOR_BLOCK_WIDTH}rem`;
    
    let spanElemTextNode = document.createTextNode(`${entry[2].toFixed(3).padStart(6, '0')}% (${(Math.floor(entry[1] / 3_600) + '').padStart(2, '0')}:${(Math.floor(entry[1] / 60 % 60) + '').padStart(2, '0')}) ${entry[0]}`);
    
    spanElem.appendChild(spanElemColorBlock);
    spanElem.appendChild(spanElemTextNode);
    
    let expectedColor;
    
    switch (getRadioButtonValue('collapse_stats_by')) {
      case 'None':
        expectedColor = getEventColor(entry[0]);
        break;
      
      case 'Main Event':
        expectedColor = getEventColor(entry[0]);
        break;
      
      case 'Group':
        expectedColor = getEventGroupColor(entry[0]);
        break;
    }
    
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

// main > data page updates

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

// extras > main extras page updates

let refreshLocalStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'refreshLocalStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      localstorage_refresh_view_btn.setAttribute('disabled', '');
      localstorage_recalculate_max_btn.setAttribute('disabled', '');
      temporarilyBlankLocalStorageCapacityView();
    },
  ],
  exitHandlers: [
    () => {
      hideLocalStorageCalcProgressDiv();
      localstorage_refresh_view_btn.removeAttribute('disabled');
      localstorage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  try {
    let report = await localStorageReport(setLocalStorageCalcProgressText);
    
    setLocalStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!localStorageErrorPrinted) {
      alert(e.toString());
      localStorageErrorPrinted = true;
    }
    
    throw e;
  }
});

let resetAndRefreshLocalStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'resetAndRefreshLocalStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      localstorage_refresh_view_btn.setAttribute('disabled', '');
      localstorage_recalculate_max_btn.setAttribute('disabled', '');
      temporarilyBlankLocalStorageCapacityView();
    },
  ],
  exitHandlers: [
    () => {
      hideLocalStorageCalcProgressDiv();
      localstorage_refresh_view_btn.removeAttribute('disabled');
      localstorage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  // reset localstorage error flag since user requested refresh
  localStorageErrorPrinted = false;
  
  await localStorageInfoRecalculate(setLocalStorageCalcProgressText);
  
  try {
    let report = await localStorageReport();
    
    setLocalStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!localStorageErrorPrinted) {
      alert(e.toString());
      localStorageErrorPrinted = true;
    }
    
    throw e;
  }
});

function temporarilyBlankLocalStorageCapacityView() {
  localStorageUsedMeter.setValue(0);
  localstorage_total_text.textContent = '-- KB';
  localstorage_used_text.textContent = '-- KB (--%)';
  localstorage_free_text.textContent = '-- KB (--%)';
}

function setLocalStorageCapacityView(totalBytes, usedBytes, freeBytes) {
  localStorageUsedMeter.setValue(usedBytes / totalBytes);
  localstorage_total_text.textContent = `${Math.round(totalBytes / 1000)} KB`;
  localstorage_used_text.textContent = `${Math.round(usedBytes / 1000)} KB (${(usedBytes / totalBytes * 100).toFixed(1)}%)`;
  localstorage_free_text.textContent = `${Math.round(freeBytes / 1000)} KB (${(freeBytes / totalBytes * 100).toFixed(1)}%)`;
}

function setLocalStorageCalcProgressText(value) {
  showLocalStorageCalcProgressDiv();
  localstorage_size_calc_progress_text.textContent = value;
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

// extras > storage page updates

let refreshLocalStorage2CapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'refreshLocalStorage2CapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      localstorage_refresh_view_btn.setAttribute('disabled', '');
      localstorage_recalculate_max_btn.setAttribute('disabled', '');
      temporarilyBlankLocalStorageCapacityView();
    },
  ],
  exitHandlers: [
    () => {
      hideLocalStorageCalcProgressDiv();
      localstorage_refresh_view_btn.removeAttribute('disabled');
      localstorage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  try {
    let report = await localStorageReport(setLocalStorageCalcProgressText);
    
    setLocalStorage2CapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
    
    return report;
  } catch (e) {
    if (!localStorageErrorPrinted) {
      alert(e.toString());
      localStorageErrorPrinted = true;
    }
    
    throw e;
  }
});

function setLocalStorage2CapacityView(totalBytes, usedBytes, freeBytes) {
  localStorage2UsedMeter.setValue(usedBytes / totalBytes);
  localstorage_2_total_text.textContent = `${Math.round(totalBytes / 1000)} KB`;
  localstorage_2_used_text.textContent = `${Math.round(usedBytes / 1000)} KB (${(usedBytes / totalBytes * 100).toFixed(1)}%)`;
  localstorage_2_free_text.textContent = `${Math.round(freeBytes / 1000)} KB (${(freeBytes / totalBytes * 100).toFixed(1)}%)`;
}

function setStorageCapacityView(totalBytes, usedBytes, freeBytes) {
  totalStorageUsedMeter.setValue(usedBytes / totalBytes);
  total_storage_total_text.textContent = `${prettifyBytes(totalBytes)}`;
  total_storage_used_text.textContent = `${prettifyBytes(usedBytes)} (${(usedBytes / totalBytes * 100).toFixed(4)}%)`;
  total_storage_free_text.textContent = `${prettifyBytes(freeBytes)} (${(freeBytes / totalBytes * 100).toFixed(4)}%)`;
}

async function refreshStorageCapacityView() {
  // update localstorage progress
  
  let report;
  
  try {
    report = await refreshLocalStorage2CapacityView();
  } catch {
    report = {
      totalBytes: 0,
      usedBytes: 0,
      freeBytes: 0,
    };
  }
  
  // update total storage progress
  
  let storageUsed = await navigator.storage.estimate();
  
  setStorageCapacityView(storageUsed.quota, storageUsed.usage, storageUsed.quota - storageUsed.usage);
  
  // update other stats
  
  let numEvents = eventStorage.getNumEvents();
  
  let now = Date.now();
  let startTime = eventStorage.getEventByIndex(0)?.[0];
  if (startTime == null) {
    startTime = now;
  } else {
    startTime = dateStringToDate(startTime).getTime();
  }
  let days = (now - startTime) / 86400 / 1000;
  
  let chars, bytes;
  
  let textStatus = getRawDataTextStatus();
  let textValue = getRawDataTextValue();
  
  switch (textStatus) {
    case 'text':
      chars = textValue.length;
      bytes = textValue.length * 2;
      break;
    
    case 'utf-8':
      chars = textValue.length * 2;
      bytes = textValue.length * 2;
      break;
    
    case 'binary':
      chars = 'N/A';
      bytes = textValue.length * 2;
      break;
    
    case null:
      chars = 0;
      bytes = 0;
      break;
  }
  
  // TODO - update this with the new storage modes
  let availableBytes = report.freeBytes;
  let totalBytes = report.totalBytes;
  
  let percentFull = bytes / totalBytes;
  let totalDays = days / percentFull;
  let daysTillFull = totalDays - days;
  
  storage_data_events.textContent = `${commaifyDecimal(numEvents)} events`;
  storage_data_days.textContent = `${commaifyDecimal(days, 3)} days`;
  storage_data_events_per_day.textContent = `${commaifyDecimal(numEvents / days, 3)} events / day`;
  storage_data_characters.textContent = `${commaifyDecimal(chars)} chars`;
  storage_data_bytes.textContent = `${commaifyDecimal(bytes)} bytes`;
  storage_data_available_bytes.textContent = `${commaifyDecimal(availableBytes)} bytes`;
  storage_data_total_bytes.textContent = `${commaifyDecimal(totalBytes)} bytes`;
  storage_data_bytes_per_event.textContent = `${commaifyDecimal(bytes / numEvents, 3)} bytes / event`;
  storage_data_bytes_per_day.textContent = `${commaifyDecimal(bytes / days, 3)} bytes / day`;
  storage_data_percent_full.textContent = `${commaifyDecimal(percentFull * 100, 2)}%`;
  storage_data_days_till_full.textContent = `${commaifyDecimal(daysTillFull, 3)} days`;
  storage_data_total_days_till_full.textContent = `${commaifyDecimal(totalDays, 3)} days`;
}

// extras > raw data page updates

function updateRawDataDisplay() {
  // put raw data contents on raw_data_text
  rawDataLoad();
}

// extras > settings page updates

function updateSettingsPageVersionSelect() {
  let version = eventStorage.getMediumVer();
  
  if (version.major == 1 && version.minor == 0 && version.format == 'json') {
    storage_version_select.value = 'V1';
  } else if (version.major == 1 && version.minor == 0 && version.format == 'json utf-8') {
    storage_version_select.value = 'V1 UTF-8 (Alpha)';
  } else if (version.major == 2 && version.minor == 0 && version.format == 'json') {
    storage_version_select.value = 'V2';
  } else if (version.major == 2 && version.minor == 0 && version.format == 'json utf-8') {
    storage_version_select.value = 'V2 UTF-8 (Alpha)';
  } else if (version.major == 3 && version.minor == 0 && version.format == 'json') {
    storage_version_select.value = 'V3 (Alpha)';
  } else if (version.major == 3 && version.minor == 0 && version.format == 'json utf-8') {
    storage_version_select.value = 'V3 UTF-8 (Alpha)';
  }/* else if (version.major == 3 && version.minor == 0 && version.format == 'binary') {
    storage_version_select.value = 'V3 Binary (Alpha)';
  }*/
}

let updateSettingsPagePersistenceStatus = asyncManager.wrapAsyncFunction({
  taskName: 'updateSettingsPagePersistenceStatus',
  groupNames: ['persistence'],
  critical: true,
  alreadyRunningBehavior: 'wait',
  exclusive: 'group',
}, async () => {
  let persistStatus;
  
  try {
    persistStatus = (await navigator.storage.persisted()) ? 'yes' : 'no';
  } catch {
    persistStatus = 'error';
  }
  
  persistence_status.textContent = persistStatus;
});

// page switch convenience functions

function switchPage(buttonElem) {
  mainPageManager.switchPage(buttonElem.textContent);
}

function switchExtrasPage(buttonElem) {
  let buttonText = buttonElem.textContent;
  
  if (buttonText == 'Back to Main Page') {
    extrasPageManager.switchPage('Main');
  } else {
    extrasPageManager.switchPage(buttonText);
  }
}

// scroll button functions

function checkDataSectionScrollHeight() {
  if (data_section_div.scrollHeight >= SCROLL_ASSIST_BUTTONS_MIN_SCROLL_HEIGHT) {
    showScrollButtons();
  }
}

function showScrollButtons() {
  scroll_to_top_button.style.display = '';
  scroll_to_bottom_button.style.display = '';
}

function hideScrollButtons() {
  scroll_to_top_button.style.display = 'none';
  scroll_to_bottom_button.style.display = 'none';
}

function performScrollToTop() {
  let currentHtmlElem = mainPageManager.getCurrentPageHTMLElem();
  
  currentHtmlElem.scrollTop = 0;
}

function performScrollToBottom() {
  let currentHtmlElem = mainPageManager.getCurrentPageHTMLElem();
  
  currentHtmlElem.scrollTop = currentHtmlElem.scrollHeight;
}
