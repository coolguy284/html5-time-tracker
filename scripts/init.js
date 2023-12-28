schedule_table_main_section_times_div.style.height = `${TABLE_DATA_FULL_HEIGHT}rem`;


eventManager.loadFromMediumOrFillWithDefault();

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

globalEventTarget.addEventListener('storageUpdate', () => {
  if (storageManager.getMediumFormat() == 'LocalStorage') {
    eventManager.loadFromMediumOrFillWithDefault();
  }
});

refreshLocalStorageCapacityView();
updateSettingsPagePersistenceStatus();

mainPageManager.switchPage('Events');
extrasPageManager.deactivateWithPage('Main');
