# Packed UTF-16

```
for packed utf-16, a sequence of bytes is converted to a utf-16 string with maximal data

string:
  first character:
    '0' bytes have even length
    '1' bytes have odd length (so second byte of final utf-16 character is ignored)
  remaning characters:
    treated as charcode (16 bit unsigned integer representing unicode index of character)
    top and bottom 8 bits contain a byte from the array, in big endian ordering
```

# Events Storage Format V1

```
format is JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

json:
  array [
    zero or more entries of the following format:
    array [
      [0] string: timestamp
        example: "2023-09-30 08:30:00.000 AM UTC+00:00"
      [1] string: event name
        example: "Nothing"
        note: can contain many events in this one string, if seperated by a " | " (the default seperation character)
      [2] boolean (not optional; but default true): visible flag
        used to hide "deleted" events so that the user can undelete them by pressing the undelete button (a purge button is also provided to irreversably remove all invisible events)
      [3] boolean (optional; default false): manually added / edited flag
        if this is true, it indicates an event that was added after the fact, or edited
      [4] string (optional): annotation
        this is an optional text description for the event, used if an extra clarification is needed
    ],
    ...
  ]
```

# Events Storage Format V2 -- Main File
```
this is the human readable version of format v2, which will store the same information as the binary version, but in an easier to understand (but longer) way

format is in JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

json:
  object {
    ["version"] number (2 only): the format version (always 2 for this format)
    ["eventNamesToIds"]: object: maps event names to integer ids, used for efficiency in the binary format
      {
        [key: event name string]: number: id,
          special ids:
            0 - programmatically unlogged
        ...
      }
    ["eventButtons"]: object: arbitrarily nested listing of visible buttons corresponding to events
      {
        [key: event id number as string | event category name]: string | object: contains listing about one button or a category
          if string:
            "button": object describes a button that changes main event
            "toggle": object describes a toggle for a toggleable event
          else:
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
            this is the number of milliseconds since the unix epoch (start of Jan 1 1970) in UTC (this is in contrast to format V1 storing the timestamp in local time)
            if the number is less than or equal to the javascript safe integer limit (9 007 199 254 740 991), it is stored as a number, otherwise it is stored as a string
          [3] number: timestamp offset
            this is the number of minutes relative to utc of the event, as this is still useful information to know
            example:
              a number of 60 would mean UTC+01:00
          [4] array: active events
            an array of the current active events
          [5] string (optional): annotation
            this is an optional text description for the event, used if an extra clarification is needed
        ],
        ...
      ]
  }
```

# Events Storage Format V2 -- Persistent UI File (Future Planned, Optional)
```
contains some saved information for ui persistence
(remembering which tab was open, how far things were scrolled, etc.)

format is in JSON text, stored in whatever manner the text happens to be stored in (for localstorage, utf-16)

json:
  {
    ["page"]: string: which tab the user is currently on (default "events")
    ["extrasPage"]: string: which extras page the user is currently on (default "main")
    ["pageScrolls"]: object: the scroll of each page
      reset if the browser is resized and the page has a wraparound component
      {
        <PENDING>
      }
    ["extrasPageScrolls"]: object: the scroll of each page
      reset if the browser is resized and the page has a wraparound component
      {
        <PENDING>
      }
  }
```
