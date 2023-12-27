function getPseudoRawDataFromStorage() {
  return {
    eventButtons: eventStorage.getEventButtons(),
    eventPriorities: eventStorage.getEventPriorities(),
    eventMappings: eventStorage.getEventMappings(),
    events: eventStorage.getAllEvents(),
  };
}

function setPseudoRawDataInStorage(pseudoRawData) {
  eventStorage.setEventButtons(pseudoRawData.eventButtons);
  eventStorage.setEventPriorities(pseudoRawData.eventPriorities);
  eventStorage.setEventMappings(pseudoRawData.eventMappings);
  eventStorage.setAllEvents(pseudoRawData.events);
}

function setPseudoRawData() {
  try {
    setPseudoRawDataInStorage(JSON.parse(pseudo_raw_data_text.value));
  } catch {
    alert('JSON invalid');
  }
}

function reloadPseudoRawData() {
  pseudo_raw_data_text.value = prettifyJson(getPseudoRawDataFromStorage());
}
