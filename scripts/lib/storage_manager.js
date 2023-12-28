class StorageManager {
  static getDefaultMediumFormat() {
    return 'LocalStorage';
  }
  
  getMediumFormat() {
    if (LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage) {
      return 'LocalStorage';
    } else if (false) {
      return 'OPFS';
    } else {
      return StorageManager.getDefaultMediumFormat();
    }
  }
  
  getDataFormatInMedium() {
    switch (this.getMediumFormat()) {
      case 'LocalStorage': {
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
  
  dataIsStored() {
    switch (this.getMediumFormat()) {
      case 'LocalStorage':
        return LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage;
    }
  }
  
  getDataAsUtf16() {
    switch (this.getMediumFormat()) {
      case 'LocalStorage':
        return localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    }
  }
  
  setDataAsUtf16(text) {
    switch (this.getMediumFormat()) {
      case 'LocalStorage':
        localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = text;
    }
  }
  
  getTotalSizeInChars() {
    let textValue = storageManager.getDataAsUtf16();
    
    switch (storageManager.getDataFormatInMedium()) {
      case 'text':
        return textValue.length;
      
      case 'utf-8':
        return textValue.length * 2;
      
      case 'binary':
        return null;
      
      case null:
        return null;
    }
  }
  
  getTotalSizeInBytes() {
    let textValue = storageManager.getDataAsUtf16();
    
    switch (storageManager.getDataFormatInMedium()) {
      case 'text':
        return textValue.length * 2;
      
      case 'utf-8':
        return textValue.length * 2;
      
      case 'binary':
        return textValue.length * 2;
      
      case null:
        return null;
    }
  }
}
