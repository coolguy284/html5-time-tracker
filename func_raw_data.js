function getRawDataTextValue() {
  if (raw_data_text.style.display == 'none') {
    return null;
  } else {
    if (raw_data_text.value.startsWith('binary:\n')) {
      let hexString = raw_data_text.value.slice(8);
      
      let bytes = [];
      
      for (let i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.slice(i, i + 2), 16));
      }
      
      return uint8ArrayToPackedUtf16(bytes);
    } else if (raw_data_text.value.startsWith('utf-8:\n')) {
      let utf8String = raw_data_text.value.slice(7);
      
      return uint8ArrayToPackedUtf16(codePointArrayToUtf8Bytes(utf16StringToCodePointArray(utf8String)));
    } else {
      return raw_data_text.value;
    }
  }
}

function getRawDataTextStatus() {
  if (raw_data_text.style.display == 'none') {
    return null;
  } else {
    if (raw_data_text.value.startsWith('binary:\n')) {
      return 'binary';
    } else if (raw_data_text.value.startsWith('utf-8:\n')) {
      return 'utf-8';
    } else {
      return 'text';
    }
  }
}

function getRawDataTextValueAsUTF8Only() {
  if (raw_data_text.style.display == 'none') {
    throw new Error('rawdata not utf-8');
  } else {
    if (raw_data_text.value.startsWith('binary:\n')) {
      throw new Error('rawdata not utf-8');
    } else if (raw_data_text.value.startsWith('utf-8:\n')) {
      let utf8String = raw_data_text.value.slice(7);
      
      return utf8String;
    } else {
      throw new Error('rawdata not utf-8');
    }
  }
}

function setRawDataTextValue(value) {
  if (value == null) {
    raw_data_text.style.display = 'none';
    
    raw_data_text.value = '';
  } else {
    if (value[0] == '0' || value[0] == '1') {
      let firstChar = String.fromCharCode(Math.floor(value.charCodeAt(1) / 256));
      
      if (firstChar == '{' || firstChar == '[') {
        raw_data_text.value = 'utf-8:\n' + codePointArrayToUtf16String(utf8BytesToCodePointArray(packedUtf16ToUint8Array(value)));
      } else {
        let bytes = packedUtf16ToUint8Array(value);
        
        raw_data_text.value = 'binary:\n' + Array.from(bytes).map(x => x.toString(16).padStart(2, '0')).join('');
      }
    } else {
      raw_data_text.value = value;
    }
    
    raw_data_text.style.display = '';
  }
}

function setRawDataTextValueAsUTF8Only(value) {
  if (value == null) {
    throw new Error('value not text');
  } else {
    raw_data_text.value = 'utf-8:\n' + value;
  }
}

function rawDataSave() {
  let textValue = getRawDataTextValue();
  
  if (textValue != null) {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = textValue;
  }
}

function rawDataLoad() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] == null) {
    setRawDataTextValue(null);
  } else {
    setRawDataTextValue(localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY]);
  }
}

function rawDataCreate() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] == null) {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = '';
    rawDataLoad();
  }
}

function rawDataDelete() {
  if (!confirm('Are you sure?')) return;
  
  delete localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
  rawDataLoad();
}

function rawDataDownloadToFile() {
  let textValue = getRawDataTextValue();
  
  if (textValue != null) {
    let anchorTag = document.createElement('a');
    
    anchorTag.setAttribute('href', 'data:application/octet-stream;base64,' + btoa(getRawDataTextValue()));
    
    anchorTag.setAttribute('download', 'archived.txt');
    
    anchorTag.click();
  }
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
      
      setRawDataTextValue(content);
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
      } catch {
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
  try {
    switch (getRawDataTextStatus()) {
      case null:
        alert('Error: raw data nonexistent');
      
      case 'text': {
        let json;
        
        try {
          json = JSON.parse(getRawDataTextValue());
        } catch {
          alert('Error: raw data not json');
          return;
        }
        
        setRawDataTextValue(prettifyJson(json));
        break;
      }
      
      case 'utf-8': {
        let json;
        
        try {
          json = JSON.parse(getRawDataTextValueAsUTF8Only());
        } catch {
          alert('Error: raw data not json');
          return;
        }
        
        setRawDataTextValueAsUTF8Only(prettifyJson(json));
        break;
      }
      
      case 'binary':
        alert('Error: raw data is binary');
        break;
    }
  } catch (e) {
    alert(e.toString());
  }
}

function rawDataCondensify() {
  try {
    switch (getRawDataTextStatus()) {
      case null:
        alert('Error: raw data nonexistent');
      
      case 'text': {
        let json;
        
        try {
          json = JSON.parse(getRawDataTextValue());
        } catch {
          alert('Error: raw data not json');
          return;
        }
        
        setRawDataTextValue(JSON.stringify(json));
        break;
      }
      
      case 'utf-8': {
        let json;
        
        try {
          json = JSON.parse(getRawDataTextValueAsUTF8Only());
        } catch {
          alert('Error: raw data not json');
          return;
        }
        
        setRawDataTextValueAsUTF8Only(JSON.stringify(json));
        break;
      }
      
      case 'binary':
        alert('Error: raw data is binary');
        break;
    }
  } catch (e) {
    alert(e.toString());
  }
}

function rawDataValidate() {
  try {
    switch (getRawDataTextStatus()) {
      case null:
        alert('Error: raw data nonexistent');
      
      case 'text':
        try {
          JSON.parse(getRawDataTextValue());
          alert('Raw data json validation passed');
        } catch {
          alert('Error: raw data not json');
        }
        break;
      
      case 'utf-8':
        try {
          JSON.parse(getRawDataTextValueAsUTF8Only());
          alert('Raw data json validation passed');
        } catch {
          alert('Error: raw data not json (utf-8)');
        }
        break;
      
      case 'binary':
        alert('Error: raw data is binary');
        break;
    }
  } catch (e) {
    alert(e.toString());
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
