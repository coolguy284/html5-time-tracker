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
      
      return uint8ArrayToPackedUtf16BE(bytes);
    } else if (raw_data_text.value.startsWith('utf-8:\n')) {
      let utf8String = raw_data_text.value.slice(7);
      
      return uint8ArrayToPackedUtf16BE(codePointArrayToUtf8Bytes(utf16BEStringToCodePointArray(utf8String)));
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
        raw_data_text.value = 'utf-8:\n' + codePointArrayToUtf16BEString(utf8BytesToCodePointArray(packedUtf16BEToUint8Array(value)));
      } else {
        let bytes = packedUtf16BEToUint8Array(value);
        
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

let rawDataSave = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataSave',
  raw_data_save_btn,
  async () => {
    let textValue = getRawDataTextValue();
    
    if (textValue != null) {
      await storageManager.setDataAsUtf16(textValue);
      dispatchStorageUpdate();
    }
  }
);

let rawDataLoad = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataLoad',
  raw_data_load_btn,
  async () => {
    if (!(await storageManager.dataIsStored())) {
      setRawDataTextValue(null);
    } else {
      setRawDataTextValue(await storageManager.getDataAsUtf16());
    }
  }
);

let rawDataCreate = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataCreate',
  raw_data_create_btn,
  async () => {
    if (!(await storageManager.dataIsStored())) {
      await storageManager.setDataAsUtf16('');
      rawDataLoad();
      dispatchStorageUpdate();
    }
  }
);

function rawDataDelete() {
  if (!confirm('Are you sure?')) return;
  
  storageManager.deleteData();
  rawDataLoad();
  dispatchStorageUpdate();
}

function rawDataExportToFile() {
  let textValue = getRawDataTextValue();
  
  if (textValue != null) {
    let resultUint8Array;
    
    switch (getRawDataTextStatus()) {
      case 'text':
        resultUint8Array = utf16BEToUint8Array(textValue);
        break;
      
      case 'utf-8':
      case 'binary':
        resultUint8Array = packedUtf16BEToUint8Array(textValue);
        break;
    }
    
    exportDataToFile(resultUint8Array, 'archive.txt');
  }
}

function rawDataExportToFileUTF16BEToUTF8() {
  let textValue = getRawDataTextValue();
  
  if (textValue != null) {
    switch (getRawDataTextStatus()) {
      case 'text':
        exportDataToFile(textValue, 'archive.txt');
        break;
      
      case 'utf-8':
      case 'binary':
        alert('Error: data must be of type text (utf-16 BE)');
        break;
    }
  }
}

let rawDataImportFromFile = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataImportFromFile',
  [raw_data_import_from_file_btn, raw_data_import_from_file_2_btn],
  async () => {
    let fileArr = await importDataFromFile();
    
    if (fileArr == null) return;
    
    let textValue;
    
    if (fileArr[0] == 0 && (fileArr[1] == '{'.charCodeAt(0) || fileArr[1] == '['.charCodeAt(0))) {
      // utf16be encoded file; mode "text"
      textValue = uint8ArrayToUtf16BE(fileArr);
    } else {
      // utf8 / binary encoded file
      textValue = uint8ArrayToPackedUtf16BE(fileArr);
    }
    
    setRawDataTextValue(textValue);
  }
);

let rawDataImportFromFileUTF8ToUTF16BE = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataImportFromFileUTF8ToUTF16BE',
  [raw_data_import_from_file_btn, raw_data_import_from_file_2_btn],
  async () => {
    let fileArr = await importDataFromFile();
    
    if (fileArr == null) return;
    
    if (fileArr[0] == '{'.charCodeAt(0) || fileArr[0] == '['.charCodeAt(0)) {
      // utf8 encoded file
      let textValue = utf8BytesToJsString(fileArr);
      setRawDataTextValue(textValue);
    } else {
      alert('Error: input file must be utf-8');
    }
  }
);

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
  scrollToTop(raw_data_text);
}

function rawDataScrollToBottom() {
  scrollToBottom(raw_data_text);
}

let rawDataSaveInMemoryData = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataSaveInMemoryData',
  raw_data_save_in_mem_data_btn,
  async () => {
    await eventManager.saveOrCreateNew();
  }
);

let rawDataLoadInMemoryData = asyncManager.wrapAsyncFunctionWithButton(
  'rawDataLoadInMemoryData',
  raw_data_load_in_mem_data_btn,
  async () => {
    await eventManager.loadFromMediumOrFillWithDefault();
  }
);
