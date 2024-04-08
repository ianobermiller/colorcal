import { createHashHistory } from 'history';
import { CustomHistory, Router } from 'preact-router';
import { IoColorPalette } from 'react-icons/io5';
import { Editor } from './Editor';
import { CalendarList } from './CalendarList';
import { Landing } from './Landing';
import { ButtonLink, LinkButton } from './Button';
import { auth, useAuth } from './data';
import { Login } from './Login';

export function App() {
  const { user } = useAuth();

  return (
    <div class="max-w-2xl mx-auto p-3 lg:max-w-none lg:w-[1024px]">
      <header class="items-center flex justify-between mb-3">
        <h1>
          <a class="items-center flex gap-1 text-2xl" href="/">
            <IoColorPalette /> Color Calendar
          </a>
        </h1>
        {user ? (
          <p>
            {user.email} <LinkButton onClick={() => auth.signOut()}>Logout</LinkButton>
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
