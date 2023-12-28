class MeterManager {
  #value;
  #meterDivElem;
  #colorMap;
  
  constructor(meterDivElemVal, colorMap) {
    this.#meterDivElem = meterDivElemVal;
    this.#colorMap = colorMap;
  }
  
  setValue(value) {
    if (Number.isNaN(value)) {
      value = 0;
    } else if (value < 0) {
      value = 0;
    } else if (value > 1) {
      value = 1;
    }
    
    this.#value = value;
    
    this.#updateMeterWidthAndColor();
  }
  
  getValue() {
    return this.#value;
  }
  
  #updateMeterWidthAndColor() {
    this.#meterDivElem.style.width = `${this.#value * 100}%`;
    
    for (let colorMapEntry of this.#colorMap) {
      if (colorMapEntry.max >= this.#value) {
        this.#meterDivElem.style.backgroundColor = colorMapEntry.color;
        break;
      }
    }
  }
}
