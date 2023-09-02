let currentEvent = 'Nothing';

/* [[<time string: string>, <event name: string>, <deleted: boolean>, <estimated: boolean>, <additional info: string>], ...] */
let eventsArr;

function loadEventsArr() {
  if (localStorage.html5_time_planner_events_arr) {
    try {
      eventsArr = JSON.parse(localStorage.html5_time_planner_events_arr);
    } catch (e) {}
  }
  
  if (!eventsArr) eventsArr = [];
}

loadEventsArr();

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
