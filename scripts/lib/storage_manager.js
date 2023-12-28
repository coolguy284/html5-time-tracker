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
}
