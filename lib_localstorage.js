let LOCALSTORAGE_TEST_KEY = 'e'; // the key that is accessed for localstorage testing
let LOCALSTORAGE_INSANE_KEY = 'c284-localStorageInsane'; // the key that is set to the boolean of whether the localstorage sanely stores keys, for convenience
let LOCALSTORAGE_TOTAL_SIZE_KEY = 'c284-localStorageSizeChars'; // the key that is set to the size of the localstorage, for convenience

// pauses execution for a short period of time
function pauseExecution() {
  return new Promise(r => setTimeout(r, 15));
}

// finds the maximum input of a function that returns true, using exponentially increasing binary search
async function findMaxValidInputOfFunc(inputFunc) {
  let lowerBound = 0, upperBound = 2;
  
  // doubling phase
  while (inputFunc(upperBound)) {
    lowerBound = upperBound;
    upperBound *= 2;
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
async function findMaxLocalStorageLength(char) {
  return await findMaxValidInputOfFunc(localStorageCanHandle.bind(null, char));
}

// returns whether localstorage successfully stored the string without altering it
function localStorageStoresExactly(string) {
  localStorage[LOCALSTORAGE_TEST_KEY] = string;
  let success = localStorage[LOCALSTORAGE_TEST_KEY] == string;
  delete localStorage[LOCALSTORAGE_TEST_KEY];
  return success;
}

// gets total amount of characters currently in localStorage, using quota calculation
function getLocalStorageUsageInChars() {
  return Object.keys(localStorage).map(x => x.length + localStorage[x].length).reduce((a, c) => a + c, 0);
}

// checks to make sure localstorage sanely stores strings (meaning utf-16, and without string alteration)
// stores result in localstorage for cachability
async function localStorageTest_FillCache() {
  // test localstorage
  
  let maxLengthE = (await findMaxLocalStorageLength('e')) + LOCALSTORAGE_TEST_KEY.length;
  let maxLengthUnicode = (await findMaxLocalStorageLength('\u7861')) + LOCALSTORAGE_TEST_KEY.length;
  
  if (maxLengthE != maxLengthUnicode) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = 'LocalStorage does not treat strings as utf-16';
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let maxLengthBigUnicode = (await findMaxLocalStorageLength('\ud83d\ude78')) + LOCALSTORAGE_TEST_KEY.length;
  
  if (maxLengthBigUnicode != maxLengthUnicode / 2) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = 'LocalStorage does not treat U+10000 and above as surrogate pairs';
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let everyCharCode = new Array(65536).fill().map((_, i) => String.fromCharCode(i)).join('');
  
  if (!localStorageStoresExactly(everyCharCode)) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = 'LocalStorage does not perfectly preserve strings';
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  let invalidSurrogatePair = '\udbff\udfff';
  
  if (!localStorageStoresExactly(invalidSurrogatePair)) {
    localStorage[LOCALSTORAGE_INSANE_KEY] = 'LocalStorage does not perfectly preserve strings';
    if (LOCALSTORAGE_TOTAL_SIZE_KEY in localStorage) delete localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY];
    return;
  }
  
  // by this point localstorage is proven sane, so vars can be saved
  
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
    
    if (localStorage[LOCALSTORAGE_INSANE_KEY] != '0') throw new Error('Localstorage not sane');
    
    totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  }
  
  return totalChars;
}

// same as above but stores total size of localstorage in a localstorage entry so it doesn't need to be tested again
async function localStorageReport() {
  let totalChars = parseInt(localStorage[LOCALSTORAGE_TOTAL_SIZE_KEY]);
  
  if (!Number.isSafeInteger(totalChars)) {
    await localStorageTest_FillCache();
    
    if (localStorage[LOCALSTORAGE_INSANE_KEY] != '0') throw new Error('Localstorage not sane');
    
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

async function localStorageInfoRecalculate() {
  await localStorageTest_FillCache();
}
