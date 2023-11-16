// keeps track of when asynchronous critical code (such as saving data) is running, and will attempt to stop page close if so

class CriticalCodeManager {
  #unloadListener;
  #criticalCode = new Set();
  
  // simply stops page unload, since this listener will only be present if critical code is running
  static #beforeUnloadListener(evt) {
    evt.preventDefault();
  }
  
  #disablePageUnload() {
    if (this.#unloadListener) {
      throw new Error('criticalCode unloadListener already added');
    }
    
    this.#unloadListener = CriticalCodeManager.#beforeUnloadListener.bind(CriticalCodeManager);
    
    addEventListener('beforeunload', this.#unloadListener, { capture: true });
  }
  
  #enablePageUnload() {
    if (!this.#unloadListener) {
      throw new Error('criticalCode unloadListener not added');
    }
    
    removeEventListener('beforeunload', this.#unloadListener, { capture: true });
    
    this.#unloadListener = null;
  }
  
  // creates a symbol criticalCode set and returns a function to stop the critical code
  startCriticalCode() {
    let criticalCodeHandle = Symbol('criticalCodeHandle');
    
    // register beforeunload listener if not already done
    if (this.#criticalCode.size == 0) {
      this.#disablePageUnload();
    }
    
    // add criticalCode entry
    this.#criticalCode.add(criticalCodeHandle);
    
    // return stop handle
    return {
      stop: this.#getOneTimeUseStopCriticalCode(criticalCodeHandle),
    };
  }
  
  // removes existing entry in criticalCode and if possible shrinks size of array
  #stopCriticalCode(criticalCodeHandle) {
    if (!this.#criticalCode.has(criticalCodeHandle)) {
      throw new Error('criticalCodeHandle does not exist');
    }
    
    // remove existing entry
    this.#criticalCode.delete(criticalCodeHandle);
    
    // if no more critical pieces of code, remove beforeunload listener
    if (this.#criticalCode.size == 0) {
      this.#enablePageUnload();
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
