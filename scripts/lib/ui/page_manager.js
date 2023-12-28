class PageManager {
  #dirtyBits = new Set();
  #pages = new Map();
  #currentPage = null;
  #currentVisiblePage = null;
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
  
  #showPageDiv(page) {
    this.#checkPageExistence(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = '';
    }
  }
  
  #hidePageDiv(page) {
    this.#checkPageExistence(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.htmlElem != null) {
      pageObj.htmlElem.style.display = 'none';
    }
  }
  
  #deactivatePageButton(page) {
    this.#checkPageExistence(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.remove(this.#selectedTabClassName);
    }
  }
  
  #activatePageButton(page) {
    this.#checkPageExistence(page);
    
    let pageObj = this.#pages.get(page);
    
    if (pageObj.buttonElem != null && this.#selectedTabClassName != null) {
      pageObj.buttonElem.classList.add(this.#selectedTabClassName);
    }
  }
  
  #pageEnterActivities(page) {
    this.#clearQueuedDirtyBitsOnPage(page);
    
    this.#callPageBeforeRenderEnterListeners(page);
    
    this.#showPageDiv(page);
    this.#activatePageButton(page);
    
    this.#callPageAfterRenderEnterListeners(page);
  }
  
  #pageExitActivities(page, switchingPage) {
    this.#callPageBeforeHideExitListeners(page);
    
    if (PAGE_MANAGER_HIDE_PAGE_ON_NULL) {
      this.#hidePageDiv(page);
    } else {
      if (switchingPage) {
        this.#hidePageDiv(page);
      }
    }
    
    this.#deactivatePageButton(page);
    
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
        this.#pageExitActivities(this.#currentPage, false);
        
        this.#lastActivePage = this.#currentPage;
        
        this.#currentPage = null;
        
        if (PAGE_MANAGER_HIDE_PAGE_ON_NULL) {
          this.#currentVisiblePage = null;
        }
      }
    } else if (page == true) {
      // activating page manager to last active page if there is one, else do nothing
      if (this.#currentPage == null && this.#lastActivePage != null) {
        this.switchPage(this.#lastActivePage);
        
        this.#lastActivePage = null;
      }
    } else {
      // switching to normal page
      if (page != this.#currentPage) {
        this.#checkPageExistence(page);
        
        if (this.#currentPage != null) {
          this.#pageExitActivities(this.#currentPage, true);
        } else {
          if (PAGE_MANAGER_HIDE_PAGE_ON_NULL && this.#currentVisiblePage != null) {
            this.#hidePageDiv(this.#currentVisiblePage);
          }
        }
        
        this.#pageEnterActivities(page);
        
        this.#currentPage = page;
        
        this.#currentVisiblePage = page;
      }
    }
  }
  
  activate() {
    this.switchPage(true);
  }
  
  deactivate() {
    this.switchPage(null);
  }
  
  deactivateWithPage(page) {
    // deactivates, then sets page as the page to restore to
    this.#checkPageExistence(page);
    
    this.switchPage(null);
    
    this.#lastActivePage = page;
  }
}
