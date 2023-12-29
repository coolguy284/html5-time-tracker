class StorageMeterManager {
  #meterManager;
  #totalText;
  #usedText;
  #freeText;
  #percentPrecision;
  #calcProgressDiv;
  #calcProgressText;
  
  constructor(opts) {
    if (!('meterDiv' in opts)) throw new Error('meterDiv not in opts');
    if (!('meterSteps' in opts)) throw new Error('meterSteps not in opts');
    if (!('totalText' in opts)) throw new Error('totalText not in opts');
    if (!('usedText' in opts)) throw new Error('usedText not in opts');
    if (!('freeText' in opts)) throw new Error('freeText not in opts');
    if (!('percentPrecision' in opts)) throw new Error('percentPrecision not in opts');
    if (!('calcProgressDiv' in opts)) throw new Error('calcProgressDiv not in opts');
    if (!('calcProgressText' in opts)) throw new Error('calcProgressText not in opts');
    
    this.#meterManager = new MeterManager(
      opts.meterDiv,
      opts.meterSteps,
    );
    
    this.#totalText = opts.totalText;
    this.#usedText = opts.usedText;
    this.#freeText = opts.freeText;
    this.#percentPrecision = opts.percentPrecision;
    this.#calcProgressDiv = opts.calcProgressDiv;
    this.#calcProgressText = opts.calcProgressText;
  }
  
  blankStorageCapacityView() {
    this.#meterManager.setValue(0);
    this.#totalText.textContent = '-- B';
    this.#usedText.textContent = '-- B (--%)';
    this.#freeText.textContent = '-- B (--%)';
  }
  
  setStorageCapacityView(totalBytes, usedBytes, freeBytes) {
    this.#meterManager.setValue(usedBytes / totalBytes);
    this.#totalText.textContent = prettifyBytes(totalBytes);
    this.#usedText.textContent = `${prettifyBytes(usedBytes)} (${(usedBytes / totalBytes * 100).toFixed(this.#percentPrecision)}%)`;
    this.#freeText.textContent = `${prettifyBytes(freeBytes)} (${(freeBytes / totalBytes * 100).toFixed(this.#percentPrecision)}%)`;
  }
  
  setStorageCalcProgress(progressText) {
    if (progressText == null) {
      if (this.#calcProgressDiv.style.display != 'none') {
        this.#calcProgressDiv.style.display = 'none';
      }
    } else {
      if (this.#calcProgressDiv.style.display == 'none') {
        this.#calcProgressDiv.style.display = '';
      }
      
      this.#calcProgressText.textContent = progressText;
    }
  }
}
