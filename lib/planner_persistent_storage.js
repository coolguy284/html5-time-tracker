class PlannerPersistentStorage {
  events;
  mediumVer;
  mediumBinary;
  
  // data saving and loading
  
  // resets this object to the unloaded state
  resetMemoryData() {
    this.events = null;
    this.mediumVer = null;
    this.mediumBinary = null;
  }
  
  // returns true on success, false on failure
  attemptLoadFromMedium() {
    if (!(LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage)) {
      return false;
    }
    
    let mediumText = localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    
    // hints of a binary string, for now this is unimplemented
    if (mediumText[0] == '0' || mediumText[0] == '1') {
      return false;
    }
    
    // try json
    try {
      let parsed = JSON.parse(mediumText);
      
      if (Array.isArray(parsed)) {
        // format version 1
        this.events = parsed;
        this.mediumVer = 1;
        this.mediumBinary = false;
      } else if (typeof parsed == 'object' && parsed != null) {
        // future versions of the format, if its an object type
        return false;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
    
    return true;
  }
  
  // fill events with default option
  fillWithDefault() {
    this.events = [];
  }
  
  loadFromMediumOrFillWithDefault() {
    if (!this.attemptLoadFromMedium()) {
      this.fillWithDefault();
    }
  }
  
  loadIfNotAlready() {
    if (this.events == null) {
      this.loadFromMediumOrFillWithDefault();
    }
  }
  
  // returns true on success, false on failure
  saveToMedium() {
    if (this.mediumVer == null) {
      return false;
    }
    
    if (this.mediumVer == 1 && this.mediumBinary == false) {
      localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = JSON.stringify(this.events);
    }
    
    return true;
  }
  
  static getLatestMediumVer() {
    return 1;
  }
  
  static getLatestMediumBinary() {
    return false;
  }
  
  saveOrCreateNew() {
    if (this.mediumVer == null) {
      this.mediumVer = PlannerPersistentStorage.getLatestMediumVer();
      this.mediumBinary = PlannerPersistentStorage.getLatestMediumBinary();
    }
    
    this.saveToMedium();
  }
  
  // data access
  
  getNumEvents() {
    this.loadIfNotAlready();
    return this.events.length;
  }
  
  getEventByIndex(index) {
    this.loadIfNotAlready();
    return this.events[index];
  }
  
  getAllEvents() {
    this.loadIfNotAlready();
    return this.events;
  }
  
  setEventAtIndex(index, event) {
    this.events[index] = event;
  }
  
  setAllEvents(newEventArr) {
    this.events = newEventArr;
    this.saveOrCreateNew();
  }
  
  // complex commands
  
  getLatestVisibleEventIndex() {
    for (let i = this.getNumEvents() - 1; i >= 0; i--) {
      if (this.getEventByIndex(i)[2]) return i;
    }
    
    return -1;
  }
  
  // eventName is string, eventTime is date, estimate & visible are bools
  addEvent(eventName, eventTime, estimate, visible) {
    // set default vars
    if (eventTime == null) eventTime = new Date();
    if (estimate == null) estimate = false;
    if (visible == null) visible = true;
    
    let eventTimeString = dateToFullString(eventTime);
    
    this.loadIfNotAlready();
    this.events.push([eventTimeString, eventName, visible, estimate]);
    this.saveOrCreateNew();
  }
  
  spliceAndAdd(index, amount, ...newElems) {
    this.events.splice(index, amount, ...newElems);
  }
  
  removeEventByIndex(index) {
    this.spliceAndAdd(index, 1);
  }
}
