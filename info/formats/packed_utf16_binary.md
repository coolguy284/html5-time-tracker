# Packed UTF-16 Binary

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
