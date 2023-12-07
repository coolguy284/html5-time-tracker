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
