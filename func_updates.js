function updateEventStorage() {
  eventStorage.saveToMedium();
}

function updateEventStorageDifferent(redoToggles) {
  eventStorage.saveOrCreateNew();
  updateDisplay(redoToggles);
  
  parseEventsDirtyBit = true; // messy but works
}
