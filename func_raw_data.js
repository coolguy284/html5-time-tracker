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

function rawDataDelete() {
  if (!confirm('Are you sure?')) return;
  
  delete localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
  raw_data_text.style.display = 'none';
  raw_data_text.value = '';
}

function rawDataCreate() {
  if (localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] == null) {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = '';
    raw_data_text.value = '';
    raw_data_text.style.display = '';
  }
}

function rawDataSaveInMemoryData() {
  eventStorage.saveOrCreateNew();
}

function rawDataLoadInMemoryData() {
  eventStorage.loadFromMediumOrFillWithDefault();
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
