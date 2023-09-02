function dateToFullString(dateObj) {
  return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1 + '').padStart(2, '0')}-${(dateObj.getDate() + '').padStart(2, '0')} ${((dateObj.getHours() % 12 + 11) % 12 + 1 + '').padStart(2, '0')}:${(dateObj.getMinutes() + '').padStart(2, '0')}:${(dateObj.getSeconds() + '').padStart(2, '0')}.${(dateObj.getMilliseconds() + '').padStart(3, '0')} ${dateObj.getHours() >= 12 ? 'PM' : 'AM'} UTC${dateObj.getTimezoneOffset() > 0 ? '-' : '+'}${(Math.floor(Math.abs(dateObj.getTimezoneOffset()) / 60) + '').padStart(2, '0')}:${(Math.abs(dateObj.getTimezoneOffset()) % 60 + '').padStart(2, '0')}`;
}

function dateStringToDate(dateStr) {
  let dateStrSplit = dateStr.split(' ');
  let dateStrTimeSplit = dateStrSplit[1].split(':');
  let hoursUnclocked = dateStrTimeSplit[0] == '12' ? 0 : dateStrTimeSplit[0];
  return new Date(new Date(`${dateStrSplit[0]}T${((dateStrSplit[2] == 'PM' ? parseInt(hoursUnclocked) + 12 : hoursUnclocked) + '').padStart(2, '0')}:${dateStrTimeSplit[1]}:${dateStrTimeSplit[2]}Z`).getTime() + (dateStrSplit[3][3] == '-' ? -1 : 1) * (parseInt(dateStrSplit[3].slice(4, 6)) * 60 + parseInt(dateStrSplit[3].slice(7, 9))) * -60_000);
}

function dateToDateString(dateObj) {
  return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1 + '').padStart(2, '0')}-${(dateObj.getDate() + '').padStart(2, '0')}`;
}

function getEventGroup(eventName) {
  let eventToGroupMapping = EVENT_MAPPINGS[event_mappings_select.value].eventToGroup;
  
  if (eventName in eventToGroupMapping) {
    return eventToGroupMapping[eventName];
  } else {
    return 'Default';
  }
}

function getEventGroupColor(groupName) {
  let groupToColorMapping = EVENT_MAPPINGS[event_mappings_select.value].groupToColor;
  
  if (groupName in groupToColorMapping) {
    return groupToColorMapping[groupName];
  } else {
    return groupToColorMapping['Default'];
  }
}

function getEventColor(eventName) {
  return getEventGroupColor(getEventGroup(eventName));
}

function removeAllChildren(elem) {
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript/3955238#3955238
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

function removeAllChildrenButOne(elem) {
  while (elem.children.length > 1) {
    elem.removeChild(elem.lastChild);
  }
}
