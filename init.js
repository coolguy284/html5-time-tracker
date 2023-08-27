let currentEvent = 'Nothing';

/* [[<time string: string>, <event name: string>, <deleted: boolean>, <estimated: boolean>, <additional info: string>], ...] */
let eventsArr;

if (localStorage.html5_time_planner_events_arr) {
  try {
    eventsArr = JSON.parse(localStorage.html5_time_planner_events_arr);
  } catch (e) {}
}

if (!eventsArr) eventsArr = [];
