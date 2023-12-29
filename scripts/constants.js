// event constants
let EVENT_NOTHING = 'Nothing';
let EVENT_UNLOGGED = 'Unlogged';
let EVENT_MAPPINGS_DEFAULT_EVENT_GROUP = 'Default';
let EVENT_MAPPINGS_DEFAULT_EVENT_GROUP_COLOR = 'black';
let DEFAULT_EVENT_MAPPING = 'Main';
let MULTI_EVENT_SPLIT = ' | ';

// storage constants
let LOCALSTORAGE_MAIN_STORAGE_KEY = 'html5_time_planner_events_arr';
let SESSIONSTORAGE_STORAGE_UPDATE_KEY = 'html5_time_planner_storage_update';
let OPFS_MAIN_FOLDER = 'html5_time_planner';
let OPFS_MAIN_STORAGE_FILE = 'events_arr';
let PERSISTENT_STORAGE_COMPRESS_BY_DEFAULT = true;

// render constants
let PAGE_MANAGER_HIDE_PAGE_ON_NULL = false;

// page constants > scroll buttons
let SCROLL_ASSIST_BUTTONS_MIN_SCROLL_HEIGHT = 2000;

// page constants > charts page
let TABLE_DATA_FULL_HEIGHT = 30; // in units of rem
let TABLE_STRIPE_WIDTH = 0.3; // in units of rem
let STATS_ENTRY_COLOR_BLOCK_WIDTH = 1.5; // in units of rem
let STATS_ENTRY_GAP_WIDTH = 0.3; // in units of rem

// page constants > data page
let DATA_VIEW_ADDL_INFO_BIG_INDENT = false;

// page constants > edit page
let EDIT_PAGE_TEXT_MODE_MAX_EVTS_PER_DAY = 15;

// page constants > extras > main & storage pages
let STORAGE_METER_STEPS = [
  { max: 0.5, color: 'rgb(0, 171, 96)' },
  { max: 0.8, color: 'rgb(255, 189, 79)' },
  { max: 1.0, color: 'rgb(226, 40, 80)' },
];

// page constants > extras > raw data page
let RAW_DATA_PRETTIFY_LINE_LIMIT = 140;
