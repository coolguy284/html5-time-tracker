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

let setPseudoRawData = asyncManager.wrapAsyncFunctionWithButton(
  'setPseudoRawData',
  set_pseudo_raw_data_btn,
  async () => {
    let parsedJson;
    
    switch (render_mode.value) {
      case 'JSON':
        try {
          parsedJson = JSON.parse(pseudo_raw_data_text.value);
        } catch {
          alert('JSON invalid');
        }
        break;
      
      case 'Text-ish':
        parsedJson = {};
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
        textValue = '';
        
        if ('eventButtons' in storageData) {
          textValue += `eventButtons:\n${prettifyJson(storageData.eventButtons)}\n\n`;
        }
        
        if ('eventPriorities' in storageData) {
          textValue += `eventPriorities:\n${prettifyJson(storageData.eventPriorities)}\n\n`;
        }
        
        if ('eventMappings' in storageData) {
          textValue += `eventMappings:\n${prettifyJson(storageData.eventMappings)}\n\n`;
        }
        
        if ('events' in storageData) {
          textValue += 'events:\n';
          let trueEvents;
          
          if (typeof storageData.events[0] == 'string') {
            trueEvents = storageData.events.slice(1);
            textValue += `${storageData.events[0]}\n`;
          } else {
            trueEvents = storageData.events;
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
            
            textValue += `${tsSplit[1]} ${tsSplit[2]} ${event[2] ? '1' : '0'}${event[3] ? '1' : '0'}`;
            
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
        break;
    }
    
    pseudo_raw_data_text.value = textValue.trim() + '\n';
  }
);

function editPageScrollToTop() {
  scrollToTop(pseudo_raw_data_text);
}

function editPageScrollToBottom() {
  scrollToBottom(pseudo_raw_data_text);
}
