import { HashRouter, Route } from '@solidjs/router';
import ColorPaletteIcon from '~icons/ion/color-palette';
import { Show } from 'solid-js';

import { ButtonLink, LinkButton } from './Button';
import { CalendarList } from './CalendarList';
import { db } from './db';
import { Editor } from './Editor';
import { useAuth } from './db';
import { Landing } from './Landing';
import { Login } from './Login';

export function App() {
  const { user } = useAuth();

  return (
    <div class="mx-auto max-w-2xl p-3 lg:w-[1024px] lg:max-w-none">
      <header class="mb-3 flex items-center justify-between">
        <h1>
          <a class="flex items-center gap-1 text-2xl" href="/">
            <ColorPaletteIcon height="24" width="24" />
            Color Calendar
          </a>
        </h1>
        <p>
          <Show fallback={<ButtonLink href="/login">Login</ButtonLink>} when={user()}>
            {user()?.email} <LinkButton onClick={() => db.auth.signOut()}>Logout</LinkButton>
          </Show>
        </p>
      </header>

      <HashRouter>
        <Route
          component={() => (
            <Show fallback={<Landing />} when={user()}>
              <CalendarList />
            </Show>
          )}
          path="/"
        />
        <Route component={({ params }) => <Editor id={params.id} />} path="/:id" />
        <Route component={Login} path=" /login" />
      </HashRouter>
    </div>
  );
}
