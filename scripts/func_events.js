async function addEvent(elem) {
  // get data
  
  let eventTime = new Date();
  
  let eventNamesArr = toggleInputs.map(x => x[1].checked ? x[0] : null).filter(x => x);
  
  if (elem.tagName == 'BUTTON') {
    let eventName;
    
    switch (elem.dataset.type) {
      case 'normal':
        eventName = elem.dataset.event;
        break;
      
      case 'one time custom':
        eventName = prompt('Event name?');
        
        if (eventName == null) return;
        break;
      
      case 'custom': {
        eventName = prompt('Event name?');
        
        if (eventName == null) return;
        
        let categoryPath = 'categoryPath' in elem.dataset ? JSON.parse(elem.dataset.categoryPath) : [];
        
        await addEventButtonIfNotAlready(eventName, categoryPath);
        break;
      }
    }
    
    if (eventName == EVENT_UNLOGGED) {
      eventNamesArr = [EVENT_UNLOGGED];
    } else if (eventName != EVENT_NOTHING) {
      eventNamesArr.push(eventName);
    }
  } else {
    let latestEventIndex = await eventManager.getLatestVisibleEventIndex();
    if (latestEventIndex > -1) {
      let latestEventNameArr = (await eventManager.getEventByIndex(latestEventIndex))[1].split(MULTI_EVENT_SPLIT).filter(x => !(x in toggleInputsObject));
      if (latestEventNameArr.length > 1) {
        eventNamesArr.push(...latestEventNameArr);
      } else if (latestEventNameArr.length == 1) {
        if (latestEventNameArr[0] == EVENT_UNLOGGED) {
          eventNamesArr = [EVENT_UNLOGGED];
        } else if (latestEventNameArr[0] != EVENT_NOTHING) {
          eventNamesArr.push(...latestEventNameArr);
        }
      }
    }
  }
  
  let eventName = eventNamesArr.length ? eventNamesArr.join(MULTI_EVENT_SPLIT) : EVENT_NOTHING;
  
  // add to internal events array
  await eventManager.addEvent(eventName, eventTime);
}

let removeLastEvent = asyncManager.wrapAsyncFunctionWithButton(
  'removeLastEvent',
  remove_last_evt_btn,
  async () => {
    let latestVisibleEventIndex = await eventManager.getLatestVisibleEventIndex();
    
    if (latestVisibleEventIndex >= 0) {
      let eventEntry = await eventManager.getEventByIndex(latestVisibleEventIndex);
      eventEntry[2] = false;
      await eventManager.setEventAtIndex(latestVisibleEventIndex, eventEntry);
    }
  }
);

let unRemoveLastEvent = asyncManager.wrapAsyncFunctionWithButton(
  'unRemoveLastEvent',
  unremove_last_evt_btn,
  async () => {
    let latestVisibleEventIndex = await eventManager.getLatestVisibleEventIndex();
    let numEvents = await eventManager.getNumEvents();
    
    if (numEvents > 0 && latestVisibleEventIndex < numEvents - 1) {
      let eventEntry = await eventManager.getEventByIndex(latestVisibleEventIndex + 1);
      eventEntry[2] = true;
      await eventManager.setEventAtIndex(latestVisibleEventIndex + 1, eventEntry);
    }
  }
);

// removes events that are invisible
let purgeRemovedEntries = asyncManager.wrapAsyncFunctionWithButton(
  'purgeRemovedEntries',
  purge_removed_entries_btn,
  async suppressUIUpdate => {
    if (!suppressUIUpdate && !confirm('Are you sure?')) return;
    
    for (let i = (await eventManager.getNumEvents()) - 1; i >= 0; i--) {
      if (!(await eventManager.getEventByIndex(i))[2]) {
        await eventManager.removeEventAtIndex(i);
      }
    }
  }
);

// removes events where a future event has a smaller date/time than a past one
let purgeBacktemporalEntries = asyncManager.wrapAsyncFunctionWithButton(
  'purgeBacktemporalEntries',
  purge_backtemporal_entries_btn,
  async suppressUIUpdate => {
    if (!suppressUIUpdate && !confirm('Are you sure?')) return;
    
    await eventManager.setAllEvents(
      (await eventManager.getAllEvents())
        .reduceRight((a, c) => {
          if (a.length == 0) {
            a.push(c);
            return a;
          } else {
            let futureEvent = a[a.length - 1]; // accessing backwards for future event because array is reversed
            let futureEventTime = dateStringToDate(futureEvent[0]).getTime();
            let currentEventTime = dateStringToDate(c[0]).getTime();
            if (currentEventTime > futureEventTime) {
              return a;
            } else {
              a.push(c);
              return a;
            }
          }
        }, [])
        .reverse()
    );
  }
);

let bothPurgeEntries = asyncManager.wrapAsyncFunctionWithButton(
  'bothPurgeEntries',
  both_purges_btn,
  async () => {
    if (!confirm('Are you sure?')) return;
    
    await purgeRemovedEntries(true);
    await purgeBacktemporalEntries(true);
  }
);

let duplicateEventBackwards = asyncManager.wrapAsyncFunctionWithButton(
  'duplicateEventBackwards',
  duplicate_evt_backwards_btn,
  async () => {
    let minutesBack = Number(prompt('Minutes back?'));
    
    if (!Number.isFinite(minutesBack) || minutesBack == 0) return;
    
    let latestVisibleEventIndex = await eventManager.getLatestVisibleEventIndex();
    
    if (latestVisibleEventIndex <= 0) return;
    
    let lastEvent = await eventManager.getEventByIndex(latestVisibleEventIndex);
    
    await eventManager.spliceAndAddEvents(
      latestVisibleEventIndex,
      0,
      [
        [dateToFullString(new Date(Math.floor(dateStringToDate(lastEvent[0]).getTime() - minutesBack * 60_000))), lastEvent[1], lastEvent[2], true, ...lastEvent.slice(4)],
      ]
    );
  }
);

let setLastEventAnnotation = asyncManager.wrapAsyncFunctionWithButton(
  'setLastEventAnnotation',
  set_last_evt_annotation_btn,
  async () => {
    let annotation = prompt('Annotation?');
    
    if (annotation == null) return;
    
    let latestVisibleEventIndex = await eventManager.getLatestVisibleEventIndex();
    
    if (latestVisibleEventIndex <= 0) return;
    
    let lastEvent = await eventManager.getEventByIndex(latestVisibleEventIndex);
    
    if (annotation.length > 0) {
      lastEvent[4] = annotation;
    } else {
      lastEvent.length = 4;
    }
    
    await eventManager.setEventAtIndex(latestVisibleEventIndex, lastEvent);
  }
);

function updateStorageMedium() {
  switch (storage_medium_select.value) {
    case 'LocalStorage':
      storageManager.setMediumFormat('LocalStorage');
      break;
    
    case 'Origin Private File System':
      storageManager.setMediumFormat('OPFS');
      break;
  }
}

let updateStorageVersion = asyncManager.wrapAsyncFunctionWithButton(
  'updateStorageVersion',
  storage_version_select,
  async () => {
    switch (storage_version_select.value) {
      case 'V1':
        await eventManager.setMediumVer({
          major: 1,
          minor: 0,
          format: 'json',
        });
        break;
      
      case 'V1 UTF-8 (Alpha)':
        await eventManager.setMediumVer({
          major: 1,
          minor: 0,
          format: 'json utf-8',
        });
        break;
      
      case 'V2':
        await eventManager.setMediumVer({
          major: 2,
          minor: 0,
          format: 'json',
        });
        break;
      
      case 'V2 UTF-8 (Alpha)':
        await eventManager.setMediumVer({
          major: 2,
          minor: 0,
          format: 'json utf-8',
        });
        break;
      
      case 'V3 (Alpha)':
        await eventManager.setMediumVer({
          major: 3,
          minor: 0,
          format: 'json',
        });
        break;
      
      case 'V3 UTF-8 (Alpha)':
        await eventManager.setMediumVer({
          major: 3,
          minor: 0,
          format: 'json utf-8',
        });
        break;
      
      case 'V3 Binary (Alpha)':
        await eventManager.setMediumVer({
          major: 3,
          minor: 0,
          format: 'binary',
        });
        break;
    }
  }
);

let requestPersistence = asyncManager.wrapAsyncFunction({
  taskName: 'requestPersistence',
  groupNames: ['persistence'],
  critical: true,
  alreadyRunningBehavior: 'wait',
  exclusive: 'group',
}, async () => {
  let currentPersist;
  
  try {
    currentPersist = (await navigator.storage.persisted()) ? 'yes' : 'no';
  } catch {
    currentPersist = 'error';
  }
  
  let newPersist;
  
  try {
    newPersist = (await navigator.storage.persist()) ? 'yes' : 'no';
  } catch {
    newPersist = 'error';
  }
  
  if (newPersist != currentPersist) {
    globalEventTarget.dispatchEvent(new CustomEvent('persistUpdate'));
  }
});

function dispatchStorageUpdate() {
  globalEventTarget.dispatchEvent(new CustomEvent('storageUpdate'));
}

function signalStorageUpdate() {
  sessionStorage[SESSIONSTORAGE_STORAGE_UPDATE_KEY] = '';
  delete sessionStorage[SESSIONSTORAGE_STORAGE_UPDATE_KEY];
}
