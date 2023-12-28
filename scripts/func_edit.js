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
    
    try {
      parsedJson = JSON.parse(pseudo_raw_data_text.value);
    } catch {
      alert('JSON invalid');
    }
    
    await setPseudoRawDataInStorage(parsedJson);
  }
);

let reloadPseudoRawData2 = asyncManager.wrapAsyncFunctionWithButton(
  'reloadPseudoRawData',
  reload_pseudo_raw_data_btn,
  async () => {
    console.log('v');
    pseudo_raw_data_text.value = prettifyJson(await getPseudoRawDataFromStorage());
    console.log('v2');
  }
);


async function reloadPseudoRawData() {
  console.log('f');
  await reloadPseudoRawData2();
  console.log('f2');
}

function editPageScrollToTop() {
  scrollToTop(pseudo_raw_data_text);
}

function editPageScrollToBottom() {
  scrollToBottom(pseudo_raw_data_text);
}
