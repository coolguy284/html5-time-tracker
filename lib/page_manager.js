class PageManager {
  #dirtyBits = new Set();
  #pages = new Map();
  #currentPage = null;
  #lastActivePage = null;
  #selectedTabClassName = null;
  
  // internal functions
  
  #addDirtyBit(dirtyBit) {
    if (this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} already created`);
    }
    
    this.#dirtyBits.add(dirtyBit);
  }
  
  #addDirtyBitEventListener(page, dirtyBit, listener) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    if (!this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} does not exist`);
    }
    
    this.#pages.get(page).dirtyBitEventTarget.addEventListener(dirtyBit, listener);
  }
  
  #callDirtyBitEventListenersOnPage(page, dirtyBit) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    if (!this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} does not exist`);
    }
    
    this.#pages.get(page).dirtyBitEventTarget.dispatchEvent(new CustomEvent(dirtyBit));
  }
  
  #setDirtyBitOnPage(page, dirtyBit) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    if (!this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} does not exist`);
    }
    
    if (this.#currentPage == page) {
      this.#callDirtyBitEventListenersOnPage(page, dirtyBit);
    } else {
      this.#pages.get(page).queuedDirtyBits.set(dirtyBit, true);
    }
  }
  
  #setDirtyBitAllPages(dirtyBit) {
    for (let page of this.#pages.keys()) {
      this.#setDirtyBitOnPage(page, dirtyBit);
    }
  }
  
  #clearQueuedDirtyBitsOnPage(page) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    for (let [ dirtyBit, dirtyBitSet ] of this.#pages.get(page).queuedDirtyBits) {
      if (dirtyBitSet) {
        this.#callDirtyBitEventListenersOnPage(page, dirtyBit);
        
        this.#pages.get(page).queuedDirtyBits.set(dirtyBit, false);
      }
    }
  }
  
  #callPageEnterListeners(page) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    for (let enterListener of this.#pages.get(page).enterListeners) {
      enterListener();
    }
  }
  
  #callPageExitListeners(page) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
    
    for (let exitListener of this.#pages.get(page).exitListeners) {
      exitListener();
    }
  }
  
  #pageEnterActivities(page) {
    this.#clearQueuedDirtyBitsOnPage(page);
    
    this.#callPageEnterListeners(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = '';
    }
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.add(this.#selectedTabClassName);
    }
  }
  
  #pageExitActivities(page) {
    this.#callPageExitListeners(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = 'none';
    }
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.remove(this.#selectedTabClassName);
    }
  }
  
  // external functions
  
  createDirtyBits(dirtyBits) {
    if (this.#dirtyBits.size > 0) {
      throw new Error(`Error: dirty bits already set`);
    }
    
    for (let dirtyBit of dirtyBits) {
      this.#addDirtyBit(dirtyBit);
    }
  }
  
  setSelectedTabClass(className) {
    this.#selectedTabClassName = className;
  }
  
  addPage(page, data) {
    if (this.#pages.has(page)) {
      throw new Error(`Error: page ${page} already created`);
    }
    
    let queuedDirtyBits = new Map();
    
    for (let dirtyBit of this.#dirtyBits) {
      queuedDirtyBits.set(dirtyBit, false);
    }
    
    this.#pages.set(
      page,
      {
        htmlElem: data.htmlElem ?? null,
        buttonElem: data.buttonElem ?? null,
        enterListeners: data.enterListeners ?? [],
        exitListeners: data.exitListeners ?? [],
        queuedDirtyBits,
        dirtyBitEventTarget: new EventTarget(),
      }
    );
    
    for (let [ dirtyBit, listeners ] of Object.entries(data.dirtyBitListeners ?? {})) {
      for (let listener of listeners) {
        this.#addDirtyBitEventListener(page, dirtyBit, listener);
      }
    }
  }
  
  addPages(pagesObj) {
    for (let [ name, data ] of Object.entries(pagesObj)) {
      this.addPage(name, data);
    }
  }
  
  setDirtyBit(dirtyBit) {
    this.#setDirtyBitAllPages(dirtyBit);
  }
  
  switchPage(page) {
    if (page == null || page == false) {
      // deactivating page manager
      this.#pageExitActivities(this.#currentPage);
      
      if (this.#currentPage != null) {
        this.#lastActivePage = this.#currentPage;
      }
      
      this.#currentPage = null;
    } else if (page == true) {
      // activating page manager to last active page if there is one, else do nothing
      if (this.#lastActivePage != null) {
        this.switchPage(this.#lastActivePage);
        
        this.#lastActivePage = null;
      }
    } else {
      // switching to normal page
      
      if (this.#currentPage != null) {
        this.#pageExitActivities(this.#currentPage);
      }
      
      this.#pageEnterActivities(page);
      
      this.#currentPage = page;
    }
  }
  
  activate() {
    this.switchPage(true);
  }
  
  deactivate() {
    this.switchPage(null);
  }
}
