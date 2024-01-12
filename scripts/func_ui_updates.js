// top banner update

async function updateTopBanner() {
  let latestEventName = (await eventManager.getLatestVisibleEvent())?.[1] ?? 'None';
  
  current_event_text.textContent = latestEventName;
}

// main > events page updates

async function updateDisplayedButtons(parentElem, eventButtonsSubset) {
  if (!parentElem) {
    parentElem = events_section_div;
    eventButtonsSubset = await eventManager.getEventButtons();
    
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
      await updateDisplayedButtons(fieldsetElem, data);
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
  
    await updateCurrentEventCheckboxes();
    await updateCurrentEventButtonHighlight();
  }
}

async function updateCurrentEventButtonHighlight() {
  let currentEvent = (await eventManager.getLatestVisibleEvent())?.[1];
  
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

async function updateCurrentEventCheckboxes() {
  let latestEvent = await eventManager.getLatestVisibleEvent();
  
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

async function addEventButtonIfNotAlready(eventName, categoryPath) {
  let currentEventButtons = await eventManager.getEventButtons();
  
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
  
  await eventManager.setEventButtons(currentEventButtons);
}

// main > charts page updates > initial updating

async function updateChartsSectionMainEventsUpdate() {
  eventMappings = await eventManager.getEventMappings();
  eventPriorities = await eventManager.getEventPriorities();
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

let updateChartsSection = asyncManager.wrapAsyncFunctionWithButton(
  'updateChartsSection',
  refresh_charts_button,
  async () => {
    await fillParsedEvents();
    updateWeekSelect();
    updateChartsSectionRenderingOnly();
  }
);

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

let updateDataSectionDisplay = asyncManager.wrapAsyncFunctionWithButton(
  'updateDataSectionDisplay',
  data_section_show_duplicates,
  async () => {
    // put array contents on data_div
    let visibleEventsArr = (await eventManager.getAllEvents());
    
    if (visibleEventsArr.length > 0) {
      let processedEventsArr = visibleEventsArr;
      
      // hide deleted events
      if (!data_section_show_deleted.checked) {
        processedEventsArr = processedEventsArr.filter(x => x[2]);
      }
      
      // hide duplicates
      if (!data_section_show_duplicates.checked) {
        let newProcessedEventsArr = [];
        
        let lastEventName = null, lastEventAnnotation = null;
        
        for (let event of processedEventsArr) {
          if (event[1] != lastEventName || event[4] != lastEventAnnotation) {
            newProcessedEventsArr.push(event);
            lastEventName = event[1];
            lastEventAnnotation = event[4];
          }
        }
        
        processedEventsArr = newProcessedEventsArr;
      }
      
      data_div.innerHTML = processedEventsArr.map(x => {
        let eventString = `${x[0]}: ${x[1]}`;
        
        if (x.length > 4) {
          // event has annotation
          eventString += '\n  ';
          
          if (DATA_VIEW_ADDL_INFO_BIG_INDENT) {
            eventString += '                                    ';
          }
          
          eventString += `Addl. Info: ${x[4]}`;
        }
        
        if (!x[2]) {
          // event is hidden
          eventString = `<span class = 'data_page_hidden'>${eventString}</span>`;
        } else {
          eventString = `<span>${eventString}</span>`;
        }
        
        return eventString;
      }).join('\n');
    } else {
      data_div.textContent = 'No Events';
    }
  }
)

// extras > main page updates

let refreshStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'refreshStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      storage_refresh_view_btn.setAttribute('disabled', '');
      storage_recalculate_max_btn.setAttribute('disabled', '');
      all_storage_refresh_view_btn.setAttribute('disabled', '');
      all_storage_recalculate_max_btn.setAttribute('disabled', '');
    },
  ],
  exitHandlers: [
    () => {
      storage_refresh_view_btn.removeAttribute('disabled');
      storage_recalculate_max_btn.removeAttribute('disabled');
      all_storage_refresh_view_btn.removeAttribute('disabled');
      all_storage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  try {
    storageUsedMeter.blankStorageCapacityView();
    
    let report = await storageManager.mediumSpaceReport(x => storageUsedMeter.setStorageCalcProgress(x));
    
    storageUsedMeter.setStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!storageErrorPrinted) {
      alert(e.toString());
      storageErrorPrinted = true;
    }
    
    throw e;
  }
});

let resetAndRefreshStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'resetAndRefreshStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      storage_refresh_view_btn.setAttribute('disabled', '');
      storage_recalculate_max_btn.setAttribute('disabled', '');
      all_storage_refresh_view_btn.setAttribute('disabled', '');
      all_storage_recalculate_max_btn.setAttribute('disabled', '');
    },
  ],
  exitHandlers: [
    () => {
      storage_refresh_view_btn.removeAttribute('disabled');
      storage_recalculate_max_btn.removeAttribute('disabled');
      all_storage_refresh_view_btn.removeAttribute('disabled');
      all_storage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  // reset storage error flag since user requested refresh
  storageErrorPrinted = false;
  
  storageUsedMeter.blankStorageCapacityView();
  
  if ((await storageManager.getMediumFormat()) == 'LocalStorage') {
    await localStorageInfoRecalculate(x => storageUsedMeter.setStorageCalcProgress(x));
  }
  
  try {
    let report = await storageManager.mediumSpaceReport();
    
    storageUsedMeter.setStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
  } catch (e) {
    if (!storageErrorPrinted) {
      alert(e.toString());
      storageErrorPrinted = true;
    }
    
    throw e;
  }
});

// extras > storage page updates

let refreshAllStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'refreshAllStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      storage_refresh_view_btn.setAttribute('disabled', '');
      storage_recalculate_max_btn.setAttribute('disabled', '');
      all_storage_refresh_view_btn.setAttribute('disabled', '');
      all_storage_recalculate_max_btn.setAttribute('disabled', '');
    },
  ],
  exitHandlers: [
    () => {
      storage_refresh_view_btn.removeAttribute('disabled');
      storage_recalculate_max_btn.removeAttribute('disabled');
      all_storage_refresh_view_btn.removeAttribute('disabled');
      all_storage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  try {
    localStorageUsedMeter.blankStorageCapacityView();
    
    let report = await localStorageReport(x => localStorageUsedMeter.setStorageCalcProgress(x));
    
    localStorageUsedMeter.setStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
    
    await refreshTotalStorageCapacityView();
  } catch (e) {
    if (!allStorageErrorPrinted) {
      alert(e.toString());
      allStorageErrorPrinted = true;
    }
    
    throw e;
  }
});

let resetAndRefreshAllStorageCapacityView = asyncManager.wrapAsyncFunction({
  taskName: 'resetAndRefreshAllStorageCapacityView',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'stop',
  exclusive: 'group',
  enterHandlers: [
    () => {
      storage_refresh_view_btn.setAttribute('disabled', '');
      storage_recalculate_max_btn.setAttribute('disabled', '');
      all_storage_refresh_view_btn.setAttribute('disabled', '');
      all_storage_recalculate_max_btn.setAttribute('disabled', '');
    },
  ],
  exitHandlers: [
    () => {
      storage_refresh_view_btn.removeAttribute('disabled');
      storage_recalculate_max_btn.removeAttribute('disabled');
      all_storage_refresh_view_btn.removeAttribute('disabled');
      all_storage_recalculate_max_btn.removeAttribute('disabled');
    },
  ],
}, async () => {
  // reset all storage error flag since user requested refresh
  allStorageErrorPrinted = false;
  
  localStorageUsedMeter.blankStorageCapacityView();
  
  await localStorageInfoRecalculate(x => localStorageUsedMeter.setStorageCalcProgress(x));
  
  try {
    let report = await localStorageReport();
    
    localStorageUsedMeter.setStorageCapacityView(report.totalBytes, report.usedBytes, report.freeBytes);
    
    await refreshTotalStorageCapacityView();
  } catch (e) {
    if (!allStorageErrorPrinted) {
      alert(e.toString());
      allStorageErrorPrinted = true;
    }
    
    throw e;
  }
});

async function refreshTotalStorageCapacityView() {
  // update total storage progress
  
  let storageUsed = await navigator.storage.estimate();
  
  totalStorageUsedMeter.setStorageCapacityView(storageUsed.quota, storageUsed.usage, storageUsed.quota - storageUsed.usage);
  
  // update other stats
  
  let numEvents = await eventManager.getNumEvents();
  
  let now = Date.now();
  let startTime = (await eventManager.getEventByIndex(0))?.[0];
  if (startTime == null) {
    startTime = now;
  } else {
    startTime = dateStringToDate(startTime).getTime();
  }
  let days = (now - startTime) / 86400 / 1000;
  
  let chars = await storageManager.getUsedSizeInChars();
  let bytes = await storageManager.getUsedSizeInBytes();
  
  let report = await storageManager.mediumSpaceReport();
  let bytesDisk = report.usedBytes;
  let availableBytes = report.freeBytes;
  let totalBytes = report.totalBytes;
  
  let percentFull = bytesDisk / totalBytes;
  let totalDays = days / percentFull;
  let daysTillFull = totalDays - days;
  
  storage_data_events.textContent = `${commaifyDecimal(numEvents)} events`;
  storage_data_days.textContent = `${commaifyDecimal(days, 3)} days`;
  storage_data_events_per_day.textContent = `${commaifyDecimal(numEvents / days, 3)} events / day`;
  storage_data_characters.textContent = `${commaifyDecimal(chars)} chars`;
  storage_data_bytes.textContent = `${commaifyDecimal(bytes)} bytes`;
  storage_data_bytes_on_disk.textContent = `${commaifyDecimal(bytesDisk)} bytes`;
  storage_data_available_bytes.textContent = `${commaifyDecimal(availableBytes)} bytes`;
  storage_data_total_bytes.textContent = `${commaifyDecimal(totalBytes)} bytes`;
  storage_data_bytes_per_event.textContent = `${commaifyDecimal(bytes / numEvents, 3)} bytes / event`;
  storage_data_bytes_per_day.textContent = `${commaifyDecimal(bytes / days, 3)} bytes / day`;
  storage_data_percent_full.textContent = `${commaifyDecimal(percentFull * 100, 5)}%`;
  storage_data_days_till_full.textContent = `${commaifyDecimal(daysTillFull, 3)} days`;
  storage_data_total_days_till_full.textContent = `${commaifyDecimal(totalDays, 3)} days`;
}

// extras > raw data page updates

function updateRawDataDisplay() {
  // put raw data contents on raw_data_text
  rawDataLoad();
}

// extras > settings page updates

async function updateSettingsPageMediumSelect() {
  let medium = await eventManager.getMediumFormat();
  
  switch (medium) {
    case 'LocalStorage':
      storage_medium_select.value = 'LocalStorage';
      break;
    
    case 'OPFS':
      storage_medium_select.value = 'Origin Private File System';
      break;
  }
}

function updateSettingsPageVersionSelect() {
  let version = eventManager.getMediumVer();
  
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
  } else {
    hideScrollButtons();
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
