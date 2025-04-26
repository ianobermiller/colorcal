import type { CustomHistory } from 'preact-router';

import { createHashHistory } from 'history';
import { Router } from 'preact-router';
import { IoColorPalette } from 'react-icons/io5';

import { ButtonLink, LinkButton } from './Button';
import { CalendarList } from './CalendarList';
import { db } from './db';
import { Editor } from './Editor';
import { Landing } from './Landing';
import { Login } from './Login';

export function App() {
  const { user } = db.useAuth();

  return (
    <div className="mx-auto max-w-2xl p-3 lg:w-[1024px] lg:max-w-none">
      <header className="mb-3 flex items-center justify-between">
        <h1>
          <a className="flex items-center gap-1 text-2xl" href="/">
            <IoColorPalette /> Color Calendar
          </a>
        </h1>
        {user ? (
          <p>
            {user.email} <LinkButton onClick={() => db.auth.signOut()}>Logout</LinkButton>
          </p>
        ) : (
          <p>
            <ButtonLink href="/login">Login</ButtonLink>
          </p>
        )}
      </header>

      <Router history={createHashHistory() as unknown as CustomHistory}>
        {user ? <CalendarList path="/" /> : <Landing path="/" />}
        <Editor id="provided-by-router" path="/:id" />
        <Login path="/login" />
      </Router>
    </div>
  );
}
