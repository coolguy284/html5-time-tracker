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
