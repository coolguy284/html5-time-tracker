// data can be a uint8array or a string (which will be utf-8 encoded)
function exportDataToFile(data, filename) {
  let uint8Array;
  
  if (typeof data == 'string') {
    uint8Array = jsStringToUtf8Bytes(data);
  } else {
    uint8Array = data;
  }
  
  let anchorTag = document.createElement('a');
  
  anchorTag.setAttribute('href', 'data:application/octet-stream;base64,' + btoa(uint8ArrayToBinaryString(uint8Array)));
  
  anchorTag.setAttribute('download', filename);
  
  anchorTag.click();
}

async function importDataFromFile() {
  // https://stackoverflow.com/questions/16215771/how-to-open-select-file-dialog-via-js/40971885#40971885
  
  let inputTag = document.createElement('input');
  inputTag.type = 'file';
  
  let files = await new Promise(resolve => {
    let changeListener = evt => {
      resolve(evt.target.files);
      inputTag.removeEventListener('cancel', cancelListener);
    };
    
    let cancelListener = () => {
      resolve(null);
      inputTag.removeEventListener('change', changeListener);
    }
    
    inputTag.addEventListener('change', changeListener, { once: true });
    inputTag.addEventListener('cancel', cancelListener, { once: true });
    
    inputTag.click();
  });
  
  if (files == null || files.length == 0) return null;
  
  let file = files[0];
  
  return new Uint8Array(await file.arrayBuffer());
}
