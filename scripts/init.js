schedule_table_main_section_times_div.style.height = `${TABLE_DATA_FULL_HEIGHT}rem`;

addEventListener('keydown', evt => {
  // if on charts page and left or right arrow pressed, go to next or previous week
  if (mainPageManager.getCurrentPage() == 'Charts') {
    switch (evt.key) {
      case 'ArrowLeft':
        decreaseWeek();
        break;
      
      case 'ArrowRight':
        increaseWeek();
        break;
    }
  }
});

addEventListener('storage', evt => {
  if (evt.storageArea == localStorage) {
    if (evt.key == LOCALSTORAGE_MAIN_STORAGE_KEY) {
      dispatchStorageUpdate();
    }
  } else if (evt.storageArea == sessionStorage) {
    if (evt.key == SESSIONSTORAGE_STORAGE_UPDATE_KEY && evt.newValue == null) {
      dispatchStorageUpdate();
    }
  }
});

edit_extra_settings_details.addEventListener('toggle', () => {
  edit_extra_settings.style.display = edit_extra_settings_details.open ? '' : 'none';
});

globalEventTarget.addEventListener('storageUpdate', async () => {
  if (await storageManager.getMediumFormat() == 'LocalStorage') {
    await eventManager.loadFromMediumOrFillWithDefault();
  }
});

mainPageManager.switchPage('Events');
extrasPageManager.deactivateWithPage('Main');

(async () => {
  await Promise.all([
    eventManager.loadFromMediumOrFillWithDefault(),
    refreshStorageCapacityView(),
    updateSettingsPagePersistenceStatus(),
  ]);
  
  if (AUTO_GO_TO_BUTTON_DEVELOPER_PAGE) {
    mainPageManager.switchPage('Extras');
    extrasPageManager.switchPage('Developer');
  }
})();
