import Router, { CustomHistory } from "preact-router";
import { CalendarList } from "./CalendarList";
import { Calendar } from "./Calendar";
import styles from "./App.module.css";
import { createHashHistory } from "history";

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
