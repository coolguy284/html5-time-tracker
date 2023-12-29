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

function digitToBool(digit) {
  switch (digit) {
    case '0':
      return false;
    
    case '1':
      return true;
    
    case '-':
    default:
      return null;
  }
}

function boolToDigit(bool) {
  switch (bool) {
    case false:
      return '0';
    
    case true:
      return '1';
    
    case null:
    default:
      return '-';
  }
}

function editViewTextToObject(text) {
  let arr = text
    .trim()
    .split('\n\n\n')
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .map(section => {
      let match = /^([a-zA-Z]+):\n(.*)$/s.exec(section);
      
      if (!match) {
        return null;
      }
      
      let key = match[1];
      let value = match[2];
      
      switch (key) {
        case 'eventButtons':
        case 'eventPriorities':
        case 'eventMappings':
          try {
            return [key, JSON.parse(value)];
          } catch {
            return null;
          }
        
        case 'events': {
          let day, tz;
          
          let parsed = value
            .split('\n');
          
          let newParsed = [];
          
          for (let line of parsed) {
            let match2;
            
            if (/^<\d+ events? elided>$/.test(line)) {
              newParsed.push(line);
            } else if (match2 = /^(\d+-\d{2}-\d{2}):$/.exec(line)) {
              day = match2[1];
            } else if (match2 = /^(\d+-\d{2}-\d{2}) (UTC[-+]\d+:\d{2}):$/.exec(line)) {
              day = match2[1];
              tz = match2[2];
            } else if (match2 = /^(UTC[-+]\d+:\d{2}):$/.exec(line)) {
              tz = match2[1];
            } else if (match2 = /^(\d{2}:\d{2}:\d{2}.\d{3} [AP]M) ([01-])([01-])( ?)(.*)$/.exec(line)) {
              let time = match2[1];
              let visible = digitToBool(match2[2]);
              let estimate = digitToBool(match2[3]);
              let eventNameIsJson = match2[4] != ' ';
              let eventName = eventNameIsJson ? JSON.parse(match2[5]) : match2[5];
              
              newParsed.push([
                `${day} ${time} ${tz}`,
                eventName,
                visible,
                ...(
                  estimate != null ?
                    [estimate] :
                    []
                ),
              ]);
            } else if (match2 = /^ ( ?)(.*)$/.exec(line)) {
              let annotationIsJson = match2[1] != ' ';
              let annotation = annotationIsJson ? JSON.parse(match2[2]) : match2[2];
              
              if (newParsed.length <= 0) {
                return null;
              } else {
                let pastEvent = newParsed[newParsed.length - 1];
                
                if (typeof pastEvent == 'string') {
                  return null;
                } else {
                  pastEvent[4] = annotation;
                  
                  if (!(3 in pastEvent)) {
                    pastEvent[3] = null;
                  }
                }
              }
            } else if (line == '') {
              // nothing
            } else {
              return null;
            }
          }
          
          return [key, newParsed];
        }
        
        default:
          return null;
      }
    });
  
  if (arr.includes(null)) {
    return null;
  }
  
  return Object.fromEntries(arr);
}

function editViewObjectToText(obj) {
  let textValue = '';
  
  if ('eventButtons' in obj) {
    textValue += `eventButtons:\n${prettifyJson(obj.eventButtons)}\n\n\n`;
  }
  
  if ('eventPriorities' in obj) {
    textValue += `eventPriorities:\n${prettifyJson(obj.eventPriorities)}\n\n\n`;
  }
  
  if ('eventMappings' in obj) {
    textValue += `eventMappings:\n${prettifyJson(obj.eventMappings)}\n\n\n`;
  }
  
  if ('events' in obj) {
    textValue += 'events:\n\n';
    let trueEvents;
    
    if (typeof obj.events[0] == 'string') {
      trueEvents = obj.events.slice(1);
      textValue += `${obj.events[0]}\n`;
    } else {
      trueEvents = obj.events;
    }
    
    let pastDay = null;
    let pastTZ = null;
    let evtInDayCounter = 0;
    
    for (let event of trueEvents) {
      let tsSplit = event[0].split(' ');
      let day = tsSplit[0];
      let tz = tsSplit[3];
      
      if (tz != pastTZ) {
        textValue += `\n${day} ${tz}:\n`;
        evtInDayCounter = 0;
      } else {
        if (day != pastDay || evtInDayCounter >= EDIT_PAGE_TEXT_MODE_MAX_EVTS_PER_DAY) {
          textValue += `\n${day} ${tz}:\n`;
          evtInDayCounter = 0;
        } else {
          // nothing
        }
      }
      
      evtInDayCounter++;
      
      pastDay = day;
      pastTZ = tz;
      
      textValue += `${tsSplit[1]} ${tsSplit[2]} ${boolToDigit(event[2])}${boolToDigit(event[3])}`;
      
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
          try {
            parsedJson = editViewTextToObject(inputText);
          
            if (parsedJson == null) {
              alert('Text form invalid');
              return;
            }
          } catch {
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
          textValue = prettifyJson(storageData);
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
