class PlannerPersistentStorage {
  // instance fields
  
  #eventButtons;
  #eventPriorities;
  #eventMappings;
  #events;
  #mediumMajorVer;
  #mediumMinorVer;
  #mediumBinary;
  
  // static methods
  
  static getLatestVer() {
    return {
      major: 2,
      minor: 0,
      binary: false,
    };
  }
  
  static #deepClone(obj) {
    switch (typeof obj) {
      case 'undefined':
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string':
      case 'symbol':
        return obj;
      
      case 'object':
        if (obj == null) {
          return obj;
        } else if (Array.isArray(obj)) {
          return obj.map(x => PlannerPersistentStorage.#deepClone(x));
        } else {
          return Object.fromEntries(
            Object.entries(obj)
              .map(x => [x[0], PlannerPersistentStorage.#deepClone(x[1])])
          );
        }
      
      case 'function':
        throw new Error('cannot deep clone function');
    }
  }
  
  // data saving and loading
  
  // resets this object to the unloaded state
  resetMemoryData() {
    this.#events = null;
    this.#mediumMajorVer = null;
    this.#mediumMinorVer = null;
    this.#mediumBinary = null;
  }
  
  getMediumVer() {
    return {
      major: this.#mediumMajorVer,
      minor: this.#mediumMinorVer,
      binary: this.#mediumBinary,
    };
  }
  
  #setMediumVer(version) {
    this.#mediumMajorVer = version.major;
    this.#mediumMinorVer = version.minor;
    this.#mediumBinary = version.binary;
  }
  
  #setStorageVersionToLatest() {
    this.#setMediumVer(PlannerPersistentStorage.getLatestVer());
  }
  
  // fill events with default option
  #fillWithDefault() {
    this.#eventButtons = {
      'Nothing': 'button',
      'Event': 'button',
      'Category': {
        'Event In Category': 'button',
        'Subcategory': {
          'Event In Subcategory': 'button',
        },
      },
      'Toggles': {
        'Togglable Event': 'toggle',
      },
    };
    
    this.#eventPriorities = [
      'Event',
      'Event In Category',
      'Event In Subcategory',
      'Toggleable Event',
      'Nothing',
    ];
    
    this.#eventMappings = {
      'Main': {
        'eventToGroup': {
          'Nothing' : 'Nothing',
          'Event' : 'Main',
          'Event In Category' : 'Main',
          'Event In Subcategory' : 'Main',
          'Toggleable Event' : 'Toggles',
        },
        'groupToColor': {
          'Nothing': 'lightblue',
          'Main': 'red',
          'Toggles': 'green',
        },
      }
    };
    
    this.#events = [];
  }
  
  // returns true on success, false on failure
  #attemptLoadFromMedium() {
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
        this.#fillWithDefault();
        this.#events = parsed;
        
        this.#setMediumVer({
          major: 1,
          minor: 0,
          binary: false,
        });
      } else if (typeof parsed == 'object' && parsed != null) {
        // main versions of the format, if its an object type
        
        if (parsed.majorVer == 2 && parsed.minorVer == 0) {
          // v2.0
          this.#eventButtons = parsed.eventButtons;
          this.#eventPriorities = parsed.eventPriorities;
          this.#eventMappings = parsed.eventMappings;
          this.#events = parsed.events;
          
          this.#setMediumVer({
            major: 2,
            minor: 0,
            binary: false,
          });
          
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
    
    return true;
  }
  
  loadFromMediumOrFillWithDefault() {
    if (!this.#attemptLoadFromMedium()) {
      this.#setStorageVersionToLatest();
      this.#fillWithDefault();
    }
  }
  
  // returns true on success, false on failure
  #saveToMedium() {
    if (this.#mediumMajorVer == null) {
      return false;
    }
    
    if (this.#mediumMajorVer == 1 && this.#mediumMinorVer == 0 && this.#mediumBinary == false) {
      // v1.0
      localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = JSON.stringify(this.#events);
      
      return true;
    } else if (this.#mediumMajorVer == 2 && this.#mediumMinorVer == 0 && this.#mediumBinary == false) {
      // v2.0
      localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = JSON.stringify({
        eventButtons: this.#eventButtons,
        eventPriorities: this.#eventPriorities,
        eventMappings: this.#eventMappings,
        events: this.#events,
      });
    
      return true;
    } else {
      return false;
    }
  }
  
  saveOrCreateNew() {
    if (this.#mediumMajorVer == null) {
      // auto set version to latest version if nothing is stored on disk yet
      this.#setStorageVersionToLatest();
    }
    
    this.#saveToMedium();
  }
  
  #loadIfNotAlready() {
    if (this.#events == null) {
      this.loadFromMediumOrFillWithDefault();
    }
  }
  
  setMediumVer(opts) {
    if (!('major' in opts)) {
      throw new Error('opts must contain majorVer');
    }
    
    if (!('minor' in opts)) {
      throw new Error('opts must contain minorVer');
    }
    
    if (!('binary' in opts)) {
      throw new Error('opts must contain binary');
    }
    
    this.#mediumMajorVer = opts.major;
    this.#mediumMinorVer = opts.minor;
    this.#mediumBinary = opts.binary;
    
    this.saveOrCreateNew();
  }
  
  // data access
  
  getNumEvents() {
    this.#loadIfNotAlready();
    return this.#events.length;
  }
  
  getEventByIndex(index) {
    this.#loadIfNotAlready();
    return PlannerPersistentStorage.#deepClone(this.#events[index]);
  }
  
  getAllEvents() {
    this.#loadIfNotAlready();
    return PlannerPersistentStorage.#deepClone(this.#events);
  }
  
  appendEvent(event) {
    this.#events.push(PlannerPersistentStorage.#deepClone(event));
  }
  
  setEventAtIndex(index, event) {
    this.#events[index] = PlannerPersistentStorage.#deepClone(event);
    this.saveOrCreateNew();
  }
  
  setAllEvents(newEventArr) {
    this.#events = PlannerPersistentStorage.#deepClone(newEventArr);
    this.saveOrCreateNew();
  }
  
  spliceEvents(index, amount) {
    this.#events.splice(index, amount);
    this.saveOrCreateNew();
  }
  
  spliceAndAddEvents(index, amount, ...newElems) {
    this.#events.splice(index, amount, ...PlannerPersistentStorage.#deepClone(newElems));
    this.saveOrCreateNew();
  }
  
  getEventButtons() {
    return PlannerPersistentStorage.#deepClone(this.#eventButtons);
  }
  
  getEventPriorities() {
    return PlannerPersistentStorage.#deepClone(this.#eventPriorities);
  }
  
  getEventMappings() {
    return PlannerPersistentStorage.#deepClone(this.#eventMappings);
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
    
    this.#loadIfNotAlready();
    this.appendEvent([eventTimeString, eventName, visible, estimate]);
    this.saveOrCreateNew();
  }
  
  removeEventByIndex(index) {
    this.spliceEvents(index, 1);
    this.saveOrCreateNew();
  }
}
