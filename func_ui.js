function getRadioButtonValue(name) {
  let chosenRadio = document.querySelector(`[name = ${name}]:checked`);
  
  if (chosenRadio == null) {
    return null;
  } else {
    return chosenRadio.parentElement.textContent.trim();
  }
}
