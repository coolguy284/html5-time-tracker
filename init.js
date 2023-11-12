/*
  {
    day_events: Map {
      entry {
        key = <date: string "YYYY-MM-DD">,
        value = [
          [
            <event name: string>,
            <event start time: float (seconds since start of day)>,
            <event duration: float (seconds' duration of event)>,
          ],
          ...
        ],
      }
    },
    weekly_stats: [
      week:
      [
        <start date: string "YYYY-MM-DD">,
        stats:
        [
          [
            <event name: string>,
            <event weekly duration: float>,
            <event weekly percentage: float>,
          ],
          ...
        ],
      ],
      ...
    ],
    monthly_stats: [
      month:
      [
        <start date: string "YYYY-MM-DD">,
        stats:
        [
          [
            <event name: string>,
            <event monthly duration: float>,
            <event monthly percentage: float>,
          ],
          ...
        ],
      ],
      ...
    ],
    yearly_stats: [
      year:
      [
        <start date: string "YYYY-MM-DD">,
        stats:
        [
          [
            <event name: string>,
            <event yearly duration: float>,
            <event yearly percentage: float>,
          ],
          ...
        ],
      ],
      ...
    ],
    era_stats: [
      era:
      [
        <start date: string "YYYY-MM-DD">,
        stats:
        [
          [
            <event name: string>,
            <event era duration: float>,
            <event era percentage: float>,
          ],
          ...
        ],
      ],
      ...
    ],
    all_time_stats: [
      [
        <event name: string>,
        <event total duration: float>,
        <event total percentage: float>,
      ],
      ...
    ],
  }
*/
let parsedEvents = {
  day_events: new Map(),
  weekly_stats: [],
  monthly_stats: [],
  yearly_stats: [],
  era_stats: [],
  all_time_stats: [],
};

let tableTds = Array.from(schedule_table_main_section.children).slice(1);
let toggleInputs = Array.from(toggles_fieldset.children).slice(1).map(x => [x.textContent.trim(), x.children[0]]);
let toggleInputsObject = Object.fromEntries(toggleInputs);
let toggleEventsSet = new Set(toggleInputs.map(x => x[0]));
let eventButtons = Object.fromEntries(
  Array.from(document.querySelectorAll('#events_div button, #events_div label')).map(x => [x.textContent.trim(), x])
);

let parseEventsDirtyBit = true;

let localStorageErrorPrinted = false;

let currentlyCalculatingLocalStorageSize = false;


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


let currentEvent = 'Nothing';
let currentHighlightedEvent = null;

let eventStorage = new PlannerPersistentStorage();

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
