function rawDataSave() {
  if (raw_data_text.style.display == '') {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = raw_data_text.value;
  }
}

function rawDataLoad() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] == null) {
    raw_data_text.style.display = 'none';
    raw_data_text.value = '';
  } else {
    raw_data_text.value = localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    raw_data_text.style.display = '';
  }
}

function rawDataCreate() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] == null) {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = '';
    raw_data_text.value = '';
    raw_data_text.style.display = '';
  }
}

function rawDataDelete() {
  if (!confirm('Are you sure?')) return;
  
  delete localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
  raw_data_text.style.display = 'none';
  raw_data_text.value = '';
}

function rawDataDownloadToFile() {
  let anchorTag = document.createElement('a');
  
  anchorTag.setAttribute('href', 'data:application/octet-stream;base64,' + btoa(raw_data_text.value));
  
  anchorTag.setAttribute('download', 'archived.txt');
  
  anchorTag.click();
}

function rawDataLoadFromFile() {
  // https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js/40971885#40971885
  
  let inputTag = document.createElement('input');
  inputTag.type = 'file';
  
  inputTag.onchange = evt => {
    if (evt.target.files.length == 0) return;
    
    let file = evt.target.files[0];
    
    let fileReader = new FileReader();
    
    fileReader.readAsText(file, 'utf-8');
    
    fileReader.onload = readerEvt => {
      let content = readerEvt.target.result;
      
      raw_data_text.value = content;
    };
  };
  
  inputTag.click();
}

function prettifyJson(jsonValue, depth) {
  if (depth == null) depth = 0;
  
  let json;
  
  if (typeof jsonValue == 'string') {
    if (jsonValue.startsWith('+')) {
      json = jsonValue.slice(1);
    } else {
      try {
        json = JSON.parse(jsonValue);
      } catch (e) {
        alert('Error: raw data not json');
        throw new Error('raw data not json');
      }
    }
  } else {
    json = jsonValue;
  }
  
  let newJsonString = JSON.stringify(json);
  
  if (newJsonString.length > RAW_DATA_PRETTIFY_LINE_LIMIT) {
    if (Array.isArray(json)) {
      return '[\n' +
        json.map(x => '  '.repeat(depth + 1) + prettifyJson(typeof x == 'string' ? '+' + x : x, depth + 1)).join(',\n') +
        '\n' + '  '.repeat(depth) + ']';
    } else if (typeof json == 'object') {
      return '{\n' +
        Object.entries(json).map(([k, v]) => '  '.repeat(depth + 1) + `${JSON.stringify(k)}: ${prettifyJson(typeof v == 'string' ? '+' + v : v, depth + 1)}`).join(',\n') +
        '\n' + '  '.repeat(depth) + '}';
    } else {
      return newJsonString;
    }
  } else {
    return newJsonString;
  }
}

function rawDataPrettify() {
  raw_data_text.value = prettifyJson(raw_data_text.value);
}

function rawDataCondensify() {
  let json;
  
  try {
    json = JSON.parse(raw_data_text.value);
  } catch (e) {
    alert('Error: raw data not json');
    return;
  }
  
  raw_data_text.value = JSON.stringify(json);
}

function rawDataValidate() {
  try {
    JSON.parse(raw_data_text.value);
    alert('Raw data json validation passed');
  } catch (e) {
    alert('Error: raw data not json');
    return;
  }
}

function rawDataScrollToTop() {
  // https://stackoverflow.com/questions/10744299/scroll-back-to-the-top-of-scrollable-div/10744324#10744324
  raw_data_text.scrollTop = 0;
}

function rawDataScrollToBottom() {
  // https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div/270628#270628
  raw_data_text.scrollTop = raw_data_text.scrollHeight;
}

function rawDataSaveInMemoryData() {
  eventStorage.saveOrCreateNew();
}

function rawDataLoadInMemoryData() {
  eventStorage.loadFromMediumOrFillWithDefault();
}
