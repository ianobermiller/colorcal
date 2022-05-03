import { createHashHistory } from "history";
import Router, { CustomHistory } from "preact-router";
import styles from "./App.module.css";
import { Calendar } from "./Calendar";
import { CalendarList } from "./CalendarList";

export function App() {
  return (
    <div class={styles.app}>
      <Router history={createHashHistory() as unknown as CustomHistory}>
        <CalendarList path="/" />
        <Calendar path="/:id" />
      </Router>
    </div>
  );
}
