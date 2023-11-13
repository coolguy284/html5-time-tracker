// keeps track of when asynchronous critical code (such as saving data) is running, and will attempt to stop page close if so

let criticalCode = [];

// creates an entry in criticalCode array and returns a "handle" of it (index of criticalCode array)
function startingCriticalCode() {
  // find available index
  let newIndex = -1;
  
  // if there is a hole in criticalCode array, return that
  for (let i = 0; i < criticalCode; i++) {
    if (!(i in criticalCode)) {
      newIndex = i;
      break;
    }
  }
  
  // no holes found, use index just beyond end of array
  if (newIndex < 0) {
    newIndex = criticalCode.length;
  }
  
  // register beforeunload listener if not already done
  if (criticalCode.length == 0) {
    addEventListener('beforeunload', beforeUnloadListener, { capture: true });
  }
  
  // set criticalCode entry
  criticalCode[newIndex] = true;
  
  // return handle
  return newIndex;
}

// removes existing entry in criticalCode and if possible shrinks size of array
function stoppingCriticalCode(handle) {
  // remove existing entry
  delete criticalCode[handle];
  
  // find largest index in criticalCode that is not a hole
  let largestNonHoleIndex;
  for (largestNonHoleIndex = criticalCode.length - 1; largestNonHoleIndex >= 0; largestNonHoleIndex--) {
    if (largestNonHoleIndex in criticalCode) {
      break;
    }
  }
  
  // set array length to one more than this largest index if it isnt already
  if (criticalCode.length - 1 > largestNonHoleIndex) {
    criticalCode.length = largestNonHoleIndex + 1;
    
    // if no more critical pieces of code, remove beforeunload listener
    if (criticalCode.length == 0) {
      removeEventListener('beforeunload', beforeUnloadListener, { capture: true });
    }
  }
}

// simply stops page unload, since this listener will only be present if critical code is running, due to above logic
let beforeUnloadListener = evt => {
  evt.preventDefault();
};
