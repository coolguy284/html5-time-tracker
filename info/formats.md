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

# Events Storage Format V2.1
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

# Events Storage Format V2.1 Binary
```
format is a packed-utf16 (binary) string

binary (shown here as bits):
  <6 bytes>: 'CGTIME' (67, 71, 84, 73, 77, 69)
  xxxxxxxx: u8: major version (2 only)
  xxxxxxxx: u8: minor version (1 only)
  -------a: u8: prefile flags byte
    a: bit: if true, remainder of file is compressed with deflate-raw
  
  remainder of file, possibly compressed with deflate-raw:
  
  <utf-8 codepoint>: number of entries in mainEventsList
  mainEventsList:
    repeated copies of the below:
      <utf-8 codepoint>: length of event name string in bytes
      <utf-8 string>: event name string
  <utf-8 codepoint>: number of entries in eventButtonsKeyList
  eventButtonsKeyList:
    repeated copies of the below:
      <utf-8 codepoint>: length of event button category name or custom button name string in bytes
      <utf-8 string>: category name or custom button name
  eventButtons:
    repeated copies of the below:
      xxxxxxxx: u8: entry type
        0: terminator
        1: button
        2: toggle
        3: seperator
        4: button-custom-one-time
        5: button-custom
        6: category
      entry type terminator:
        nothing
        
        this marks the end of the eventButtons list
      entry type button:
        <eventIndex>: button's event index
      entry type toggle:
        <eventIndex>: toggle's event index
      entry type seperator:
        nothing
      entry type button-custom-one-time:
        <eventButtonsKeyIndex>: button's name index
      entry type button-custom:
        <utf-8 codepoint>: number of entries in categoryPath
        categoryPath:
          repeated copies of the below:
            <eventButtonsKeyIndex>: path's name index
      entry type category:
        <subcopy of eventButtons list, ended by the terminator>
  <utf-8 codepoint>: number of entries in eventPriorities
  eventPriorities:
    repeated copies of the below:
      <eventIndex>: event index of priority entry
    length is length of mainEventsList
  <utf-8 codepoint>: number of entries in eventMappings
  eventMappings:
    repeated copies of the below:
      <utf-8 codepoint>: length of mapping name string in bytes
      <utf-8 string>: mapping name string
      <utf-8 codepoint>: length of groupNamesList
      groupNamesList:
        repeated copies of the below:
          <utf-8 codepoint>: length of group name string in bytes
          <utf-8 string>: group name string
      <utf-8 codepoint>: length of eventToGroup list
      eventToGroup:
        repeated copies of the below:
          <eventIndex>: event that is assigned to a group
          <groupNamesIndex>: group that event is assigned to
      groupToColor:
        repeated copies of the below:
          <groupNamesIndex>: group index
          color:
            xxxxxxxx: color type
              0: css color name index
              1: rgb 24-bit binary
              2: rgba 32-bit binary
              3: css color string
            entry type 0:
              xxxxxxxx: u8: css color name index
            entry type 1:
              xxxxxxxx: u8: red value
              xxxxxxxx: u8: green value
              xxxxxxxx: u8: blue value
            entry type 2:
              xxxxxxxx: u8: red value
              xxxxxxxx: u8: green value
              xxxxxxxx: u8: blue value
              xxxxxxxx: u8: alpha value
            entry type 3:
              <utf-8 codepoint>: length of css color string in bytes
              <utf-8 string>: css color string
  <utf-8 codepoint>: number of entries in events
  events:
    repeated copies of the below:
      edddccba: u8: flags
        a: bit: event is visible
        b: bit: event is estimate
        c: u2: timestamp representation
          0 = u64 milliseconds since 2023-09-01 UTC; u8 hour offset
          1 = u64 milliseconds since 2023-09-01 UTC; u16 minutes offset
          2 = utf-8 codepoint milliseconds since last event; same tz as previous
          3 = utf-8 codepoint milliseconds since last event; u8 hour offset
        d: u3: number of events
          0-6 = this is the number of events
          7 = use utf codepoint to get number of events
        e: bit: event has an annotation

definitions:
  <eventIndex>: index of event in mainEventsList; 1 byte if list length is <= 256; 2 bytes if list length is <= 65536, etc.
  <eventButtonsKeyIndex>: index of event in eventButtonsKeyList; same style as other indices
  <groupNamesIndex>: index of event in groupNamesList plus 1
    0 is reserved for Default event group

css colors list:
  https://www.w3.org/wiki/CSS/Properties/color/keywords
  
  basic:
    0   black                 rgb(  0,   0,   0)
    1   silver                rgb(192, 192, 192)
    2   gray                  rgb(128, 128, 128)
    3   white                 rgb(255, 255, 255)
    4   maroon                rgb(128,   0,   0)
    5   red                   rgb(255,   0,   0)
    6   purple                rgb(128,   0, 128)
    7   fuchsia               rgb(255,   0, 255)
    8   green                 rgb(  0, 128,   0)
    9   lime                  rgb(  0, 255,   0)
   10   olive                 rgb(128, 128,   0)
   11   yellow                rgb(255, 255,   0)
   12   navy                  rgb(  0,   0, 128)
   13   blue                  rgb(  0,   0, 255)
   14   teal                  rgb(  0, 128, 128)
   15   aqua                  rgb(  0, 255, 255)
  
  extended:
   16   aliceblue             rgb(240, 248, 255)
   17   antiquewhite          rgb(250, 235, 215)
   18   aqua                  rgb(  0, 255, 255)
   19   aquamarine            rgb(127, 255, 212)
   20   azure                 rgb(240, 255, 255)
   21   beige                 rgb(245, 245, 220)
   22   bisque                rgb(255, 228, 196)
   23   black                 rgb(  0,   0,   0)
   24   blanchedalmond        rgb(255, 235, 205)
   25   blue                  rgb(  0,   0, 255)
   26   blueviolet            rgb(138,  43, 226)
   27   brown                 rgb(165,  42,  42)
   28   burlywood             rgb(222, 184, 135)
   29   cadetblue             rgb( 95, 158, 160)
   30   chartreuse            rgb(127, 255,   0)
   31   chocolate             rgb(210, 105,  30)
   32   coral                 rgb(255, 127,  80)
   33   cornflowerblue        rgb(100, 149, 237)
   34   cornsilk              rgb(255, 248, 220)
   35   crimson               rgb(220,  20,  60)
   36   cyan                  rgb(  0, 255, 255)
   37   darkblue              rgb(  0,   0, 139)
   38   darkcyan              rgb(  0, 139, 139)
   39   darkgoldenrod         rgb(184, 134,  11)
   40   darkgray              rgb(169, 169, 169)
   41   darkgreen             rgb(  0, 100,   0)
   42   darkgrey              rgb(169, 169, 169)
   43   darkkhaki             rgb(189, 183, 107)
   44   darkmagenta           rgb(139,   0, 139)
   45   darkolivegreen        rgb( 85, 107,  47)
   46   darkorange            rgb(255, 140,   0)
   47   darkorchid            rgb(153,  50, 204)
   48   darkred               rgb(139,   0,   0)
   49   darksalmon            rgb(233, 150, 122)
   50   darkseagreen          rgb(143, 188, 143)
   51   darkslateblue         rgb( 72,  61, 139)
   52   darkslategray         rgb( 47,  79,  79)
   53   darkslategrey         rgb( 47,  79,  79)
   54   darkturquoise         rgb(  0, 206, 209)
   55   darkviolet            rgb(148,   0, 211)
   56   deeppink              rgb(255,  20, 147)
   57   deepskyblue           rgb(  0, 191, 255)
   58   dimgray               rgb(105, 105, 105)
   59   dimgrey               rgb(105, 105, 105)
   60   dodgerblue            rgb( 30, 144, 255)
   61   firebrick             rgb(178,  34,  34)
   62   floralwhite           rgb(255, 250, 240)
   63   forestgreen           rgb( 34, 139,  34)
   64   fuchsia               rgb(255,   0, 255)
   65   gainsboro             rgb(220, 220, 220)
   66   ghostwhite            rgb(248, 248, 255)
   67   gold                  rgb(255, 215,   0)
   68   goldenrod             rgb(218, 165,  32)
   69   gray                  rgb(128, 128, 128)
   70   green                 rgb(  0, 128,   0)
   71   greenyellow           rgb(173, 255,  47)
   72   grey                  rgb(128, 128, 128)
   73   honeydew              rgb(240, 255, 240)
   74   hotpink               rgb(255, 105, 180)
   75   indianred             rgb(205,  92,  92)
   76   indigo                rgb( 75,   0, 130)
   77   ivory                 rgb(255, 255, 240)
   78   khaki                 rgb(240, 230, 140)
   79   lavender              rgb(230, 230, 250)
   80   lavenderblush         rgb(255, 240, 245)
   81   lawngreen             rgb(124, 252,   0)
   82   lemonchiffon          rgb(255, 250, 205)
   83   lightblue             rgb(173, 216, 230)
   84   lightcoral            rgb(240, 128, 128)
   85   lightcyan             rgb(224, 255, 255)
   86   lightgoldenrodyellow  rgb(250, 250, 210)
   87   lightgray             rgb(211, 211, 211)
   88   lightgreen            rgb(144, 238, 144)
   89   lightgrey             rgb(211, 211, 211)
   90   lightpink             rgb(255, 182, 193)
   91   lightsalmon           rgb(255, 160, 122)
   92   lightseagreen         rgb( 32, 178, 170)
   93   lightskyblue          rgb(135, 206, 250)
   94   lightslategray        rgb(119, 136, 153)
   95   lightslategrey        rgb(119, 136, 153)
   96   lightsteelblue        rgb(176, 196, 222)
   97   lightyellow           rgb(255, 255, 224)
   98   lime                  rgb(  0, 255,   0)
   99   limegreen             rgb( 50, 205,  50)
  100   linen                 rgb(250, 240, 230)
  101   magenta               rgb(255,   0, 255)
  102   maroon                rgb(128,   0,   0)
  103   mediumaquamarine      rgb(102, 205, 170)
  104   mediumblue            rgb(  0,   0, 205)
  105   mediumorchid          rgb(186,  85, 211)
  106   mediumpurple          rgb(147, 112, 219)
  107   mediumseagreen        rgb( 60, 179, 113)
  108   mediumslateblue       rgb(123, 104, 238)
  109   mediumspringgreen     rgb(  0, 250, 154)
  110   mediumturquoise       rgb( 72, 209, 204)
  111   mediumvioletred       rgb(199,  21, 133)
  112   midnightblue          rgb( 25,  25, 112)
  113   mintcream             rgb(245, 255, 250)
  114   mistyrose             rgb(255, 228, 225)
  115   moccasin              rgb(255, 228, 181)
  116   navajowhite           rgb(255, 222, 173)
  117   navy                  rgb(  0,   0, 128)
  118   oldlace               rgb(253, 245, 230)
  119   olive                 rgb(128, 128,   0)
  120   olivedrab             rgb(107, 142,  35)
  121   orange                rgb(255, 165,   0)
  122   orangered             rgb(255,  69,   0)
  123   orchid                rgb(218, 112, 214)
  124   palegoldenrod         rgb(238, 232, 170)
  125   palegreen             rgb(152, 251, 152)
  126   paleturquoise         rgb(175, 238, 238)
  127   palevioletred         rgb(219, 112, 147)
  128   papayawhip            rgb(255, 239, 213)
  129   peachpuff             rgb(255, 218, 185)
  130   peru                  rgb(205, 133,  63)
  131   pink                  rgb(255, 192, 203)
  132   plum                  rgb(221, 160, 221)
  133   powderblue            rgb(176, 224, 230)
  134   purple                rgb(128,   0, 128)
  135   red                   rgb(255,   0,   0)
  136   rosybrown             rgb(188, 143, 143)
  137   royalblue             rgb( 65, 105, 225)
  138   saddlebrown           rgb(139,  69,  19)
  139   salmon                rgb(250, 128, 114)
  140   sandybrown            rgb(244, 164,  96)
  141   seagreen              rgb( 46, 139,  87)
  142   seashell              rgb(255, 245, 238)
  143   sienna                rgb(160,  82,  45)
  144   silver                rgb(192, 192, 192)
  145   skyblue               rgb(135, 206, 235)
  146   slateblue             rgb(106,  90, 205)
  147   slategray             rgb(112, 128, 144)
  148   slategrey             rgb(112, 128, 144)
  149   snow                  rgb(255, 250, 250)
  150   springgreen           rgb(  0, 255, 127)
  151   steelblue             rgb( 70, 130, 180)
  152   tan                   rgb(210, 180, 140)
  153   teal                  rgb(  0, 128, 128)
  154   thistle               rgb(216, 191, 216)
  155   tomato                rgb(255,  99,  71)
  156   turquoise             rgb( 64, 224, 208)
  157   violet                rgb(238, 130, 238)
  158   wheat                 rgb(245, 222, 179)
  159   white                 rgb(255, 255, 255)
  160   whitesmoke            rgb(245, 245, 245)
  161   yellow                rgb(255, 255,   0)
  162   yellowgreen           rgb(154, 205,  50)
  
  additional colors not on website:
  163   transparent           rgba(0, 0, 0, 0)
```

# Events Storage Format VX.1 -- Persistent UI File (Future Planned, Optional)
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
