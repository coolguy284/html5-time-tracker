function removeAllChildren(elem) {
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript/3955238#3955238
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

function removeAllChildrenButOne(elem) {
  while (elem.children.length > 1) {
    elem.removeChild(elem.lastChild);
  }
}

function getRadioButtonValue(name) {
  let chosenRadio = document.querySelector(`[name = ${name}]:checked`);
  
  if (chosenRadio == null) {
    return null;
  } else {
    return chosenRadio.parentElement.textContent.trim();
  }
}
