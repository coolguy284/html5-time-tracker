function updateEventStorage() {
  eventStorage.saveToMedium();
}

function updateEventStorageDifferent() {
  eventStorage.saveOrCreateNew();
  updateDisplay();
  
  parseWeeksDirtyBit = true; // messy but works
}
