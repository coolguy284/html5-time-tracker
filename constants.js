let DATA_VIEW_ADDL_INFO_BIG_INDENT = false;
let EVENT_MAPPINGS_DEFAULT_EVENT_GROUP = 'Default';
let EVENT_MAPPINGS_DEFAULT_EVENT_GROUP_COLOR = 'black';
let EVENT_MAPPINGS_EVENT_PROGRAMATICALLY_UNLOGGED = 'Programmatic Unlogged';
let EVENT_MAPPINGS = {
  'Original': {
    eventToGroup: {
      'Nothing': 'Nothing',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Error (Last Event Too Long)': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      'Unlogged': 'Nothing',
      'Unknown': 'Unknown',
      [EVENT_MAPPINGS_EVENT_PROGRAMATICALLY_UNLOGGED]: 'Nothing',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': '___EVENT_DATA___',
    },
    eventPriorities: [
      'Unlogged',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      'Error (Last Event Too Long)',
      '___EVENT_DATA___',
      'Unknown',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      
      'Nothing',
    ],
    groupToColor: {
      'Nothing': 'lightblue',
      '___EVENT_DATA___': 'orange',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'pink',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'red',
      '___EVENT_DATA___': 'green',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Fun': '___EVENT_DATA___',
      '___EVENT_DATA___': 'blue',
      'Unknown': 'gray',
      [EVENT_MAPPINGS_DEFAULT_EVENT_GROUP]: 'black',
    },
  },
  'Cleaned': {
    eventToGroup: {
      'Nothing': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      'Error (Last Event Too Long)': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      'Unlogged': 'Nothing',
      'Unknown': 'Nothing',
      [EVENT_MAPPINGS_EVENT_PROGRAMATICALLY_UNLOGGED]: 'Nothing',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': '___EVENT_DATA___',
    },
    eventPriorities: [
      'Unlogged',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      'Error (Last Event Too Long)',
      '___EVENT_DATA___',
      'Unknown',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      
      'Nothing',
    ],
    groupToColor: {
      'Nothing': 'lightblue',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Pre and Post ___EVENT_DATA___ Preparations': 'pink',
      '___EVENT_DATA___': 'red',
      '___EVENT_DATA___': 'orange',
      'Fun': '___EVENT_DATA___',
      '___EVENT_DATA___': 'blue',
      '___EVENT_DATA___': '___EVENT_DATA___',
      [EVENT_MAPPINGS_DEFAULT_EVENT_GROUP]: 'lightblue',
    },
  },
  'Super Cleaned': {
    eventToGroup: {
      'Nothing': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      'Error (Last Event Too Long)': 'Nothing',
      '___EVENT_DATA___': 'Nothing',
      'Unlogged': 'Nothing',
      'Unknown': 'Nothing',
      [EVENT_MAPPINGS_EVENT_PROGRAMATICALLY_UNLOGGED]: 'Nothing',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Pre and Post ___EVENT_DATA___ Preparations',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___ & ___EVENT_DATA___': 'Fun',
      
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': 'Fun',
      '___EVENT_DATA___': '___EVENT_DATA___',
    },
    eventPriorities: [
      'Unlogged',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      'Error (Last Event Too Long)',
      '___EVENT_DATA___',
      'Unknown',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      
      'Nothing',
    ],
    groupToColor: {
      'Nothing': 'lightblue',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Pre and Post ___EVENT_DATA___ Preparations': 'pink',
      '___EVENT_DATA___': 'red',
      'Fun': '___EVENT_DATA___',
      '___EVENT_DATA___': 'blue',
      '___EVENT_DATA___': '___EVENT_DATA___',
      [EVENT_MAPPINGS_DEFAULT_EVENT_GROUP]: 'lightblue',
    },
  },
  '___EVENT_DATA___ Only': {
    eventToGroup: {
      'Nothing': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Error (Last Event Too Long)': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      'Unlogged': '___EVENT_DATA___',
      'Unknown': '___EVENT_DATA___',
      [EVENT_MAPPINGS_EVENT_PROGRAMATICALLY_UNLOGGED]: 'Nothing',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___': '___EVENT_DATA___',
      
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': '___EVENT_DATA___',
    },
    eventPriorities: [
      'Unlogged',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___ ___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___ & ___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      'Error (Last Event Too Long)',
      '___EVENT_DATA___',
      'Unknown',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      '___EVENT_DATA___',
      
      '___EVENT_DATA___',
      
      'Nothing',
    ],
    groupToColor: {
      '___EVENT_DATA___': '___EVENT_DATA___',
      '___EVENT_DATA___': 'orange',
      'Nothing': 'lightblue',
      [EVENT_MAPPINGS_DEFAULT_EVENT_GROUP]: 'lightblue',
    },
  },
};
let DEFAULT_EVENT_MAPPING = 'Original';
let MULTI_EVENT_SPLIT = ' | ';
let TABLE_DATA_FULL_HEIGHT = 30; // in units of rem
let TABLE_STRIPE_WIDTH = 0.3; // in units of rem

Object.values(EVENT_MAPPINGS).forEach(eventConfig => {
  let eventPriorities = eventConfig.eventPriorities;
  
  eventConfig.eventPriorities = Object.fromEntries(Object.entries(eventPriorities).map(x => [x[1], eventPriorities.length - x[0]]));
});
