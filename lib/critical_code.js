// keeps track of when asynchronous critical code (such as saving data) is running, and will attempt to stop page close if so

class CriticalCodeManager {
  #unloadListener;
  #criticalCode = [];
  
  // simply stops page unload, since this listener will only be present if critical code is running
  static #beforeUnloadListener(evt) {
    evt.preventDefault();
  }
  
  #disablePageUnload() {
    this.#unloadListener = CriticalCodeManager.#beforeUnloadListener.bind(CriticalCodeManager);
    addEventListener('beforeunload', this.#unloadListener, { capture: true });
  }
  
  #enablePageUnload() {
    removeEventListener('beforeunload', this.#unloadListener, { capture: true });
    this.#unloadListener = null;
  }
  
  // creates an entry in criticalCode array and returns a "handle" of it (index of criticalCode array)
  startCriticalCode() {
    // find available index
    let newIndex = -1;
    
    // if there is a hole in criticalCode array, return that
    for (let i = 0; i < this.#criticalCode; i++) {
      if (!(i in this.#criticalCode)) {
        newIndex = i;
        break;
      }
    }
    
    // no holes found, use index just beyond end of array
    if (newIndex < 0) {
      newIndex = this.#criticalCode.length;
    }
    
    // register beforeunload listener if not already done
    if (this.#criticalCode.length == 0) {
      this.#disablePageUnload();
    }
    
    // set criticalCode entry
    this.#criticalCode[newIndex] = true;
    
    // return handle
    let stopHandle = newIndex;
    
    return {
      stop: this.#getOneTimeUseStopCriticalCode(stopHandle),
    };
  }
  
  // removes existing entry in criticalCode and if possible shrinks size of array
  #stopCriticalCode(handle) {
    // remove existing entry
    delete this.#criticalCode[handle];
    
    // find largest index in criticalCode that is not a hole
    let largestNonHoleIndex;
    for (largestNonHoleIndex = this.#criticalCode.length - 1; largestNonHoleIndex >= 0; largestNonHoleIndex--) {
      if (largestNonHoleIndex in this.#criticalCode) {
        break;
      }
    }
    
    // set array length to one more than this largest index if it isnt already
    if (this.#criticalCode.length - 1 > largestNonHoleIndex) {
      this.#criticalCode.length = largestNonHoleIndex + 1;
      
      // if no more critical pieces of code, remove beforeunload listener
      if (this.#criticalCode.length == 0) {
        this.#enablePageUnload();
      }
    }
  }
  
  #getOneTimeUseStopCriticalCode(handle) {
    let alreadyStopped = false;
    
    return () => {
      if (alreadyStopped) {
        throw new Error('Cannot stop critical code as it is already stopped.');
      }
      
      this.#stopCriticalCode(handle);
      
      alreadyStopped = true;
    };
  }
}
