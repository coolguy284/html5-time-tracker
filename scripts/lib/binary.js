function uint8ArrayToBinaryString(inputArray) {
  return Array.from(inputArray).map(x => String.fromCharCode(x)).join('');
}

function binaryStringToUint8Array(inputString) {
  return new Uint8Array(inputString.split('').map(x => x.charCodeAt(0)));
}

// converts a uint8array to a utf16be string
// each char code corresponds to 2 bytes, big endian
// string has 0 or 1 added to beginning, depending on if the input array has an even (0) or odd (1) number of bytes
function uint8ArrayToPackedUtf16BE(inputArray) {
  // array for string output
  let charArray = [];
  
  // string prefix of 0 or 1 based on if input array's length is even (0) or odd (1)
  let outputStringPrefix = inputArray.length % 2 ? '1' : '0';
  
  charArray.push(outputStringPrefix);
  
  // array length rounded down to an even number, for the main bulk of the generated unicode characters
  let evenArrayLength = Math.floor(inputArray.length / 2) * 2;
  
  // generate output string characters
  for (let i = 0; i < evenArrayLength; i += 2) {
    let charCode = inputArray[i] * 256 + inputArray[i + 1];
    
    charArray.push(String.fromCharCode(charCode));
  }
  
  // add the one extra byte if input array has an odd length
  if (inputArray.length % 2 == 1) {
    let charCode = inputArray[inputArray.length - 1] * 256;
    
    charArray.push(String.fromCharCode(charCode));
  }
  
  return charArray.join('');
}

// converts a utf16be string to a uint8array
// see above for format specifications
function packedUtf16BEToUint8Array(inputString) {
  // calculate length of uint8array
  let outputArrayLength;
  
  let outputArrayHasOddLength = inputString[0] == '1';
  
  if (outputArrayHasOddLength) {
    outputArrayLength = (inputString.length - 1) * 2 - 1;
  } else {
    outputArrayLength = (inputString.length - 1) * 2;
  }
  
  // create output array
  let outputArray = new Uint8Array(outputArrayLength);
  
  // fill output array
  let evenStringLength;
  
  if (outputArrayHasOddLength) {
    evenStringLength = inputString.length - 2;
  } else {
    evenStringLength = inputString.length - 1;
  }
  
  for (let i = 0; i < evenStringLength; i++) {
    let charCode = inputString.charCodeAt(i + 1);
    
    outputArray[i * 2] = Math.floor(charCode / 256);
    outputArray[i * 2 + 1] = charCode % 256;
  }
  
  if (outputArrayHasOddLength) {
    let charCode = inputString.charCodeAt(inputString.length - 1);
    
    outputArray[outputArrayLength - 1] = Math.floor(charCode / 256);
  }
  
  return outputArray;
}

// converts a uint8array to a utf16be string
// each char code corresponds to 2 bytes, big endian
function uint8ArrayToUtf16BE(inputArray) {
  // array for string output
  let charArray = [];
  
  // generate output string characters
  for (let i = 0; i < inputArray.length; i += 2) {
    let charCode = inputArray[i] * 256 + inputArray[i + 1];
    
    charArray.push(String.fromCharCode(charCode));
  }
  
  return charArray.join('');
}

// converts a utf16be string to a uint8array
// see above for format specifications
function utf16BEToUint8Array(inputString) {
  // calculate length of uint8array
  let outputArrayLength = inputString.length * 2;
  
  // create output array
  let outputArray = new Uint8Array(outputArrayLength);
  
  // fill output array
  for (let i = 0; i < inputString.length; i++) {
    let charCode = inputString.charCodeAt(i);
    
    outputArray[i * 2] = Math.floor(charCode / 256);
    outputArray[i * 2 + 1] = charCode % 256;
  }
  
  return outputArray;
}

function surrogatePairToCodePoint(highCharCode, lowCharCode) {
  if (!(highCharCode >= 0xd800 && highCharCode <= 0xdbff)) {
    throw new Error('high surrogate not in range');
  } else if (!(lowCharCode >= 0xdc00 && lowCharCode <= 0xdfff)) {
    throw new Error('low surrogate not in range');
  }
  
  return (highCharCode & 0b0000001111111111) * 1024 + (lowCharCode & 0b0000001111111111);
}

function codePointToSurrogatePair(codePoint) {
  if (codePoint <= 0xffff) {
    throw new Error('code point not in surrogate pair range');
  }
  
  return [0xd800 + Math.floor(codePoint / 1024), 0xdc00 + codePoint % 1024];
}

function utf16BEStringToCodePointArray(utf16String) {
  // surrogates: d800-dbff dc00-dfff (1024 is the range of each)
  
  let codePointArray = [];
  
  let lastCharCode;
  
  let lastCharIsHighSurrogate = false;
  
  for (let i = 0; i < utf16String.length; i++) {
    let charCode = utf16String.charCodeAt(i);
    
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      // high surrogate
      if (lastCharIsHighSurrogate) {
        codePointArray.push(lastCharCode);
      } else {
        lastCharIsHighSurrogate = true;
      }
    } else if (charCode >= 0xdc00 && charCode <= 0xdfff) {
      // low surrogate
      if (lastCharIsHighSurrogate) {
        codePointArray.push(surrogatePairToCodePoint(lastCharCode, charCode));
        lastCharIsHighSurrogate = false;
      } else {
        codePointArray.push(charCode);
      }
    } else {
      // regular character
      if (lastCharIsHighSurrogate) {
        codePointArray.push(lastCharCode);
        lastCharIsHighSurrogate = false;
      } else {
        codePointArray.push(charCode);
      }
    }
    
    lastCharCode = charCode;
  }
  
  if (lastCharIsHighSurrogate) {
    codePointArray.push(lastCharCode);
  }
  
  return codePointArray;
}

function codePointArrayToUtf16BEString(codePointArray) {
  let utf16StringArray = [];
  
  for (let codePoint of codePointArray) {
    if (codePoint > 1048576) {
      // codepoint is too big for utf16be
      throw new Error('Codepoint is too big for utf16be');
    } else if (codePoint > 0xffff) {
      // codepoint must be split into surrogates
      utf16StringArray.push(...String.fromCharCode(...codePointToSurrogatePair(codePoint)))
    } else if (codePoint >= 0) {
      // codepoint is within utf-16 range
      utf16StringArray.push(String.fromCharCode(codePoint));
    } else {
      // codepoint is negative or nan
      throw new Error('Codepoint cannot be negative');
    }
  }
  
  return utf16StringArray.join('');
}

function codePointArrayToUtf8Bytes(codePointArray) {
  let utf8Bytes = [];
  
  for (let codePoint of codePointArray) {
    if (codePoint >= 2 ** 42) {
      // codepoint too high
      throw new Error('Codepoint is too big for utf-8');
    } else if (codePoint >= 2 ** 36) {
      // 8 byte codepoint (not really valid utf-8)
      codePoint = BigInt(codePoint);
      
      utf8Bytes.push(...[
        0b11111111n,
        0b10000000n | codePoint >> 36n & 0b00111111n,
        0b10000000n | codePoint >> 30n & 0b00111111n,
        0b10000000n | codePoint >> 24n & 0b00111111n,
        0b10000000n | codePoint >> 18n & 0b00111111n,
        0b10000000n | codePoint >> 12n & 0b00111111n,
        0b10000000n | codePoint >> 6n & 0b00111111n,
        0b10000000n | codePoint & 0b00111111n
      ].map(x => Number(x)));
    } else if (codePoint >= 2 ** (30 + 1)) {
      // 7 byte codepoint (not really valid utf-8)
      codePoint = BigInt(codePoint);
      
      utf8Bytes.push(...[
        0b11111110n,
        0b10000000n | codePoint >> 30n & 0b00111111n,
        0b10000000n | codePoint >> 24n & 0b00111111n,
        0b10000000n | codePoint >> 18n & 0b00111111n,
        0b10000000n | codePoint >> 12n & 0b00111111n,
        0b10000000n | codePoint >> 6n & 0b00111111n,
        0b10000000n | codePoint & 0b00111111n
      ].map(x => Number(x)));
    } else if (codePoint >= 2 ** (24 + 2)) {
      // 6 byte codepoint
      utf8Bytes.push(
        0b11111100 | codePoint >> 30,
        0b10000000 | codePoint >> 24 & 0b00111111,
        0b10000000 | codePoint >> 18 & 0b00111111,
        0b10000000 | codePoint >> 12 & 0b00111111,
        0b10000000 | codePoint >> 6 & 0b00111111,
        0b10000000 | codePoint & 0b00111111
      );
    } else if (codePoint >= 2 ** (18 + 3)) {
      // 5 byte codepoint
      utf8Bytes.push(
        0b11111000 | codePoint >> 24,
        0b10000000 | codePoint >> 18 & 0b00111111,
        0b10000000 | codePoint >> 12 & 0b00111111,
        0b10000000 | codePoint >> 6 & 0b00111111,
        0b10000000 | codePoint & 0b00111111
      );
    } else if (codePoint >= 2 ** (12 + 4)) {
      // 4 byte codepoint
      utf8Bytes.push(
        0b11110000 | codePoint >> 18,
        0b10000000 | codePoint >> 12 & 0b00111111,
        0b10000000 | codePoint >> 6 & 0b00111111,
        0b10000000 | codePoint & 0b00111111
      );
    } else if (codePoint >= 2 ** (6 + 5)) {
      // 3 byte codepoint
      utf8Bytes.push(
        0b11100000 | codePoint >> 12,
        0b10000000 | codePoint >> 6 & 0b00111111,
        0b10000000 | codePoint & 0b00111111
      );
    } else if (codePoint >= 2 ** 7) {
      // 2 byte codepoint
      utf8Bytes.push(
        0b11000000 | codePoint >> 6,
        0b10000000 | codePoint & 0b00111111
      );
    } else if (codePoint >= 0) {
      // 1 byte codepoint
      utf8Bytes.push(codePoint);
    } else {
      // codepoint is negative or nan
      throw new Error('Codepoint cannot be negative');
    }
  }
  
  return new Uint8Array(utf8Bytes);
}

function utf8BytesToCodePointArray(utf8Bytes) {
  let codePointArray = [];
  
  let partialCodePointUnits = [];
  let inMultiByteSequence = false;
  let multiByteSequenceSize;
  let multiByteSequenceIndex;
  
  for (let byte of utf8Bytes) {
    if ((byte & 0b10000000) == 0) {
      // 1 byte codepoint
      codePointArray.push(byte);
    } else if ((byte & 0b11100000) == 0b11000000) {
      // start of 2 byte codepoint
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 2;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
      partialCodePointUnits.push(byte & 0b00011111);
    } else if ((byte & 0b11110000) == 0b11100000) {
      // start of 3 byte codepoint
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 3;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
      partialCodePointUnits.push(byte & 0b00001111);
    } else if ((byte & 0b11111000) == 0b11110000) {
      // start of 4 byte codepoint
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 4;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
      partialCodePointUnits.push(byte & 0b00000111);
    } else if ((byte & 0b11111100) == 0b11111000) {
      // start of 5 byte codepoint
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 5;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
      partialCodePointUnits.push(byte & 0b00000011);
    } else if ((byte & 0b11111110) == 0b11111100) {
      // start of 6 byte codepoint
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 6;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
      partialCodePointUnits.push(byte & 0b00000001);
    } else if ((byte & 0b11111111) == 0b11111110) {
      // start of 7 byte codepoint (not really valid utf-8)
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 7;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
    } else if ((byte & 0b11111111) == 0b11111111) {
      // start of 8 byte codepoint (not really valid utf-8)
      if (inMultiByteSequence) {
        throw new Error('Cannot start multi byte sequence when in one already');
      }
      
      inMultiByteSequence = true;
      multiByteSequenceSize = 8;
      multiByteSequenceIndex = 0;
      partialCodePointUnits.length = 0;
    } else if ((byte & 0b11000000) == 0b10000000) {
      // continuation byte
      if (!inMultiByteSequence) {
        throw new Error('Cannot continue multi byte sequence when not in one');
      }
      
      multiByteSequenceIndex++;
      partialCodePointUnits.push(byte & 0b00111111);
      
      if (multiByteSequenceIndex + 1 >= multiByteSequenceSize) {
        // this byte is final byte of multi byte sequence
        
        codePointArray.push(partialCodePointUnits.reverse().map((x, i) => x * 2 ** (i * 6)).reduce((a, c) => a + c));
        
        inMultiByteSequence = false;
      }
    } else {
      throw new Error('Invalid utf-8 character found');
    }
  }
  
  if (inMultiByteSequence) {
    throw new Error('In multi byte sequence at end of byte array');
  }
  
  return codePointArray;
}

function jsStringToUtf8Bytes(inputString) {
  return codePointArrayToUtf8Bytes(utf16BEStringToCodePointArray(inputString));
}

function utf8BytesToJsString(utf8Bytes) {
  return codePointArrayToUtf16BEString(utf8BytesToCodePointArray(utf8Bytes));
}
