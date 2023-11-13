// converts a uint8array to a utf16 string
// each char code corresponds to 2 bytes, big endian
// string has 0 or 1 added to beginning, depending on if the input array has an even (0) or odd (1) number of bytes
function uint8ArrayToPackedUtf16(inputArray) {
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

// converts a utf16 string to a uint8array
// see above for format specifications
function packedUtf16ToUint8Array(inputString) {
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
