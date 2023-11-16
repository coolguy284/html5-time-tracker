schedule_table_main_section_times_div.style.height = `${TABLE_DATA_FULL_HEIGHT}rem`;


removeAllChildren(event_mappings_select);

for (let eventMapping in EVENT_MAPPINGS) {
  let mappingOption = document.createElement('option');
  mappingOption.textContent = eventMapping;
  mappingOption.setAttribute('value', eventMapping);
  if (eventMapping == DEFAULT_EVENT_MAPPING) {
    mappingOption.setAttribute('selected', '');
  }
  
  event_mappings_select.appendChild(mappingOption);
}

function loadEventsArr() {
  eventStorage.loadFromMediumOrFillWithDefault();
}

loadEventsArr();

addEventListener('keydown', evt => {
  // if on charts page and left or right arrow pressed, go to next or previous week
  if (charts_section_div.style.display != 'none') {
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
