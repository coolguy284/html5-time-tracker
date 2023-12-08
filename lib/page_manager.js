class PageManager {
  #dirtyBits = new Set();
  #pages = new Map();
  #currentPage = null;
  #lastActivePage = null;
  #selectedTabClassName = null;
  
  // internal functions
  
  #checkDirtyBitExistence(dirtyBit) {
    if (!this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} does not exist`);
    }
  }
  
  #checkPageExistence(page) {
    if (!this.#pages.has(page)) {
      throw new Error(`Error: page ${page} does not exist`);
    }
  }
  
  #checkPageAndDirtyBitExistence(page, dirtyBit) {
    this.#checkPageExistence(page);
    this.#checkDirtyBitExistence(dirtyBit);
  }
  
  #addDirtyBit(dirtyBit) {
    if (this.#dirtyBits.has(dirtyBit)) {
      throw new Error(`Error: dirtybit ${dirtyBit} already created`);
    }
    
    this.#dirtyBits.add(dirtyBit);
  }
  
  #addDirtyBitEventListener(page, dirtyBit, listener) {
    this.#checkPageAndDirtyBitExistence(page, dirtyBit);
    
    this.#pages.get(page).dirtyBitEventTarget.addEventListener(dirtyBit, listener);
  }
  
  #callDirtyBitEventListenersOnPage(page, dirtyBit) {
    this.#checkPageAndDirtyBitExistence(page, dirtyBit);
    
    this.#pages.get(page).dirtyBitEventTarget.dispatchEvent(new CustomEvent(dirtyBit));
  }
  
  #setDirtyBitOnPage(page, dirtyBit) {
    this.#checkPageAndDirtyBitExistence(page, dirtyBit);
    
    if (this.#currentPage == page) {
      this.#callDirtyBitEventListenersOnPage(page, dirtyBit);
    } else {
      let queuedDirtyBits = this.#pages.get(page).queuedDirtyBits;
      
      if (queuedDirtyBits.has(dirtyBit)) {
        // remove preexisting entry so new entry goes on the bottom for priority reasons
        queuedDirtyBits.delete(dirtyBit);
      }
      
      queuedDirtyBits.add(dirtyBit);
    }
  }
  
  #setDirtyBitAllPages(dirtyBit) {
    for (let page of this.#pages.keys()) {
      this.#setDirtyBitOnPage(page, dirtyBit);
    }
  }
  
  #clearQueuedDirtyBitsOnPage(page) {
    this.#checkPageExistence(page);
    
    for (let dirtyBit of this.#pages.get(page).queuedDirtyBits) {
      this.#callDirtyBitEventListenersOnPage(page, dirtyBit);
      
      this.#pages.get(page).queuedDirtyBits.delete(dirtyBit);
    }
  }
  
  #callPageBeforeRenderEnterListeners(page) {
    this.#checkPageExistence(page);
    
    for (let enterListener of this.#pages.get(page).beforeRenderEnterListeners) {
      enterListener();
    }
  }
  
  #callPageAfterRenderEnterListeners(page) {
    this.#checkPageExistence(page);
    
    for (let enterListener of this.#pages.get(page).afterRenderEnterListeners) {
      enterListener();
    }
  }
  
  #callPageBeforeHideExitListeners(page) {
    this.#checkPageExistence(page);
    
    for (let exitListener of this.#pages.get(page).beforeHideExitListeners) {
      exitListener();
    }
  }
  
  #callPageAfterHideExitListeners(page) {
    this.#checkPageExistence(page);
    
    for (let exitListener of this.#pages.get(page).afterHideExitListeners) {
      exitListener();
    }
  }
  
  #pageEnterActivities(page) {
    this.#clearQueuedDirtyBitsOnPage(page);
    
    this.#callPageBeforeRenderEnterListeners(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = '';
    }
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.add(this.#selectedTabClassName);
    }
    
    this.#callPageAfterRenderEnterListeners(page);
  }
  
  #pageExitActivities(page) {
    this.#callPageBeforeHideExitListeners(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = 'none';
    }
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.remove(this.#selectedTabClassName);
    }
    
    this.#callPageAfterHideExitListeners(page);
  }
  
  // setup functions
  
  createDirtyBits(dirtyBits) {
    if (this.#dirtyBits.size > 0) {
      throw new Error(`Error: dirty bits already set`);
    }
    
    for (let dirtyBit of dirtyBits) {
      this.#addDirtyBit(dirtyBit);
    }
  }
  
  getSelectedTabClass() {
    return this.#selectedTabClassName;
  }
  
  setSelectedTabClass(className) {
    this.#selectedTabClassName = className;
  }
  
  addPage(page, data) {
    if (this.#pages.has(page)) {
      throw new Error(`Error: page ${page} already created`);
    }
    
    this.#pages.set(
      page,
      {
        htmlElem: data.htmlElem ?? null,
        buttonElem: data.buttonElem ?? null,
        beforeRenderEnterListeners: data.beforeRenderEnterListeners ?? [],
        afterRenderEnterListeners: data.afterRenderEnterListeners ?? [],
        beforeHideExitListeners: data.beforeHideExitListeners ?? [],
        afterHideExitListeners: data.afterHideExitListeners ?? [],
        queuedDirtyBits: new Set(),
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
  
  // primary functions
  
  getCurrentPage() {
    return this.#currentPage;
  }
  
  getCurrentPageHTMLElem() {
    if (this.#currentPage != null) {
      return this.#pages.get(this.#currentPage).htmlElem;
    } else {
      return null;
    }
  }
  
  getCurrentPageButtonElem() {
    if (this.#currentPage != null) {
      return this.#pages.get(this.#currentPage).buttonElem;
    } else {
      return null;
    }
  }
  
  setDirtyBit(dirtyBit) {
    this.#setDirtyBitAllPages(dirtyBit);
  }
  
  switchPage(page) {
    if (page == null || page == false) {
      // deactivating page manager
      if (this.#currentPage != null) {
        this.#pageExitActivities(this.#currentPage);
        
        this.#lastActivePage = this.#currentPage;
        
        this.#currentPage = null;
      }
    } else if (page == true) {
      // activating page manager to last active page if there is one, else do nothing
      if (this.#lastActivePage != null) {
        this.switchPage(this.#lastActivePage);
        
        this.#lastActivePage = null;
      }
    } else {
      // switching to normal page
      this.#checkPageExistence(page);
      
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
