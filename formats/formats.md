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
      [2] boolean: visible flag
        used to hide "deleted" events so that the user can undelete them by pressing the undelete button (a purge button is also provided to irreversably remove all invisible events)
      [3] boolean (optional): manually added / edited flag
        if this is true, it indicates an event that was added after the fact, or edited
      [4] string (optional): annotation
        this is an optional text description for the event, used if an extra clarification is needed
    ],
    ...
  ]
```
