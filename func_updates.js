function updateEventStorage() {
  eventStorage.saveToMedium();
}

function updateEventStorageDifferent(redoToggles) {
  eventStorage.saveOrCreateNew();
  updateDisplay(redoToggles);
  
  parseWeeksDirtyBit = true; // messy but works
}
