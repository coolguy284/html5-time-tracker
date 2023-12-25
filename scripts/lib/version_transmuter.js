class VersionTransmuter {
  #data = null;
  
  /*
    format options:
      memory
      json
      json utf-8
      binary
  */
  static #versionIndices = [
    { major: 1, minor: 0 },
    { major: 2, minor: 0 },
    { major: 3, minor: 0 },
  ];
  static #validVersions = [
    { major: 1, minor: 0, format: 'memory' },
    { major: 1, minor: 0, format: 'json' },
    { major: 1, minor: 0, format: 'json utf-8' },
    
    { major: 2, minor: 0, format: 'memory' },
    { major: 2, minor: 0, format: 'json' },
    { major: 2, minor: 0, format: 'json utf-8' },
    
    { major: 3, minor: 0, format: 'memory' },
    { major: 3, minor: 0, format: 'json' },
    { major: 3, minor: 0, format: 'json utf-8' },
    //{ major: 3, minor: 0, format: 'binary' },
  ];
  static #possibleDataLossTransitions = {
    /*
      values:
        0 - no loss
        1 - mild metadata loss
        2 - major data loss
     */
    0: {
      up: 0,
    },
    1: {
      up: 1,
      down: 2,
    },
    2: {
      down: 1,
    },
  };
  #majorVer = null;
  #minorVer = null;
  #format = null;
  
  static getLatestVer() {
    return {
      major: 2,
      minor: 0,
      format: 'json',
    }
  }
  
  static getDefaultContents() {
    return {
      version: VersionTransmuter.getLatestVer(),
      
      data: {
        eventButtons: {
          [EVENT_NOTHING]: 'button',
          'Event': 'button',
          'Custom': 'button-custom',
          'One-Time Custom': 'button-custom-one-time',
          'Category': {
            'Event In Category': 'button',
            'Subcategory': {
              'Event In Subcategory': 'button',
            },
          },
          'Toggles': {
            'Togglable Event': 'toggle',
          },
        },
        
        eventPriorities: [
          'Event',
          'Event In Category',
          'Event In Subcategory',
          'Toggleable Event',
          EVENT_NOTHING,
        ],
        
        eventMappings: {
          'Main': {
            'eventToGroup': {
              [EVENT_NOTHING]: EVENT_NOTHING,
              'Event' : 'Main',
              'Event In Category': 'Main',
              'Event In Subcategory': 'Main',
              'Toggleable Event': 'Toggles',
            },
            'groupToColor': {
              [EVENT_NOTHING]: 'lightblue',
              'Main': 'red',
              'Toggles': 'green',
            },
          }
        },
        
        events: [],
        
        compressed: PERSISTENT_STORAGE_COMPRESS_BY_DEFAULT,
      },
    };
  }
  
  #checkVersionValidity(version) {
    for (let validVersion of VersionTransmuter.#validVersions) {
      if (validVersion.major == version.major && validVersion.minor == version.minor && validVersion.format == version.format) {
        return;
      }
    }
    
    throw new Error('Version not valid');
  }
  
  #setDataVersion(version) {
    this.#majorVer = version.major;
    this.#minorVer = version.minor;
    this.#format = version.format;
  }
  
  static #getVersionIndex(major, minor) {
    for (let i = 0; i < VersionTransmuter.#versionIndices.length; i++) {
      let validVersion = VersionTransmuter.#versionIndices[i];
      
      if (validVersion.major == major && validVersion.minor == minor) {
        return i;
      }
    }
  }
  
  static #getVersionFromIndex(index) {
    return VersionTransmuter.#versionIndices[index];
  }
  
  static #detectMemoryObjFormat(obj) {
    if (Array.isArray(obj)) {
      // v1
      
      return {
        major: 1,
        minor: 0,
      };
    } else if (typeof obj == 'object' && obj != null) {
      // main json versions
      
      if (obj.majorVer == 2 && obj.minorVer == 0) {
        // v2.0
        
        return {
          major: 2,
          minor: 0,
        };
      } else if (obj.majorVer == 3 && obj.minorVer == 0) {
        // v3.0
        
        return {
          major: 3,
          minor: 0,
        };
      } else {
        return false;
      }
    }
  }
  
  // return true if success, false if not
  #detectFormatAndPrune() {
    if (typeof this.#data == 'string') {
      if (this.#data[0] == '0' || this.#data[0] == '1') {
        // binary data
        
        let firstChar = String.fromCharCode(Math.floor(this.#data.charCodeAt(1) / 256));
        
        if (firstChar == '{' || this.#data[1] == '[') {
          // binary data represents json most likely
          
          let bytes = packedUtf16BEToUint8Array(this.#data);
          let codePoints = utf8BytesToCodePointArray(bytes);
          let string = codePointArrayToUtf16BEString(codePoints);
          
          try {
            let parsed = JSON.parse(string);
            
            let format = VersionTransmuter.#detectMemoryObjFormat(parsed);
            
            if (format == false) {
              return false;
            } else {
              this.#setDataVersion({
                major: format.major,
                minor: format.minor,
                format: 'json utf-8',
              });
            }
          } catch {
            return false;
          }
        } else {
          // true binary data, for now this is unimplemented
          
          return false;
        }
      } else {
        // regular string
        
        // try json
        try {
          let parsed = JSON.parse(this.#data);
          
          let format = VersionTransmuter.#detectMemoryObjFormat(parsed);
          
          if (format == false) {
            return false;
          } else {
            this.#setDataVersion({
              major: format.major,
              minor: format.minor,
              format: 'json',
            });
          }
        } catch {
          return false;
        }
      }
    } else {
      // memory versions
      
      let format = VersionTransmuter.#detectMemoryObjFormat(this.#data);
      
      if (format == false) {
        return false;
      } else {
        this.#setDataVersion({
          major: format.major,
          minor: format.minor,
          format: 'memory',
        });
        
        if (this.#majorVer >= 2) {
          delete this.#data.majorVer;
          delete this.#data.minorVer;
        }
      }
    }
    
    return true;
  }
  
  getData() {
    return this.#data;
  }
  
  setData(data) {
    this.#data = data;
    
    if (!this.#detectFormatAndPrune()) {
      this.#data = null;
      return false;
    }
    
    return true;
  }
  
  getVersion() {
    return {
      major: this.#majorVer,
      minor: this.#minorVer,
      format: this.#format,
    };
  }
  
  transmuteVersion(version) {
    if (this.#data == null) {
      throw new Error('transmuter object is empty');
    }
    
    this.#checkVersionValidity(version);
    
    if (this.#majorVer == version.major && this.#minorVer == version.minor && this.#format == version.format) {
      return;
    }
    
    switch (this.#format) {
      case 'json':
        this.#transmuteJSONToMemory();
        break;
      
      case 'json utf-8':
        this.#transmuteJSONUTF8ToJSON();
        this.#transmuteJSONToMemory();
        break;
      
      case 'binary':
        this.#transmuteBinaryToMemory();
        break;
    }
    
    let currentVersionIndex = VersionTransmuter.#getVersionIndex(this.#majorVer, this.#minorVer);
    let newVersionIndex = VersionTransmuter.#getVersionIndex(version.major, version.minor);
    
    if (currentVersionIndex < newVersionIndex) {
      while (currentVersionIndex < newVersionIndex) {
        this.#upgradeMemoryVersion();
        currentVersionIndex++;
      }
    } else if (currentVersionIndex > newVersionIndex) {
      while (currentVersionIndex > newVersionIndex) {
        this.#downgradeMemoryVersion();
        currentVersionIndex--;
      }
    }
    
    switch (version.format) {
      case 'json':
        this.#transmuteMemoryToJSON();
        break;
      
      case 'json utf-8':
        this.#transmuteMemoryToJSON();
        this.#transmuteJSONToJSONUTF8();
        break;
      
      case 'binary':
        this.#transmuteMemoryToBinary();
        break;
    }
  }
  
  #upgradeMemoryVersion() {
    if (this.#format != 'memory') {
      throw new Error('cannot upgrade non memory version');
    }
    
    let versionIndex = VersionTransmuter.#getVersionIndex(this.#majorVer, this.#minorVer);
    
    if (versionIndex >= VersionTransmuter.#versionIndices.length - 1) {
      throw new Error('cannot upgrade version past max');
    }
    
    switch (versionIndex) {
      case 0:
        // v1.0
        this.#transmuteMemoryV1toV2();
        break;
      
      case 1:
        // v2.0
        this.#transmuteMemoryV2toV3();
        break;
    }
  }
  
  #downgradeMemoryVersion() {
    if (this.#format != 'memory') {
      throw new Error('cannot downgrade non memory version');
    }
    
    let versionIndex = VersionTransmuter.#getVersionIndex(this.#majorVer, this.#minorVer);
    
    if (versionIndex <= 0) {
      throw new Error('cannot downgrade version past 0');
    }
    
    switch (versionIndex) {
      case 1:
        // v2.0
        this.#transmuteMemoryV2toV1();
        break;
      
      case 2:
        // v3.0
        this.#transmuteMemoryV3toV2();
        break;
    }
  }
  
  #transmuteJSONToMemory() {
    let parsed = JSON.parse(this.#data);
    
    if (this.#majorVer == 1 && this.#minorVer == 0) {
      this.#data = parsed;
    } else if (this.#majorVer == 2 && this.#minorVer == 0) {
      this.#data = {
        eventButtons: parsed.eventButtons,
        eventPriorities: parsed.eventPriorities,
        eventMappings: parsed.eventMappings,
        events: parsed.events,
      };
    } else if (this.#majorVer == 3 && this.#minorVer == 0) {
      let eventNamesList = parsed.eventNamesList;
      let eventButtonsKeyList = parsed.eventButtonsKeyList;
      
      let eventButtons = VersionTransmuter.#v3_parseEventButtons(parsed.eventButtons, eventNamesList, eventButtonsKeyList);
      let eventPriorities = parsed.eventPriorities.map(x => VersionTransmuter.#v3_getEventByIndex(x, eventNamesList));
      let eventMappings = VersionTransmuter.#v3_parseEventMappings(parsed.eventMappings, eventNamesList);
      
      let events;
      
      if (parsed.hasAddlUncompressedEvents) {
        events = [
          ...VersionTransmuter.#v3_parseEvents(parsed.events, eventNamesList),
          ...VersionTransmuter.#v3_parseEvents(parsed.uncompressedEvents, eventNamesList),
        ];
      } else {
        events = VersionTransmuter.#v3_parseEvents(parsed.events, eventNamesList);
      }
      
      let compressed = parsed.compressed;
      
      this.#data = {
        eventButtons,
        eventPriorities,
        eventMappings,
        events,
        compressed,
      };
    } else {
      throw new Error('Version not recognized');
    }
    
    this.#format = 'memory';
  }
  
  #transmuteJSONUTF8ToJSON() {
    let bytes = packedUtf16BEToUint8Array(this.#data);
    let codePoints = utf8BytesToCodePointArray(bytes);
    let string = codePointArrayToUtf16BEString(codePoints);
    this.#data = string;
  }
  
  #transmuteBinaryToMemory() {
    throw new Error('not implemented');
  }
  
  #transmuteMemoryToJSON() {
    if (this.#majorVer == 1 && this.#minorVer == 0) {
      this.#data = JSON.stringify(this.#data);
    } else if (this.#majorVer == 2 && this.#minorVer == 0) {
      this.#data = JSON.stringify({
        majorVer: 2,
        minorVer: 0,
        eventButtons: this.#data.eventButtons,
        eventPriorities: this.#data.eventPriorities,
        eventMappings: this.#data.eventMappings,
        events: this.#data.events,
      });
    } else if (this.#majorVer == 3 && this.#minorVer == 0) {
      let eventNamesList = VersionTransmuter.#v3_getAllEventNames(this.#data.events, this.#data.eventButtons, this.#data.eventPriorities, this.#data.eventMappings);
      let eventButtonsKeyList = Array.from(VersionTransmuter.#v3_getAllEventButtonKeys(this.#data.eventButtons));
      
      let eventButtons = VersionTransmuter.#v3_getEventButtonsArr(this.#data.eventButtons, eventNamesList, eventButtonsKeyList);
      let eventPriorities = this.#data.eventPriorities.map(x => VersionTransmuter.#v3_getEventIndex(x, eventNamesList));
      let eventMappings = VersionTransmuter.#v3_getEventMappingsArr(this.#data.eventMappings, eventNamesList);
      let events = VersionTransmuter.#v3_getEventsArr(this.#data.events, eventNamesList);
      
      this.#data = JSON.stringify({
        majorVer: 3,
        minorVer: 0,
        compressed: this.#data.compressed,
        hasAddlUncompressedEvents: false,
        eventNamesList,
        eventButtonsKeyList,
        eventButtons,
        eventPriorities,
        eventMappings,
        events,
      });
    } else {
      throw new Error('Version not recognized');
    }
    
    this.#format = 'json';
  }
  
  #transmuteJSONToJSONUTF8() {
    let codePoints = utf16BEStringToCodePointArray(this.#data);
    let bytes = codePointArrayToUtf8Bytes(codePoints);
    let packedString = uint8ArrayToPackedUtf16BE(bytes);
    this.#data = packedString;
  }
  
  #transmuteMemoryToBinary() {
    throw new Error('not implemented');
  }
  
  #transmuteMemoryV1toV2() {
    let defaultContents = VersionTransmuter.getDefaultContents();
    
    this.#data = {
      eventButtons: defaultContents.data.eventButtons,
      eventPriorities: defaultContents.data.eventPriorities,
      eventMappings: defaultContents.data.eventMappings,
      events: this.#data,
    };
    
    this.#setDataVersion({
      major: 2,
      minor: 0,
      format: 'memory',
    });
  }
  
  #transmuteMemoryV2toV3() {
    let defaultContents = VersionTransmuter.getDefaultContents();
    
    this.#data = {
      eventButtons: this.#data.eventButtons,
      eventPriorities: this.#data.eventPriorities,
      eventMappings: this.#data.eventMappings,
      events: this.#data.events,
      compressed: defaultContents.data.compressed,
    };
    
    this.#setDataVersion({
      major: 3,
      minor: 0,
      format: 'memory',
    });
  }
  
  #transmuteMemoryV2toV1() {
    this.#data = this.#data.events;
    
    this.#setDataVersion({
      major: 1,
      minor: 0,
      format: 'memory',
    });
  }
  
  #transmuteMemoryV3toV2() {
    this.#data = {
      eventButtons: this.#data.eventButtons,
      eventPriorities: this.#data.eventPriorities,
      eventMappings: this.#data.eventMappings,
      events: this.#data.events,
    };
    
    this.#setDataVersion({
      major: 2,
      minor: 0,
      format: 'memory',
    });
  }
  
  static #v3_getEventIndex(event, eventNamesList) {
    if (typeof event != 'string') {
      throw new Error('cannot get event index of non string');
    }
    
    if (event == EVENT_NOTHING) {
      return 0;
    } else {
      return eventNamesList.indexOf(event) + 1;
    }
  }
  
  static #v3_getEventByIndex(eventIndex, eventNamesList) {
    if (typeof eventIndex != 'number') {
      throw new Error('cannot get event of non number');
    }
    
    if (eventIndex == 0) {
      return EVENT_NOTHING;
    } else {
      return eventNamesList[eventIndex - 1];
    }
  }
  
  static #v3_getGroupIndex(group, groupNamesList) {
    if (typeof group != 'string') {
      throw new Error('cannot get group index of non string');
    }
    
    if (group == EVENT_MAPPINGS_DEFAULT_EVENT_GROUP) {
      return 0;
    } else {
      return groupNamesList.indexOf(group) + 1;
    }
  }
  
  static #v3_getGroupByIndex(groupIndex, groupNamesList) {
    if (typeof groupIndex != 'number') {
      throw new Error('cannot get group of non number');
    }
    
    if (groupIndex == 0) {
      return EVENT_MAPPINGS_DEFAULT_EVENT_GROUP;
    } else {
      return groupNamesList[groupIndex - 1];
    }
  }
  
  static #v3_parseEventButtons(eventButtonsArr, eventNamesList, eventButtonsKeyList) {
    return Object.fromEntries(eventButtonsArr.map(entry => {
      switch (entry[0]) {
        case 1:
          // button
          return [VersionTransmuter.#v3_getEventByIndex(entry[1], eventNamesList), 'button'];
        
        case 2:
          // toggle
          return [VersionTransmuter.#v3_getEventByIndex(entry[1], eventNamesList), 'toggle'];
        
        case 3:
          // seperator
          return ['', 'seperator'];
        
        case 4:
          // button-custom-one-time
          return [eventButtonsKeyList[entry[1]], 'button-custom-one-time'];
        
        case 5:
          // button-custom
          if (entry[2].length == 0) {
            return [eventButtonsKeyList[entry[1]], 'button-custom'];
          } else {
            return [
              eventButtonsKeyList[entry[1]],
              [
                'button-custom',
                {
                  categoryPath: entry[2].map(x => eventButtonsKeyList[x]),
                },
              ]
            ];
          }
        
        case 6:
          // category
          return [
            eventButtonsKeyList[entry[1]],
            VersionTransmuter.#v3_parseEventButtons(entry[2], eventNamesList, eventButtonsKeyList),
          ];
      }
    }));
  }
  
  static #v3_parseEventMappings(eventMappingsArr, eventNamesList) {
    return Object.fromEntries(eventMappingsArr.map(entry => {
      let mappingName = entry[0];
      let groupNamesList = entry[1];
      let eventToGroup = Object.fromEntries(
        entry[2].map(x => [VersionTransmuter.#v3_getEventByIndex(x[0], eventNamesList), VersionTransmuter.#v3_getGroupByIndex(x[1], groupNamesList)])
      );
      let groupToColor = Object.fromEntries(entry[3].map(x => {
        let groupName = VersionTransmuter.#v3_getGroupByIndex(x[0], groupNamesList);
        let cssColor;
        switch (x[1]) {
          case 0:
            cssColor = CSS_COLORS_LIST[x[2]];
            break;
          
          case 1:
            cssColor = `rgb(${x[2]}, ${x[3]}, ${x[4]})`;
            break;
          
          case 2:
            cssColor = `rgba(${x[2]}, ${x[3]}, ${x[4]}, ${x[5]})`;
            break;
          
          case 3:
            cssColor = x[2];
            break;
        }
        return [groupName, cssColor];
      }));
      
      return [mappingName, {
        eventToGroup,
        groupToColor,
      }];
    }));
  }
  
  static #v3_parseEvents(eventsArr, eventNamesList) {
    return eventsArr.map(entry => {
      let visible = entry[0];
      let manual = entry[1];
      let hasAnnotation = entry[2];
      
      let timestamp = new Date(new Date('2023-08-23').getTime() + entry[3]);
      let timestampOffset = entry[4];
      let timestampString = dateToFullStringWithOffset(timestamp, timestampOffset);
      
      let eventString;
      
      if (entry[5].length == 0) {
        eventString = EVENT_NOTHING;
      } else {
        eventString = entry[5].map(x => VersionTransmuter.#v3_getEventByIndex(x, eventNamesList)).join(MULTI_EVENT_SPLIT);
      }
      
      if (hasAnnotation) {
        let annotation = entry[6];
        
        return [
          timestampString,
          eventString,
          visible,
          manual,
          annotation,
        ];
      } else {
        return [
          timestampString,
          eventString,
          visible,
          manual,
        ];
      }
    });
  }
  
  static #v3_getAllEventNamesForButton(eventButtons, eventNames) {
    for (let entry of Object.entries(eventButtons)) {
      let objectType;
      
      if (typeof entry[1] == 'string') {
        objectType = entry[1];
      } else if (Array.isArray(entry[1])) {
        objectType = entry[1][0];
      } else {
        VersionTransmuter.#v3_getAllEventNamesForButton(entry[1], eventNames);
        continue;
      }
      
      switch (objectType) {
        case 'button':
        case 'toggle':
          if (entry[0] != EVENT_NOTHING) {
            eventNames.add(entry[0]);
          }
          break;
      }
    }
  }
  
  static #v3_getAllEventNames(events, eventButtons, eventPriorities, eventMappings) {
    let eventNames = new Set();
    
    VersionTransmuter.#v3_getAllEventNamesForButton(eventButtons, eventNames);
    
    for (let event of eventPriorities) {
      if (event != EVENT_NOTHING) {
        eventNames.add(event);
      }
    }
    
    for (let mapping of Object.values(eventMappings)) {
      for (let event of Object.keys(mapping.eventToGroup)) {
        if (event != EVENT_NOTHING) {
          eventNames.add(event);
        }
      }
    }
    
    for (let eventEntry of events) {
      let eventString = eventEntry[1];
      
      for (let event of eventString.split(MULTI_EVENT_SPLIT)) {
        if (event != EVENT_NOTHING) {
          eventNames.add(event);
        }
      }
    }
    
    return Array.from(eventNames);
  }
  
  static #v3_getAllEventButtonKeys(eventButtons, eventButtonsKeyList) {
    if (eventButtonsKeyList == null) {
      eventButtonsKeyList = new Set();
    }
    
    for (let entry of Object.entries(eventButtons)) {
      let objectType;
      
      if (typeof entry[1] == 'string') {
        objectType = entry[1];
      } else if (Array.isArray(entry[1])) {
        objectType = entry[1][0];
      } else {
        eventButtonsKeyList.add(entry[0]);
        VersionTransmuter.#v3_getAllEventButtonKeys(entry[1], eventButtonsKeyList);
        continue;
      }
      
      switch (objectType) {
        case 'button-custom':
        case 'button-custom-one-time':
          eventButtonsKeyList.add(entry[0]);
          break;
      }
    }
    
    return eventButtonsKeyList;
  }
  
  static #v3_getEventButtonsArr(eventButtons, eventNamesList, eventButtonsKeyList) {
    return Object.entries(eventButtons).map(entry => {
      if (typeof entry[1] == 'object' && !Array.isArray(entry[1])) {
        return [
          6,
          eventButtonsKeyList.indexOf(entry[0]),
          VersionTransmuter.#v3_getEventButtonsArr(entry[1], eventNamesList, eventButtonsKeyList),
        ];
      } else {
        let objectType;
        
        if (Array.isArray(entry[1])) {
          objectType = entry[1][0];
        } else {
          objectType = entry[1];
        }
        
        switch (objectType) {
          case 'button':
            return [1, VersionTransmuter.#v3_getEventIndex(entry[0], eventNamesList)];
          
          case 'toggle':
            return [2, VersionTransmuter.#v3_getEventIndex(entry[0], eventNamesList)];
          
          case 'seperator':
            return [3];
          
          case 'button-custom-one-time':
            return [4, eventButtonsKeyList.indexOf(entry[0])];
          
          case 'button-custom':
            if (Array.isArray(entry[1])) {
              return [
                5,
                eventButtonsKeyList.indexOf(entry[0]),
                entry[1][1].categoryPath.map(x => eventButtonsKeyList.indexOf(x)),
              ];
            } else {
              return [
                5,
                eventButtonsKeyList.indexOf(entry[0]),
                [],
              ];
            }
        }
      }
    });
  }
  
  static #v3_getColorParameters(cssColor) {
    let colorsListIndex = CSS_COLORS_LIST.indexOf(cssColor);
    
    if (colorsListIndex >= 0) {
      return [0, colorsListIndex];
    }
    
    let rgbExec = /^rgb\((0|[1-9]\d{0,2}), (0|[1-9]\d{0,2}), (0|[1-9]\d{0,2})\)$/.exec(cssColor);
    
    if (rgbExec) {
      return [
        1,
        parseInt(rgbExec[1]),
        parseInt(rgbExec[2]),
        parseInt(rgbExec[3]),
      ];
    }
    
    let rgbaExec = /^rgba\((0|[1-9]\d{0,2}), (0|[1-9]\d{0,2}), (0|[1-9]\d{0,2}), (0|[1-9]\d{0,2})\)$/.exec(cssColor);
    
    if (rgbaExec) {
      return [
        2,
        parseInt(rgbaExec[1]),
        parseInt(rgbaExec[2]),
        parseInt(rgbaExec[3]),
        parseInt(rgbaExec[4]),
      ];
    }
    
    return [3, cssColor];
  }
  
  static #v3_getEventMappingsArr(eventMappings, eventNamesList) {
    return Object.entries(eventMappings).map(entry => {
      let mappingName = entry[0];
      let groupNamesList = Array.from(new Set([
        ...Object.values(entry[1].eventToGroup),
        ...Object.keys(entry[1].groupToColor),
      ]));
      let eventToGroup = Object.entries(entry[1].eventToGroup).map(evtEntry => {
        return [
          VersionTransmuter.#v3_getEventIndex(evtEntry[0], eventNamesList),
          VersionTransmuter.#v3_getGroupIndex(evtEntry[1], groupNamesList),
        ];
      });
      let groupToColor = Object.entries(entry[1].groupToColor).map(grpEntry => {
        return [
          VersionTransmuter.#v3_getGroupIndex(grpEntry[0], groupNamesList),
          ...VersionTransmuter.#v3_getColorParameters(grpEntry[1]),
        ];
      });
      
      return [
        mappingName,
        groupNamesList,
        eventToGroup,
        groupToColor,
      ];
    });
  }
  
  static #v3_getEventsArr(events, eventNamesList) {
    return events.map(entry => {
      let visible = entry[2];
      let manual = entry[3] ?? false;
      let hasAnnotation = entry.length > 4;
      
      let timestampString = entry[0];
      let timestamp = dateStringToDate(timestampString).getTime() - new Date('2023-08-23').getTime();
      let timestampOffset = dateStringToTZOffset(timestampString);
      
      let eventString = entry[1];
      
      let eventsArr = eventString.split(MULTI_EVENT_SPLIT).filter(x => x != EVENT_NOTHING).map(x => VersionTransmuter.#v3_getEventIndex(x, eventNamesList));
      
      if (hasAnnotation) {
        let annotation = entry[4];
        
        return [
          visible,
          manual,
          hasAnnotation,
          timestamp,
          timestampOffset,
          eventsArr,
          annotation,
        ];
      } else {
        return [
          visible,
          manual,
          hasAnnotation,
          timestamp,
          timestampOffset,
          eventsArr,
        ];
      }
    });
  }
  
  static transitionHasDataLoss(oldVersion, newVersion) {
    let oldVersionIndex = VersionTransmuter.#getVersionIndex(oldVersion.major, oldVersion.minor);
    let newVersionIndex = VersionTransmuter.#getVersionIndex(newVersion.major, newVersion.minor);
    
    let worstPossibleDataLossNum = 0;
    
    if (oldVersionIndex < newVersionIndex) {
      while (oldVersionIndex < newVersionIndex) {
        let newDataLoss = this.#possibleDataLossTransitions[oldVersionIndex].up;
        worstPossibleDataLossNum = Math.max(worstPossibleDataLossNum, newDataLoss);
        oldVersionIndex++;
      }
    } else if (oldVersionIndex > newVersionIndex) {
      while (oldVersionIndex > newVersionIndex) {
        let newDataLoss = this.#possibleDataLossTransitions[oldVersionIndex].down;
        worstPossibleDataLossNum = Math.max(worstPossibleDataLossNum, newDataLoss);
        oldVersionIndex--;
      }
    }
    
    return worstPossibleDataLossNum;
  }
}
