class PlannerPersistentStorage {
  // instance fields
  
  #eventButtons;
  #eventPriorities;
  #eventMappings;
  #events;
  #mediumMajorVer;
  #mediumMinorVer;
  #mediumFormat;
  #compressed;
  
  #jsEventTarget = new EventTarget();
  /*
    4 events:
      eventsUpdate
      eventButtonsUpdate
      eventMappingsPrioritiesUpdate
      storageUpdate
  */
  
  // static methods
  
  static getLatestVer() {
    let latestVer = VersionTransmuter.getLatestVer();
    
    return {
      major: latestVer.major,
      minor: latestVer.minor,
      format: latestVer.format,
    };
  }
  
  // data saving and loading
  
  // resets this object to the unloaded state
  resetMemoryData() {
    this.#events = null;
    this.#mediumMajorVer = null;
    this.#mediumMinorVer = null;
    this.#mediumFormat = null;
    
    this.#jsDispatchEvent(new CustomEvent('eventMappingsPrioritiesUpdate'));
    this.#jsDispatchEvent(new CustomEvent('eventButtonsUpdate'));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
  }
  
  getMediumVer() {
    return {
      major: this.#mediumMajorVer,
      minor: this.#mediumMinorVer,
      format: this.#mediumFormat,
    };
  }
  
  #setMediumVer(version) {
    this.#mediumMajorVer = version.major;
    this.#mediumMinorVer = version.minor;
    this.#mediumFormat = version.format;
    
    this.#jsDispatchEvent(new CustomEvent('storageUpdate'));
  }
  
  #setStorageVersionToLatest() {
    this.#setMediumVer(PlannerPersistentStorage.getLatestVer());
  }
  
  // fill events with default option
  #fillWithDefault() {
    let defaultContents = VersionTransmuter.getDefaultContents();
    
    this.#eventButtons = defaultContents.data.eventButtons;
    this.#eventPriorities = defaultContents.data.eventPriorities;
    this.#eventMappings = defaultContents.data.eventMappings;
    this.#events = defaultContents.data.events;
    this.#compressed = defaultContents.data.compressed;
    
    this.#jsDispatchEvent(new CustomEvent('eventMappingsPrioritiesUpdate'));
    this.#jsDispatchEvent(new CustomEvent('eventButtonsUpdate'));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
  }
  
  // returns true on success, false on failure
  #attemptLoadFromMedium() {
    if (!(LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage)) {
      return false;
    }
    
    let versionLoader = new VersionTransmuter();
    
    let mediumText = localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    
    let successfulRead = versionLoader.setData(mediumText);
    
    if (successfulRead) {
      let storageVersion = versionLoader.getVersion();
      
      versionLoader.transmuteVersion({
        major: 3,
        minor: 0,
        format: 'memory',
      });
      
      let data = versionLoader.getData();
      
      this.#eventButtons = data.eventButtons;
      this.#eventPriorities = data.eventPriorities;
      this.#eventMappings = data.eventMappings;
      this.#events = data.events;
      this.#compressed = data.compressed;
      
      this.#setMediumVer({
        major: storageVersion.major,
        minor: storageVersion.minor,
        format: storageVersion.format,
      });
      
      this.#jsDispatchEvent(new CustomEvent('eventMappingsPrioritiesUpdate'));
      this.#jsDispatchEvent(new CustomEvent('eventButtonsUpdate'));
      this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
      
      return true;
    } else {
      return false;
    }
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
      throw new Error('medium not set');
    }
    
    let data = {
      majorVer: 3,
      minorVer: 0,
      eventButtons: this.#eventButtons,
      eventPriorities: this.#eventPriorities,
      eventMappings: this.#eventMappings,
      events: this.#events,
      compressed: this.#compressed,
    };
    
    let versionSaver = new VersionTransmuter();
    
    if (!versionSaver.setData(data)) {
      throw new Error('cannot save as persistent data invalid');
    }
    
    versionSaver.transmuteVersion({
      major: this.#mediumMajorVer,
      minor: this.#mediumMinorVer,
      format: this.#mediumFormat,
    });
    
    let localStorageString = versionSaver.getData();
    
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = localStorageString;
    
    this.#jsDispatchEvent(new CustomEvent('storageUpdate'));
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
    
    if (!('format' in opts)) {
      throw new Error('opts must contain format');
    }
    
    this.#setMediumVer({
      major: opts.major,
      minor: opts.minor,
      format: opts.format,
    });
    
    this.saveOrCreateNew();
  }
  
  // data access
  
  getNumEvents() {
    this.#loadIfNotAlready();
    return this.#events.length;
  }
  
  getEventByIndex(index) {
    this.#loadIfNotAlready();
    return deepClone(this.#events[index]);
  }
  
  getAllEvents() {
    this.#loadIfNotAlready();
    return deepClone(this.#events);
  }
  
  appendEvent(event) {
    this.#loadIfNotAlready();
    this.#events.push(deepClone(event));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    this.saveOrCreateNew();
  }
  
  setEventAtIndex(index, event) {
    this.#loadIfNotAlready();
    this.#events[index] = deepClone(event);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    this.saveOrCreateNew();
  }
  
  setAllEvents(newEventArr) {
    this.#loadIfNotAlready();
    this.#events = deepClone(newEventArr);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    this.saveOrCreateNew();
  }
  
  spliceEvents(index, amount) {
    this.#loadIfNotAlready();
    this.#events.splice(index, amount);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    this.saveOrCreateNew();
  }
  
  spliceAndAddEvents(index, amount, ...newElems) {
    this.#loadIfNotAlready();
    this.#events.splice(index, amount, ...deepClone(newElems));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    this.saveOrCreateNew();
  }
  
  getEventButtons() {
    this.#loadIfNotAlready();
    return deepClone(this.#eventButtons);
  }
  
  setEventButtons(newEventButtons) {
    this.#loadIfNotAlready();
    this.#eventButtons = deepClone(newEventButtons);
    this.#jsDispatchEvent(new CustomEvent('eventButtonsUpdate'));
    this.saveOrCreateNew();
  }
  
  getEventPriorities() {
    this.#loadIfNotAlready();
    return deepClone(this.#eventPriorities);
  }
  
  getEventMappings() {
    this.#loadIfNotAlready();
    return deepClone(this.#eventMappings);
  }
  
  // complex commands
  
  getLatestVisibleEventIndex() {
    for (let i = this.getNumEvents() - 1; i >= 0; i--) {
      if (this.getEventByIndex(i)[2]) return i;
    }
    
    return -1;
  }
  
  getLatestVisibleEvent() {
    let index = this.getLatestVisibleEventIndex();
    
    if (index >= 0) {
      return this.getEventByIndex(index);
    }
  }
  
  // eventName is string, eventTime is date, estimate & visible are bools
  addEvent(eventName, eventTime, estimate, visible) {
    // set default vars
    if (eventTime == null) eventTime = new Date();
    if (estimate == null) estimate = false;
    if (visible == null) visible = true;
    
    let eventTimeString = dateToFullString(eventTime);
    
    this.appendEvent([eventTimeString, eventName, visible, estimate]);
  }
  
  removeEventAtIndex(index) {
    this.spliceEvents(index, 1);
  }
  
  // event target methods
  
  jsAddEventListener(...args) {
    this.#jsEventTarget.addEventListener(...args);
  }
  
  jsRemoveEventListener(...args) {
    this.#jsEventTarget.removeEventListener(...args);
  }
  
  #jsDispatchEvent(evt) {
    return this.#jsEventTarget.dispatchEvent(evt);
  }
}
