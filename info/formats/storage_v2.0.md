# Events Storage Format V2.0
```
format is in JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

json:
  object {
    ["majorVer"] number (2 only): the format version (always 2 for this format)
    ["minorVer"] number (0 only): the format version (always 0 for this format)
    ["eventButtons"]: object: arbitrarily nested listing of visible buttons corresponding to events
      {
        [key: event name as string | event category name]: string | object: contains listing about one button or a category
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
    ["eventPriorities"]: array: event priorities list
      (lower index is higher priority)
      [
        string: event name,
        ...
      ]
    ["eventMappings"]: object: contains category mapping and coloring information
      {
        [key: event mapping name string]: object: event mapping data for a particular mapping
          {
            ["eventToGroup"]: object: maps event names to group names
              {
                [key: event name as string]: string: group name
                ...
              }
            ["groupToColor"]: object: maps group names to css color strings,
              {
                [key: group name number as string]: string: css color,
              }
          }
        ...
      }
    ["events"]: array: the array of events
      [
        zero or more entries of the following format:
        array [
          [0] string: timestamp
            string for local time timestamp
          [1] string: active events
            a string of the current active events, seperated by " | "
          [2] boolean: visible flag
            used to hide "deleted" events so that the user can undelete them by pressing the undelete button (a purge button is also provided to irreversably remove all invisible events)
          [3] boolean (optional): manually added / edited flag
            if this is true, it indicates an event that was added after the fact, or edited
          [4] string (optional): annotation
            an optional text description for the event, used if an extra clarification is needed
        ],
        ...
      ]
  }
```
