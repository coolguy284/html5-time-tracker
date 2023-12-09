# Events Storage Format V3.0
```
this version is a slight modificaiton of v2 that stores data in a manner similar to the binary version

format is in JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

note: all numbers are stored as strings if they are outside the safe integer range (in principle, in practice it doesnt matter so its not implemented)

json:
  object {
    ["majorVer"] number (3 only): the format version (always 3 for this format)
    ["minorVer"] number (0 only): the format version (always 0 for this format)
    ["compressed"] bool: whether the file has a compressed section
    ["hasAddlUncompressedEvents"]: bool: whether the file has an additional uncompressed events section at the end
    ["eventNamesList"]: array: lists out every event name used by later code
      [
        string: event name string,
        ...
      ]
    ["eventButtonsKeyList"]: array: lists out every string in a button or category's name
      [
        string: button/category name string,
        ...
      ]
    ["eventButtons"]: array: arbitrarily nested listing of visible buttons corresponding to events
      [
        zero or more entries of the following format:
        array [
          [0] entry type:
            1 = button
            2 = toggle
            3 = seperator
            4 = button-custom-one-time
            5 = button-custom
            6 = category
          entry type button:
            [1] number (eventIndex): button's event index
          entry type toggle:
            [1] number (eventIndex): toggle's event index
          entry type seperator:
            nothing
          entry type button-custom-one-time:
            [1] number (eventButtonsKeyIndex): button's name index
          entry type button-custom:
            [1] number (eventButtonsKeyIndex): button's name index
            [2] array (categoryPath): path to category of custom button
              [
                zero or more entries of the following format:
                number: eventButtonsKeyIndex,
                ...
              ]
          entry type category:
            [1] number (eventButtonsKeyIndex): category's name index
            [2] array (subcopy of eventButtons list)
        ],
        ...
      ]
    ["eventPriorities"]: array: list of events by priority
      (lower index is higher priority)
      [
        zero or more entries of the following format:
        number (eventIndex): index of event
        ...
      ]
    ["eventMappings"]: array: contains category mapping and coloring information
      [
        zero or more entries of the following format:
        array [
          [0] string: mapping name,
          [1] array (groupNamesList) [
            zero or more entries of the following format:
            string: group name string
          ],
          [2] array (eventToGroup) [
            zero or more entries of the following format:
            array: entry [
              [0] number (eventIndex),
              [1] number (groupNamesIndex),
            ],
            ...
          ],
          [3] array (groupToColor) [
            zero or more entries of the following format:
            array: entry [
              [0] number (groupNamesIndex),
              [1] number: color entry type,
              entry type 0:
                [2] number: css color name index,
              entry type 1:
                [2] number: red value,
                [3] number: green value,
                [4] number: blue value,
              entry type 2:
                [2] number: red value,
                [3] number: green value,
                [4] number: blue value,
                [5] number: alpha value,
              entry type 3:
                [2] string: css color string,
            ],
          ],
        ],
        ...
      ]
    ["events"]: array: the array of events
      [
        zero or more entries of the following format:
        array [
          [0] boolean: visible flag
            used to hide "deleted" events so that the user can undelete them by pressing the undelete button (a purge button is also provided to irreversably remove all invisible events)
          [1] boolean: manually added / edited flag
            if this is true, it indicates an event that was added after the fact, or edited
          [2] boolean: annotation exists
          [3] number: timestamp
            the number of milliseconds since 2023-08-23 UTC (this is in contrast to format V1 or V2 storing the timestamp in local time)
          [4] number: timestamp offset
            the number of minutes relative to utc of the event, as this is still useful information to know
            example:
              a number of 60 would mean UTC+01:00
          [5] array: active events
            an array of the current active events
            [
              zero or more entries of the following format:
              number: eventIndex
            ],
          if annotation exists:
            [6] string: annotation
              an optional text description for the event, used if an extra clarification is needed
        ],
        ...
      ]
    if hasAddlUncompressedEvents:
      ["uncompressedEvents"]: array: additional uncompressed events at end
        same format as events array
  }

see binary documentation file for css color names and variable names explanation
```
