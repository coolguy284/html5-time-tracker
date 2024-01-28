let settingsExportData = asyncManager.wrapAsyncFunctionWithButton(
  'settingsExportData',
  [export_data_btn, export_data_2_btn],
  async () => {
    let textValue = await storageManager.getDataAsUtf16();
    
    if (textValue != null) {
      let resultUint8Array;
      
      if (textValue[0] == '0' || textValue[0] == '1') {
        resultUint8Array = packedUtf16BEToUint8Array(textValue);
      } else {
        resultUint8Array = utf16BEToUint8Array(textValue);
      }
      
      exportDataToFile(resultUint8Array, 'archive.txt');
    }
  }
);

let settingsExportDataUTF16BEToUTF8 = asyncManager.wrapAsyncFunctionWithButton(
  'settingsExportDataUTF16BEToUTF8',
  [export_data_btn, export_data_2_btn],
  async () => {
    let textValue = await storageManager.getDataAsUtf16();
    
    if (textValue != null) {
      if (textValue[0] == '0' || textValue[0] == '1') {
        alert('Error: data must be of type text (utf-16 BE)');
      } else {
        exportDataToFile(textValue, 'archive.txt');
      }
    }
  }
);

let settingsImportData = asyncManager.wrapAsyncFunctionWithButton(
  'settingsImportData',
  [import_data_btn, import_data_2_btn],
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
    
    await storageManager.setDataAsUtf16(textValue);
    dispatchStorageUpdate();
  }
);

let settingsImportDataUTF8ToUTF16BE = asyncManager.wrapAsyncFunctionWithButton(
  'settingsImportDataUTF8ToUTF16BE',
  [import_data_btn, import_data_2_btn],
  async () => {
    let fileArr = await importDataFromFile();
    
    if (fileArr == null) return;
    
    if (fileArr[0] == '{'.charCodeAt(0) || fileArr[0] == '['.charCodeAt(0)) {
      // utf8 encoded file
      let textValue = utf8BytesToJsString(fileArr);
      
      await storageManager.setDataAsUtf16(textValue);
      dispatchStorageUpdate();
    } else {
      alert('Error: input file must be utf-8');
    }
  }
);

let settingsDeleteAllData = asyncManager.wrapAsyncFunctionWithButton(
  'settingsDeleteAllData',
  delete_all_data_btn,
  async () => {
    if (!confirm('Are you sure?')) return;
    
    await eventManager.resetData();
  }
);
