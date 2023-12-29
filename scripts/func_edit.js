async function getPseudoRawDataFromStorage() {
  let events = await eventManager.getAllEvents();
  
  let maxEventsShown = editPageEventsShown.get();
  
  if (!Number.isSafeInteger(maxEventsShown)) {
    maxEventsShown = Infinity;
  }
  
  if (maxEventsShown < 0) {
    maxEventsShown = 0;
  }
  
  if (events.length > maxEventsShown) {
    let elidedNum = events.length - maxEventsShown;
    
    events = [
      `<${elidedNum} event${elidedNum != 1 ? 's' : ''} elided>`,
      ...events.slice(elidedNum),
    ];
  }
  
  return {
    ...(
      edit_show_other_data.checked ?
        {
          eventButtons: await eventManager.getEventButtons(),
          eventPriorities: await eventManager.getEventPriorities(),
          eventMappings: await eventManager.getEventMappings(),
        } :
        {}
    ),
    ...(
      edit_show_events.checked ?
        { events } :
        {}
    ),
  };
}

async function setPseudoRawDataInStorage(pseudoRawData) {
  if ('eventButtons' in pseudoRawData) {
    await eventManager.setEventButtons(pseudoRawData.eventButtons);
  }
  
  if ('eventPriorities' in pseudoRawData) {
    await eventManager.setEventPriorities(pseudoRawData.eventPriorities);
  }
  
  if ('eventMappings' in pseudoRawData) {
    await eventManager.setEventMappings(pseudoRawData.eventMappings);
  }
  
  if ('events' in pseudoRawData) {
    if (typeof pseudoRawData.events[0] == 'string') {
      let match = /^<(\d+) events? elided>$/.exec(pseudoRawData.events[0]);
      
      let startIndex = parseInt(match[1]);
      
      if (Number.isSafeInteger(startIndex)) {
        await eventManager.spliceAndAddEvents(startIndex, Infinity, pseudoRawData.events.slice(1));
      } else {
        alert('Index elided statement invalid');
      }
    } else {
      await eventManager.setAllEvents(pseudoRawData.events);
    }
  }
}

function editViewTextToObject(text) {
  let match = /^(?:eventButtons:\n(.*)\n\n)?(?:eventPriorities:\n(.*)\n\n)?(?:eventMappings:\n(.*)\n\n)?(?:events:\n(.*))?$/.exec(text.trim());
  
  if (match) {
    let obj = {};
    
    return obj;
  } else {
    return null;
  }
}

function editViewObjectToText(obj) {
  let textValue = '';
  
  if ('eventButtons' in obj) {
    textValue += `eventButtons:\n${prettifyJson(obj.eventButtons)}\n\n`;
  }
  
  if ('eventPriorities' in obj) {
    textValue += `eventPriorities:\n${prettifyJson(obj.eventPriorities)}\n\n`;
  }
  
  if ('eventMappings' in obj) {
    textValue += `eventMappings:\n${prettifyJson(obj.eventMappings)}\n\n`;
  }
  
  if ('events' in obj) {
    textValue += 'events:\n';
    let trueEvents;
    
    if (typeof obj.events[0] == 'string') {
      trueEvents = obj.events.slice(1);
      textValue += `${obj.events[0]}\n`;
    } else {
      trueEvents = obj.events;
    }
    
    let pastDay = null;
    let pastTZ = null;
    
    for (let event of trueEvents) {
      let tsSplit = event[0].split(' ');
      let day = tsSplit[0];
      let tz = tsSplit[3];
      
      if (day != pastDay) {
        if (tz != pastTZ) {
          textValue += `${day} ${tz}:\n`;
        } else {
          textValue += `${day}:\n`;
        }
      } else {
        if (tz != pastTZ) {
          textValue += `${tz}:\n`;
        } else {
          // nothing
        }
      }
      
      pastDay = day;
      pastTZ = tz;
      
      textValue += `${tsSplit[1]} ${tsSplit[2]} ${event[2] == null ? '-' : event[2] ? '1' : '0'}${event[3] == null ? '-' : event[3] ? '1' : '0'}`;
      
      if (event[1].includes('\n')) {
        textValue += `${JSON.stringify(event[1])}\n`;
      } else {
        textValue += ` ${event[1]}\n`;
      }
      
      if (event.length > 4) {
        if (event[4].includes('\n')) {
          textValue += ` ${JSON.stringify(event[4])}\n`;
        } else {
          textValue += `  ${event[4]}\n`;
        }
      }
    }
  }
  
  return textValue.trim() + '\n';
}

let setPseudoRawData = asyncManager.wrapAsyncFunctionWithButton(
  'setPseudoRawData',
  set_pseudo_raw_data_btn,
  async () => {
    let inputText = pseudo_raw_data_text.value;
    
    let parsedJson;
    
    switch (render_mode.value) {
      case 'JSON':
        try {
          parsedJson = JSON.parse(inputText);
        } catch {
          alert('JSON invalid');
          return;
        }
        break;
      
      case 'Text-ish':
        if (inputText[0] == '{') {
          try {
            parsedJson = JSON.parse(inputText);
          } catch {
            alert('JSON invalid');
            return;
          }
        } else {
          parsedJson = editViewTextToObject(inputText);
          
          if (parsedJson == null) {
            alert('Text form invalid');
            return;
          }
        }
        break;
    }
    
    await setPseudoRawDataInStorage(parsedJson);
  }
);

let reloadPseudoRawData = asyncManager.wrapAsyncFunctionWithButton(
  'reloadPseudoRawData',
  reload_pseudo_raw_data_btn,
  async () => {
    let storageData = await getPseudoRawDataFromStorage();
    
    let textValue;
    
    switch (render_mode.value) {
      case 'JSON':
        textValue = prettifyJson(storageData);
        break;
      
      case 'Text-ish':
        textValue = editViewObjectToText(storageData);
        if (!deepEqual(editViewTextToObject(textValue), storageData)) {
          //textValue = prettifyJson(storageData);
        }
        break;
    }
    
    pseudo_raw_data_text.value = textValue;
  }
);

function editPageScrollToTop() {
  scrollToTop(pseudo_raw_data_text);
}

function editPageScrollToBottom() {
  scrollToBottom(pseudo_raw_data_text);
}
