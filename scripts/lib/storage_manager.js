class StorageManager {
  static getDefaultMediumFormat() {
    return 'LocalStorage';
  }
  
  async getMediumFormat() {
    if (LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage) {
      return 'LocalStorage';
    } else if (await navigator.storage.getDirectory(OPFS_MAIN_FOLDER)) { // TODO
      return 'OPFS';
    } else {
      return StorageManager.getDefaultMediumFormat();
    }
  }
  
  async getDataFormatInMedium() {
    switch (await this.getMediumFormat()) {
      case 'LocalStorage': {
        let dataString = await this.getDataAsUtf16();
        
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
  
  async dataIsStored() {
    switch (await this.getMediumFormat()) {
      case 'LocalStorage':
        return LOCALSTORAGE_MAIN_STORAGE_KEY in localStorage;
    }
  }
  
  async getDataAsUtf16() { // TODO -- left off here
    switch (await this.getMediumFormat()) {
      case 'LocalStorage':
        return localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY];
    }
  }
  
  async setDataAsUtf16(text) {
    switch (await this.getMediumFormat()) {
      case 'LocalStorage':
        localStorage[LOCALSTORAGE_MAIN_STORAGE_KEY] = text;
    }
  }
  
  async getTotalSizeInChars() {
    let textValue = await storageManager.getDataAsUtf16();
    
    switch (await storageManager.getDataFormatInMedium()) {
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
  
  async getTotalSizeInBytes() {
    let textValue = await storageManager.getDataAsUtf16();
    
    switch (await storageManager.getDataFormatInMedium()) {
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
