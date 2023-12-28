function scrollToTop(elem) {
  // https://stackoverflow.com/questions/10744299/scroll-back-to-the-top-of-scrollable-div/10744324#10744324
  elem.scrollTop = 0;
}

function scrollToBottom(elem) {
  // https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div/270628#270628
  elem.scrollTop = elem.scrollHeight;
}
