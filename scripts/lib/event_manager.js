class EventManager {
  // instance fields
  
  #storageManager;
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
  
  // constructor
  
  constructor(storageManager) {
    this.#storageManager = storageManager;
  }
  
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
    this.#setMediumVer(EventManager.getLatestVer());
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
  async #attemptLoadFromMedium() {
    if (!(await this.#storageManager.dataIsStored())) {
      return false;
    }
    
    let versionLoader = new VersionTransmuter();
    
    let mediumText = await this.#storageManager.getDataAsUtf16();
    
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
  
  async loadFromMediumOrFillWithDefault() {
    if (!(await this.#attemptLoadFromMedium())) {
      this.#setStorageVersionToLatest();
      this.#fillWithDefault();
    }
  }
  
  // returns true on success, false on failure
  async #saveToMedium() {
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
    
    await this.#storageManager.setDataAsUtf16(localStorageString);
    
    this.#jsDispatchEvent(new CustomEvent('storageUpdate'));
  }
  
  async saveOrCreateNew() {
    if (this.#mediumMajorVer == null) {
      // auto set version to latest version if nothing is stored on disk yet
      this.#setStorageVersionToLatest();
    }
    
    await this.#saveToMedium();
  }
  
  async #loadIfNotAlready() {
    if (this.#events == null) {
      await this.loadFromMediumOrFillWithDefault();
    }
  }
  
  async setMediumVer(opts) {
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
    
    await this.saveOrCreateNew();
  }
  
  // data access
  
  async getNumEvents() {
    await this.#loadIfNotAlready();
    return this.#events.length;
  }
  
  async getEventByIndex(index) {
    await this.#loadIfNotAlready();
    return deepClone(this.#events[index]);
  }
  
  async getAllEvents() {
    await this.#loadIfNotAlready();
    return deepClone(this.#events);
  }
  
  async getEventsSlice(start, end) {
    await this.#loadIfNotAlready();
    return deepClone(this.#events.slice(start, end));
  }
  
  async appendEvent(event) {
    await this.#loadIfNotAlready();
    this.#events.push(deepClone(event));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async setEventAtIndex(index, event) {
    await this.#loadIfNotAlready();
    this.#events[index] = deepClone(event);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async setAllEvents(newEventArr) {
    await this.#loadIfNotAlready();
    this.#events = deepClone(newEventArr);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async spliceEvents(index, amount) {
    await this.#loadIfNotAlready();
    this.#events.splice(index, amount);
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async spliceAndAddEvents(index, amount, newElems) {
    await this.#loadIfNotAlready();
    this.#events.splice(index, amount, ...deepClone(newElems));
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async removeEventsByIndex(indexes) {
    await this.#loadIfNotAlready();
    
    // events must be traversed in sorted reverse order to prevent splicing index issues
    indexes = deepClone(indexes).sort().reverse();
    
    for (let index of indexes) {
      this.#events.splice(index, 1);
    }
    
    this.#jsDispatchEvent(new CustomEvent('eventsUpdate'));
    
    await this.saveOrCreateNew();
  }
  
  async getEventButtons() {
    await this.#loadIfNotAlready();
    return deepClone(this.#eventButtons);
  }
  
  async setEventButtons(newEventButtons) {
    await this.#loadIfNotAlready();
    this.#eventButtons = deepClone(newEventButtons);
    this.#jsDispatchEvent(new CustomEvent('eventButtonsUpdate'));
    await this.saveOrCreateNew();
  }
  
  async getEventPriorities() {
    await this.#loadIfNotAlready();
    return deepClone(this.#eventPriorities);
  }
  
  async setEventPriorities(newEventPriorities) {
    await this.#loadIfNotAlready();
    this.#eventPriorities = deepClone(newEventPriorities);
    this.#jsDispatchEvent(new CustomEvent('eventMappingsPrioritiesUpdate'));
    await this.saveOrCreateNew();
  }
  
  async getEventMappings() {
    await this.#loadIfNotAlready();
    return deepClone(this.#eventMappings);
  }
  
  async setEventMappings(newEventMappings) {
    await this.#loadIfNotAlready();
    this.#eventMappings = deepClone(newEventMappings);
    this.#jsDispatchEvent(new CustomEvent('eventMappingsPrioritiesUpdate'));
    await this.saveOrCreateNew();
  }
  
  // complex commands
  
  async getLatestVisibleEventIndex() {
    for (let i = (await this.getNumEvents()) - 1; i >= 0; i--) {
      if ((await this.getEventByIndex(i))[2]) return i;
    }
    
    return -1;
  }
  
  async getLatestVisibleEvent() {
    let index = await this.getLatestVisibleEventIndex();
    
    if (index >= 0) {
      return await this.getEventByIndex(index);
    }
  }
  
  // eventName is string, eventTime is date, estimate & visible are bools
  async addEvent(eventName, eventTime, estimate, visible) {
    // set default vars
    if (eventTime == null) eventTime = new Date();
    if (estimate == null) estimate = false;
    if (visible == null) visible = true;
    
    let eventTimeString = dateToFullString(eventTime);
    
    await this.appendEvent([eventTimeString, eventName, visible, estimate]);
  }
  
  async removeEventAtIndex(index) {
    await this.spliceEvents(index, 1);
  }
  
  async getAllEventNames() {
    return [
      'Nothing',
      ...VersionTransmuter.v3_getAllEventNames(...await Promise.all([
        this.getAllEvents(),
        this.getEventButtons(),
        this.getEventPriorities(),
        this.getEventMappings(),
      ]))
    ];
  }
  
  async getRemovedEventIndices(start, end) {
    [ start, end ] = normalizeSlice(start, end, await this.getNumEvents());
    
    let events = await this.getEventsSlice(start, end);
    
    let removedEventIndices = events.map((x, i) => !x[2] ? i : null).filter(x => x != null);
    
    return removedEventIndices;
  }
  
  async getBacktemporalEventIndices(start, end) {
    [ start, end ] = normalizeSlice(start, end, await this.getNumEvents());
    
    let events = await this.getEventsSlice(start, end);
    
    let lastEventTime = null, lastRemovedEventTime = null;
    
    let backtemporalEventIndices = [];
    
    for (let i = events.length - 1; i >= 0; i--) {
      let event = events[i];
      
      let eventTime = dateStringToDate(event[0]).getTime();
      let eventVisible = event[2];
      
      if (eventVisible) {
        // normal event
        
        if (eventTime > lastEventTime && lastEventTime != null) {
          // backtemporal event
          backtemporalEventIndices.push(i);
        } else {
          // non backtemporal event
          lastEventTime = eventTime;
        }
        
        lastRemovedEventTime = null;
      } else {
        // removed event
        // dont update eventtime, only update removedeventtime
        if (eventTime > lastEventTime && lastEventTime != null || eventTime > lastRemovedEventTime && lastRemovedEventTime != null) {
          // backtemporal event
          backtemporalEventIndices.push(i);
        } else {
          // non backtemporal event
          lastRemovedEventTime = eventTime;
        }
      }
    }
    
    backtemporalEventIndices.reverse();
    
    return backtemporalEventIndices;
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
