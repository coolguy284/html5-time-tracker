function dateToFullString(dateObj) {
  return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1 + '').padStart(2, '0')}-${(dateObj.getDate() + '').padStart(2, '0')} ${((dateObj.getHours() % 12 + 11) % 12 + 1 + '').padStart(2, '0')}:${(dateObj.getMinutes() + '').padStart(2, '0')}:${(dateObj.getSeconds() + '').padStart(2, '0')}.${(dateObj.getMilliseconds() + '').padStart(3, '0')} ${dateObj.getHours() >= 12 ? 'PM' : 'AM'} UTC${dateObj.getTimezoneOffset() < 0 ? '-' : '+'}${(Math.floor(Math.abs(dateObj.getTimezoneOffset()) / 60) + '').padStart(2, '0')}:${(Math.abs(dateObj.getTimezoneOffset()) % 60 + '').padStart(2, '0')}`;
}

function dateToDateString(dateObj) {
  return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1 + '').padStart(2, '0')}-${(dateObj.getDate() + '').padStart(2, '0')}`;
}
