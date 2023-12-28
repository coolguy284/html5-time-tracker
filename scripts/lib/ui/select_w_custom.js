class IntegerSelectWithCustom {
  #selectElem;
  #inputElem;
  #customName;
  #customBindings;
  
  constructor(selectElem, inputElem, customName, customBindings) {
    // set vars
    this.#selectElem = selectElem;
    this.#inputElem = inputElem;
    this.#customName = customName;
    this.#customBindings = customBindings;
    
    // attach on change handler to update input
    this.#selectElem.addEventListener('change', () => {
      this.#updateInputElemVisibility();
    });
    
    // initial update incase select is custom
    this.#updateInputElemVisibility();
  }
  
  #updateInputElemVisibility() {
    if (this.#selectElem.value == this.#customName) {
      this.#inputElem.style.display = '';
    } else {
      this.#inputElem.style.display = 'none';
    }
  }
  
  get() {
    if (this.#selectElem.value == this.#customName) {
      return parseInt(this.#inputElem.value);
    } else if (this.#selectElem.value in this.#customBindings) {
      return this.#customBindings[this.#selectElem.value];
    } else {
      return parseInt(this.#selectElem.value);
    }
  }
}
