schedule_table_main_section_times_div.style.height = `${TABLE_DATA_FULL_HEIGHT}rem`;


function loadEventsArr() {
  eventStorage.loadFromMediumOrFillWithDefault();
}

loadEventsArr();
updateChartsSectionMainEventsUpdate();
updateDisplayedButtons();

addEventListener('keydown', evt => {
  // if on charts page and left or right arrow pressed, go to next or previous week
  if (charts_section_div.style.display != 'none') {
    switch (evt.key) {
      case 'ArrowLeft':
        decreaseWeek();
        break;
      
      case 'ArrowRight':
        increaseWeek();
        break;
    }
  }
});
