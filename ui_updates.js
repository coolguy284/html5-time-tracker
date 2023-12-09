// Setup listener for currentevent banner at top

eventStorage.jsAddEventListener('eventsUpdate', () => {
  updateTopBanner();
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
        () => {
          // if this event gets called first (shouldn't happen) chart page might error when updating
          try {
            updateChartsSection();
          } catch (e) {
            updateChartsSectionMainEventsUpdate();
            updateChartsSection();
          }
        },
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
        () => checkDataSectionScrollHeight(),
      ],
    },
    afterRenderEnterListeners: [
      () => checkDataSectionScrollHeight(),
    ],
    afterHideExitListeners: [
      () => hideScrollButtons(),
    ],
  },
  'Extras': {
    htmlElem: extras_section_div,
    buttonElem: extras_div_button,
    beforeRenderEnterListeners: [
      () => extrasPageManager.activate(),
    ],
    afterHideExitListeners: [
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

// Setup listeners for each extras page

extrasPageManager.createDirtyBits([
  'storageUpdate',
]);

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

// storage should be updated at program start even if persistentstorage hasnt touched it yet
extrasPageManager.setDirtyBit('storageUpdate');
