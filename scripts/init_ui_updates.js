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
        () => updateCurrentEventCheckboxes(),
        () => updateCurrentEventButtonHighlight(),
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
          } catch {
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
  'Edit': {
    htmlElem: edit_section_div,
    buttonElem: edit_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        () => reloadPseudoRawData(),
      ],
      'eventButtonsUpdate': [
        () => reloadPseudoRawData(),
      ],
      'eventMappingsPrioritiesUpdate': [
        () => reloadPseudoRawData(),
      ],
    },
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
  'persistUpdate',
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
  'Storage': {
    htmlElem: storage_section_div,
    dirtyBitListeners: {
      'storageUpdate': [
        () => refreshStorageCapacityView(),
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
      'persistUpdate': [
        () => updateSettingsPagePersistenceStatus(),
      ],
    },
  },
});

eventStorage.jsAddEventListener('storageUpdate', () => {
  extrasPageManager.setDirtyBit('storageUpdate');
});

globalEventTarget.addEventListener('persistUpdate', () => {
  extrasPageManager.setDirtyBit('persistUpdate');
});
