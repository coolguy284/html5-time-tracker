function rawDataSave() {
  if (raw_data_text.style.display == '') {
    localStorage.html5_time_planner_events_arr = raw_data_text.value;
  }
}

function rawDataLoad() {
  if (localStorage.html5_time_planner_events_arr == null) {
    raw_data_text.style.display = 'none';
    raw_data_text.value = '';
  } else {
    raw_data_text.value = localStorage.html5_time_planner_events_arr;
    raw_data_text.style.display = '';
  }
}

function rawDataDelete() {
  if (!confirm('Are you sure?')) return;
  
  delete localStorage.html5_time_planner_events_arr;
  raw_data_text.style.display = 'none';
  raw_data_text.value = '';
}

function rawDataCreate() {
  if (localStorage.html5_time_planner_events_arr == null) {
    localStorage.html5_time_planner_events_arr = '';
    raw_data_text.value = '';
    raw_data_text.style.display = '';
  }
}

function rawDataSaveInMemoryData() {
  updateEventStorage();
  updateRawDataDisplay();
}
