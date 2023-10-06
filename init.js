/*
  [
    [
      [
        <start date: string "YYYY-MM-DD">,
        [
          [
            [<event name: string>, <event start time: float (seconds since start of day)>, <event duration: float (seconds' duration of event)>],
            ...
          ],
          ... (7 total)
        ],
        [
          [<event name: string>, <event weekly percentage: float>],
          ...
        ]
      ],
      ...
    ],
    [
      [<event name: string>, <event total percentage: float>],
      ...
    ]
  ]
*/
let parsedWeeks = [[], []];

let tableTds = Array.from(schedule_table_main_section.children).slice(1);
let toggleInputs = Array.from(toggles_fieldset.children).slice(1).map(x => [x.textContent.trim(), x.children[0]]);
let toggleInputsObject = Object.fromEntries(toggleInputs);

let parseWeeksDirtyBit = true;


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

/* [[<time string: string>, <event name: string>, <deleted: boolean>, <estimated: boolean>, <additional info: string>], ...] */
let eventsArr;

function loadEventsArr() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY]) {
    try {
      eventsArr = JSON.parse(localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY]);
    } catch (e) {}
  }
  
  if (!eventsArr) eventsArr = [];
  
  let latestEventIndex = getLatestVisibleEventIndex();
  if (latestEventIndex > -1) {
    let togglesOnSet = new Set(eventsArr[latestEventIndex][1].split(MULTI_EVENT_SPLIT).filter(x => x in toggleInputsObject));
    
    for (toggleEvent in toggleInputsObject) {
      toggleInputsObject[toggleEvent].checked = togglesOnSet.has(toggleEvent);
    }
  }
}

loadEventsArr();
