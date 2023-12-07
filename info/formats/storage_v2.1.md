# Events Storage Format V2.1 (Awaiting Redefine)
```
this version is a slight modificaiton of v2 that stores data in a manner similar to the binary version

format is in JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

json:
  object {
    ["majorVer"] number (2 only): the format version (always 2 for this format)
    ["minorVer"] number (1 only): the format version (always 1 for this format)
    ["eventNamesToIDs"]: object: maps event names to integer ids, used for efficiency in the binary format
      {
        [key: event name string]: number: id,
          special ids:
            none
        ...
      }
    ["eventButtons"]: object: arbitrarily nested listing of visible buttons corresponding to events
      {
        [key: event id number as string | event category name]: string | object: contains listing about one button or a category
          if string:
            "button": object describes a button that changes main event
            "toggle": object describes a toggle for a toggleable event
            "seperator": object is a visual seperator (can set key to "" for this object)
            "button-custom": object is a "custom" button, when pressed will prompt user for custom event name and add it to the bottom of the list
            "button-custom-one-time": object is a "one-time custom" button, when pressed will prompt user for custom event name, however the event will not get added to the buttons list
          if array:
            [
              [0] string: object type
                "button", "toggle", "seperator": same behavior as above
              object type "button-custom":
                [1] object: button custom properties
                  {
                    ["categoryPath"] (optional): array: path to category, last entry is category name
                      this is the category that the custom event will be added to (will create parent categories and category itself if needed)
                      if this property is omitted new event buttons will get added to root eventButtons object instead
                  }
            ]
          if object:
            object dsecribes a category of events, in same format as ["eventButtons"]
      }
    ["eventPriorities"]: object: maps event ids to event priority integer
      (higher is higher priority)
      {
        [key: event id number as string]: number: priority integer,
        ...
      }
    ["eventMappings"]: object: contains category mapping and coloring information
      {
        [key: event mapping name string]: object: event mapping data for a particular mapping
          {
            ["eventToGroup"]: object: maps event ids to group ids
              {
                [key: event id number as string]: number: group id,
                  special group ids
                    0 - default
                ...
              }
            ["groupToName"]: object: maps group ids to group names,
              {
                [key: group id number as string]: string: group name,
              }
            ["groupToColor"]: object: maps group ids to css color strings,
              {
                [key: group id number as string]: string: css color,
              }
          }
        ...
      }
    ["events"]: array: the array of events
      [
        zero or more entries of the following format:
        array [
          [0] boolean: visible flag
            used to hide "deleted" events so that the user can undelete them by pressing the undelete button (a purge button is also provided to irreversably remove all invisible events)
          [1] boolean: manually added / edited flag
            if this is true, it indicates an event that was added after the fact, or edited
          [2] number / string: timestamp
            the number of milliseconds since the unix epoch (start of Jan 1 1970) in UTC (this is in contrast to format V1 storing the timestamp in local time)
            if the number is less than or equal to the javascript safe integer limit (9 007 199 254 740 991), it is stored as a number, otherwise it is stored as a string
          [3] number: timestamp offset
            the number of minutes relative to utc of the event, as this is still useful information to know
            example:
              a number of 60 would mean UTC+01:00
          [4] array: active events
            an array of the current active events
          [5] string (optional): annotation
            an optional text description for the event, used if an extra clarification is needed
        ],
        ...
      ]
  }
```
