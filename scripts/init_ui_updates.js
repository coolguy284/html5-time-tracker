// Setup listener for currentevent banner at top

eventManager.jsAddEventListener('eventsUpdate', async () => {
  await updateTopBanner();
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
        async () => await updateCurrentEventCheckboxes(),
        async () => await updateCurrentEventButtonHighlight(),
      ],
      'eventButtonsUpdate': [
        async () => await updateDisplayedButtons(),
      ],
    },
  },
  'Charts': {
    htmlElem: charts_section_div,
    buttonElem: charts_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        async () => {
          // if this event gets called first (shouldn't happen) chart page might error when updating
          try {
            await updateChartsSection();
          } catch {
            await updateChartsSectionMainEventsUpdate();
            await updateChartsSection();
          }
        },
      ],
      'eventMappingsPrioritiesUpdate': [
        async () => await updateChartsSectionMainEventsUpdate(),
      ],
    },
  },
  'Data': {
    htmlElem: data_section_div,
    buttonElem: data_div_button,
    dirtyBitListeners: {
      'eventsUpdate': [
        async () => await updateDataSectionDisplay(),
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
        async () => await reloadPseudoRawData(),
      ],
      'eventButtonsUpdate': [
        async () => await reloadPseudoRawData(),
      ],
      'eventMappingsPrioritiesUpdate': [
        async () => await reloadPseudoRawData(),
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

eventManager.jsAddEventListener('eventsUpdate', () => {
  mainPageManager.setDirtyBit('eventsUpdate');
});

eventManager.jsAddEventListener('eventButtonsUpdate', () => {
  mainPageManager.setDirtyBit('eventButtonsUpdate');
});

eventManager.jsAddEventListener('eventMappingsPrioritiesUpdate', () => {
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
        () => refreshStorageCapacityView(),
      ],
    },
  },
  'Storage': {
    htmlElem: storage_section_div,
    dirtyBitListeners: {
      'storageUpdate': [
        () => refreshTotalStorageCapacityView(),
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

eventManager.jsAddEventListener('storageUpdate', () => {
  extrasPageManager.setDirtyBit('storageUpdate');
});

globalEventTarget.addEventListener('persistUpdate', () => {
  extrasPageManager.setDirtyBit('persistUpdate');
});
