import { createHashHistory } from 'history';
import Router, { CustomHistory } from 'preact-router';
import { loginWithRedirect, logout } from 'thin-backend';
import { useCurrentUser } from 'thin-backend-react';
import styles from './App.module.css';
import { Editor } from './Editor';
import { CalendarList } from './CalendarList';
import { IoColorPalette } from 'react-icons/io5';
import { Landing } from './Landing';
import { ButtonLink } from './Button';

export function App() {
  const user = useCurrentUser();
  return (
    <div class={styles.app}>
      <header class={styles.header}>
        <h1>
          <a href="/">
            <IoColorPalette /> Color Calendar
          </a>
        </h1>
        {user ? (
          <p>
            {user.email} <ButtonLink onClick={() => logout()}>Logout</ButtonLink>
          </p>
        ) : (
          <p>
            <ButtonLink onClick={() => loginWithRedirect()}>Login</ButtonLink>
          </p>
        )}
      </header>

      <Router history={createHashHistory() as unknown as CustomHistory}>
        {user ? <CalendarList path="/" /> : <Landing path="/" />}
        <Editor path="/:id" />
      </Router>
    </div>
  );
}
