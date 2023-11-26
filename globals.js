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
let toggleInputs = [];
let toggleInputsObject = {};
let toggleEventsSet = new Set();
let eventButtons = {};
let eventPriorities = {};
let eventMappings = {};


let parseEventsDirtyBit = true;

let localStorageErrorPrinted = false;

let currentEvent = 'Nothing';
let currentHighlightedEvent = null;

let eventStorage = new PlannerPersistentStorage();
let criticalCodeManager = new CriticalCodeManager();
let asyncManager = new AsyncManager();
