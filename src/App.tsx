import Router from "preact-router";
import { CalendarList } from "./CalendarList";
import { Calendar } from "./Calendar";
import styles from "./App.module.css";

export function App() {
  return (
    <div class={styles.app}>
      <Router>
        <CalendarList path="/" />
        <Calendar path="/:id" />
      </Router>
    </div>
  );
}
