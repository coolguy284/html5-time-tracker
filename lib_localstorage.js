let LOCALSTORAGE_TEST_KEY = 'e'; // the key that is accessed for localstorage testing
let LOCALSTORAGE_INSANE_KEY = 'c284-localStorageInsane'; // the key that is set to the boolean of whether the localstorage sanely stores keys, for convenience
let LOCALSTORAGE_TOTAL_SIZE_KEY = 'c284-localStorageSizeChars'; // the key that is set to the size of the localstorage, for convenience

// pauses execution for a short period of time
function pauseExecution() {
  return new Promise(r => setTimeout(r, 15));
}

// finds the maximum input of a function that returns true, using exponentially increasing binary search
async function findMaxValidInputOfFunc(inputFunc, progressFunc) {
  let lowerBound = 0, upperBound = 2;
  
  if (progressFunc) progressFunc('Initial');
  
  // doubling phase
  while (inputFunc(upperBound)) {
    lowerBound = upperBound;
    upperBound *= 2;
    
    if (progressFunc) progressFunc(`Rising: ${lowerBound} - ${upperBound}`);
    
    await pauseExecution();
  }
  
  // now function returned false for first time, now find where it was false
  while (upperBound - lowerBound > 0) {
    let trueHalfway = (lowerBound + upperBound) / 2;
    let lowerHalfway = Math.floor(trueHalfway);
    let upperHalfway = Math.ceil(trueHalfway);
    
    if (inputFunc(lowerHalfway)) {
      lowerBound = upperHalfway;
    } else {
      upperBound = lowerHalfway;
    }
    
    if (progressFunc) progressFunc(`Narrowing: ${lowerBound} - ${upperBound}`);
    
    await pauseExecution();
  }
  
  return lowerBound - 1;
}

// tests whether localstorage can handle a string as long as the input char times length
function localStorageCanHandle(char, length) {
  try {
    localStorage[LOCALSTORAGE_TEST_KEY] = char.repeat(length);
    delete localStorage[LOCALSTORAGE_TEST_KEY];
    return true;
  } catch (e) {
    return false;
  }
}

// returns how many times char can be repeated and still fit in localstorage
async function findMaxLocalStorageLength(char, progressFunc) {
  return await findMaxValidInputOfFunc(localStorageCanHandle.bind(null, char), progressFunc);
}

// returns null if localstorage successfully stored the string without altering it, object with difference info if not
function localStorageStoresExactly(string) {
  localStorage[LOCALSTORAGE_TEST_KEY] = string;
  let newString = localStorage[LOCALSTORAGE_TEST_KEY];
  delete localStorage[LOCALSTORAGE_TEST_KEY];
  
  if (newString == string) {
    return null;
  }
  
  let errorStrings = [];
  
  if (newString.length != string.length) {
    errorStrings.push(`string length ${string.length}, newString length ${newString.length}`);
  }
  
  let maxReportedDifferences = 10;
  
  let reportedDifferences = 0;
  
  let maxI = Math.min(string.length, newString.length);
  for (let i = 0; i < maxI; i++) {
    if (newString[i] == string[i]) {
      continue;
    }
    
    errorStrings.push(`index: ${i}; old charcode: ${string.charCodeAt(i)}, new charcode: ${newString.charCodeAt(i)}`);
    
    reportedDifferences++;
    
    if (reportedDifferences >= maxReportedDifferences) {
      break;
    }
  }
  
  return errorStrings.join('\n');
}

// gets total amount of characters currently in localStorage, using quota calculation
function getLocalStorageUsageInChars() {
  return Object.keys(localStorage).map(x => x.length + localStorage[x].length).reduce((a, c) => a + c, 0);
}

// checks to make sure localstorage sanely stores strings (meaning utf-16, and without string alteration)
// stores result in localstorage for cachability
async function localStorageTest_FillCache(progressFunc) {
  // test localstorage
  
  let maxLengthE = (await findMaxLocalStorageLength('e', progressFunc ? value => progressFunc(`(1/5) maxLengthE: ${value}`) : null)) + LOCALSTORAGE_TEST_KEY.length;
  let maxLengthUnicode = (await findMaxLocalStorageLength('\u7861', progressFunc ? value => progressFunc(`(2/5) maxLengthUnicode: ${value}`) : null)) + LOCALSTORAGE_TEST_KEY.length;
  
  if (maxLengthE != maxLengthUnicode) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = `LocalStorage does not treat strings as utf-16\nMaximum length of "e" is ${maxLengthE} but maximum length of "\\u7861" is ${maxLengthUnicode}`;
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let maxLengthBigUnicode = (await findMaxLocalStorageLength('\ud83d\ude78', progressFunc ? value => progressFunc(`(3/5) maxLengthBigUnicode: ${value}`) : null)) + LOCALSTORAGE_TEST_KEY.length;
  
  if (maxLengthBigUnicode != Math.floor(maxLengthUnicode / 2)) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = `LocalStorage does not treat U+10000 and above as surrogate pairs\nMaximum length of "\\u7861" is ${maxLengthUnicode} but maximum length of "\\ud83d\\ude78" is ${maxLengthBigUnicode}`;
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let everyCharCode = new Array(65536).fill().map((_, i) => String.fromCharCode(i)).join('');
  
  let result;
  
  if (progressFunc) progressFunc(`(4/5) utf-16 all chars check`);
  
  if (result = localStorageStoresExactly(everyCharCode)) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = `LocalStorage does not perfectly preserve utf-16 strings\n${result}`;
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let invalidSurrogatePair = '\udbff\udfff';
  
  if (progressFunc) progressFunc(`(5/5) utf-16 invalid surrogate check`);
  
  if (result = localStorageStoresExactly(invalidSurrogatePair)) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = `LocalStorage does not perfectly preserve utf-16 strings\n${result}`;
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  // by this point localstorage is proven sane, so vars can be saved
  
  if (progressFunc) progressFunc(`getting current size`);
  
  let maxSizeInChars = maxLengthE + getLocalStorageUsageInChars();
  
  localStorage[LOCALSTORAGE_INSANE_KEY] = '0';
  localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY] = maxSizeInChars;
}

// checks to make sure localstorage sanely stores strings (meaning utf-16, and without string alteration)
// if it is sane, returns an object describing the capabilities of the localstorage
async function localStorageTest() {
  if (!(LOCALSTORAGE_INSANE_KEY in localStorage)) {
    await localStorageTest_FillCache();
  }
  
  if (localStorage[LOCALSTORAGE_INSANE_KEY] == '0') {
    let maxSizeInChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
    
    if (!Number.isSafeInteger(maxSizeInChars)) {
      await localStorageTest_FillCache();
      
      return localStorageTest();
    }
    
    return {
      sane: true,
      maxSizeInChars: maxSizeInChars,
      maxSizeInBytes: maxSizeInChars * 2,
    };
  } else {
    return {
      sane: false,
      problem: localStorage[LOCALSTORAGE_INSANE_KEY],
    };
  }
}

// gets whether localstorage is sane using cached value, calculating it on the fly if it doesn't exist yet
async function isLocalStorageSane() {
  if (!(LOCALSTORAGE_INSANE_KEY in localStorage)) {
    await localStorageTest_FillCache();
  }
  
  return localStorage[LOCALSTORAGE_INSANE_KEY] == '0';
}

//// gets total size of localstorage in characters, assuming sanity
//async function getTotalLocalStorageSizeInChars() {
//  // quota size of localstorage test key name must be included
//  return getLocalStorageUsageInChars() + (await findMaxLocalStorageLength('e')) + LOCALSTORAGE_TEST_KEY.length;
//}

// gets total size of localstorage using cached value, calculating it on the fly if it doesn't exist yet
async function getTotalLocalStorageSizeInChars() {
  let totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  
  if (!Number.isSafeInteger(totalChars)) {
    await localStorageTest_FillCache();
    
    if (localStorage[LOCALSTORAGE_INSANE_KEY] != '0') throw new Error(`Localstorage not sane:\n${localStorage[LOCALSTORAGE_INSANE_KEY]}`);
    
    totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  }
  
  return totalChars;
}

// same as above but stores total size of localstorage in a localstorage entry so it doesn't need to be tested again
async function localStorageReport(progressFunc) {
  let totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  
  if (!Number.isSafeInteger(totalChars)) {
    await localStorageTest_FillCache(progressFunc);
    
    if (localStorage[LOCALSTORAGE_INSANE_KEY] != '0') throw new Error(`Localstorage not sane:\n${localStorage[LOCALSTORAGE_INSANE_KEY]}`);
    
    totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  }
  
  let usedChars = getLocalStorageUsageInChars();
  let freeChars = totalChars - usedChars;
  
  return {
    usedChars,
    freeChars,
    totalChars,
    usedBytes: usedChars * 2,
    freeBytes: freeChars * 2,
    totalBytes: totalChars * 2,
  };
}

function localStorageInfoRemoveCache() {
  delete localStorage[LOCALSTORAGE_INSANE_KEY];
  delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
}

async function localStorageInfoRecalculate(progressFunc) {
  await localStorageTest_FillCache(progressFunc);
}
