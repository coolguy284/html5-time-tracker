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
let currentHighlightedEvent = null;


let storageErrorPrinted = false;
let allStorageErrorPrinted = false;


let storageManager = new StorageManager();
let eventManager = new EventManager(storageManager);
let criticalCodeManager = new CriticalCodeManager();
let asyncManager = new AsyncManager();
let storageUsedMeter = new StorageMeterManager(
  {
    meterDiv: storage_used_meter_div,
    meterSteps: STORAGE_METER_STEPS,
    totalText: storage_total_text,
    usedText: storage_used_text,
    freeText: storage_free_text,
    percentPrecision: 1,
    calcProgressDiv: storage_size_calc_progress_div,
    calcProgressText: storage_size_calc_progress_text,
  }
);
let localStorageUsedMeter = new StorageMeterManager(
  {
    meterDiv: localstorage_used_meter_div,
    meterSteps: STORAGE_METER_STEPS,
    totalText: localstorage_total_text,
    usedText: localstorage_used_text,
    freeText: localstorage_free_text,
    percentPrecision: 5,
    calcProgressDiv: localstorage_size_calc_progress_div,
    calcProgressText: localstorage_size_calc_progress_text,
  }
);
let totalStorageUsedMeter = new StorageMeterManager(
  {
    meterDiv: total_storage_used_meter_div,
    meterSteps: STORAGE_METER_STEPS,
    totalText: total_storage_total_text,
    usedText: total_storage_used_text,
    freeText: total_storage_free_text,
    percentPrecision: 5,
    calcProgressDiv: null,
    calcProgressText: null,
  }
);
let editPageEventsShown = new IntegerSelectWithCustom(
  events_shown,
  events_shown_custom,
  'Custom',
  {
    'All': Infinity,
  }
);

let mainPageManager = new PageManager();
let extrasPageManager = new PageManager();

let globalEventTarget = new EventTarget();
