class StorageManager {
  dataIsStored() {
    return LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage;
  }
  
  getDataAsUtf16() {
    return localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
  }
  
  setDataAsUtf16(text) {
    localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = text;
  }
  
  getMediumFormat() {
    return 'localStorage';
  }
  
  getDataFormatInMedium() {
    switch (this.getMediumFormat()) {
      case 'localStorage': {
        let dataString = this.getDataAsUtf16();
        
        if (dataString == null) {
          return null;
        } else if (dataString[0] == '0' || dataString[0] == '1') {
          let firstChar = String.fromCharCode(Math.floor(dataString.charCodeAt(1) / 256));
          
          if (firstChar == '[' || firstChar == '{') {
            return 'utf-8';
          } else {
            return 'binary';
          }
        } else {
          return 'text';
        }
      }
    }
  }
}
