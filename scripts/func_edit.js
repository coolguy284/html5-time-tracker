let getPseudoRawDataFromStorage = asyncManager.wrapAsyncFunction({
  taskName: 'getPseudoRawDataFromStorage',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'wait',
  exclusive: 'group',
}, async () => {
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
});

let setPseudoRawDataInStorage = asyncManager.wrapAsyncFunction({
  taskName: 'setPseudoRawDataInStorage',
  groupNames: ['storage'],
  critical: true,
  alreadyRunningBehavior: 'wait',
  exclusive: 'group',
}, async (pseudoRawData) => {
  let eventsChecked = false;
  let otherDataChecked = false;
  
  if ('eventButtons' in pseudoRawData) {
    await eventManager.setEventButtons(pseudoRawData.eventButtons);
    
    otherDataChecked = true;
  }
  
  if ('eventPriorities' in pseudoRawData) {
    await eventManager.setEventPriorities(pseudoRawData.eventPriorities);
    
    otherDataChecked = true;
  }
  
  if ('eventMappings' in pseudoRawData) {
    await eventManager.setEventMappings(pseudoRawData.eventMappings);
    
    otherDataChecked = true;
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
    
    eventsChecked = true;
  }
  
  edit_show_events.checked = eventsChecked;
  edit_show_other_data.checked = otherDataChecked;
});

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
      textValue += `${obj.events[0]}\n\n`;
    } else {
      trueEvents = obj.events;
    }
    
    let textDays = [];
    let pastDay = null;
    let pastTZ = null;
    
    for (let event of trueEvents) {
      let tsSplit = event[0].split(' ');
      let day = tsSplit[0];
      let tz = tsSplit[3];
      
      if (tz != pastTZ) {
        textDays.push([
          `${day} ${tz}:\n`,
          [],
        ]);
      } else {
        if (day != pastDay) {
          textDays.push([
            `${day} ${tz}:\n`,
            [],
          ]);
        } else {
          // nothing
        }
      }
      
      pastDay = day;
      pastTZ = tz;
      
      if (textDays.length == 0) {
        textDays.push([
          `${day} ${tz}:\n`,
          [],
        ]);
      }
      
      let appendText = `${tsSplit[1]} ${tsSplit[2]} ${boolToDigit(event[2])}${boolToDigit(event[3])}`;
      
      if (event[1].includes('\n')) {
        appendText += `${JSON.stringify(event[1])}\n`;
      } else {
        appendText += ` ${event[1]}\n`;
      }
      
      if (event.length > 4) {
        if (event[4].includes('\n')) {
          appendText += ` ${JSON.stringify(event[4])}\n`;
        } else {
          appendText += `  ${event[4]}\n`;
        }
      }
      
      textDays[textDays.length - 1][1].push(appendText);
    }
  
    textDays = textDays
      .map(([day, events]) => {
        if (events.length < EDIT_PAGE_TEXT_MODE_MAX_EVTS_PER_DAY * 2) {
          return [[day, events]];
        } else {
          let numSections = Math.floor(events.length / EDIT_PAGE_TEXT_MODE_MAX_EVTS_PER_DAY);
          let sectionSize = Math.floor(events.length / numSections);
          
          let result = [];
          
          for (let i = 0; i < numSections; i++) {
            if (i == numSections - 1) {
              result.push([day, events.slice(i * sectionSize)]);
            } else {
              result.push([day, events.slice(i * sectionSize, (i + 1) * sectionSize)]);
            }
          }
          
          return result;
        }
      })
      .flat();
    
    textValue += textDays.map(x => x[0] + x[1].join('')).join('\n');
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
    
    switch (render_mode.value) {
      case 'JSON':
        // nothing
        break;
      
      case 'Text-ish':
        if ('fallbackFrom' in parsedJson) {
          // nothing
        } else {
          render_mode.value = 'JSON';
        }
        break;
    }
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
        
        // revert to json if text conversion failed somehow
        if (!deepEqual(editViewTextToObject(textValue), storageData)) {
          storageData = {
            fallbackFrom: 'Text-ish',
            ...storageData,
          };
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
