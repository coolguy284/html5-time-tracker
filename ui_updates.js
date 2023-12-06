// Setup listener for currentevent banner at top

eventStorage.jsAddEventListener('eventsUpdate', () => {
  let latestEventName = eventStorage.getLatestVisibleEvent()?.[1] ?? 'None';
  
  current_event_text.textContent = latestEventName;
});

// Setup listeners for each main page

mainPageManager.createDirtyBits([
  'eventsUpdate',
  'eventButtonsUpdate',
  'eventMappingsPrioritiesUpdate',
]);

mainPageManager.setSelectedTabClass('current_tab');

mainPageManager.addPages({
  'Events': {
    htmlElem: events_section_div,
    buttonElem: events_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        () => updateCurrentEventButtonHighlight(),
        () => updateCurrentEventCheckboxes(),
      ],
      'eventButtonsUpdate': [
        () => updateDisplayedButtons(),
      ],
    },
  },
  'Charts': {
    htmlElem: charts_section_div,
    buttonElem: charts_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        () => updateChartsSection(),
      ],
      'eventMappingsPrioritiesUpdate': [
        () => updateChartsSectionMainEventsUpdate(),
      ],
    },
  },
  'Data': {
    htmlElem: data_section_div,
    buttonElem: data_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        () => updateDataSectionDisplay(),
      ],
    },
  },
  'Extras': {
    htmlElem: extras_section_div,
    buttonElem: extras_div_button,
    enterListeners: [
      () => extrasPageManager.activate(),
    ],
    exitListeners: [
      () => extrasPageManager.deactivate(),
    ],
  },
});

eventStorage.jsAddEventListener('eventsUpdate', () => {
  mainPageManager.setDirtyBit('eventsUpdate');
});

eventStorage.jsAddEventListener('eventButtonsUpdate', () => {
  mainPageManager.setDirtyBit('eventButtonsUpdate');
});

eventStorage.jsAddEventListener('eventMappingsPrioritiesUpdate', () => {
  mainPageManager.setDirtyBit('eventMappingsPrioritiesUpdate');
});

mainPageManager.switchPage('Events');

// Setup listeners for each extras page

extrasPageManager.createDirtyBits([
  'storageUpdate',
]);

extrasPageManager.setSelectedTabClass('current_tab');

extrasPageManager.addPages({
  'Main': {
    htmlElem: extras_section_main_page,
    dirtyBitListeners: {
      'storageUpdate': [
        () => refreshLocalStorageCapacityView(),
      ],
    },
  },
  'Raw Data': {
    htmlElem: raw_data_section_div,
    dirtyBitListeners: {
      'storageUpdate': [
        () => updateRawDataDisplay(),
      ],
    },
  },
  'Settings': {
    htmlElem: settings_section_div,
    dirtyBitListeners: {
      'storageUpdate': [
        () => updateSettingsPageVersionSelect(),
      ],
    },
  },
});

eventStorage.jsAddEventListener('storageUpdate', () => {
  extrasPageManager.setDirtyBit('storageUpdate');
});

extrasPageManager.switchPage('Main');
