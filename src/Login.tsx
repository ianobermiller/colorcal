import { useNavigate } from '@solidjs/router';
import { createSignal } from 'solid-js';

import { Button } from './Button';
import { db } from './db';
import { Input } from './Input';

export function Login() {
  const [sentEmail, setSentEmail] = createSignal('');
  return <div>{!sentEmail() ? <Email setSentEmail={setSentEmail} /> : <MagicCode sentEmail={sentEmail()} />}</div>;
}

function Email(props: { setSentEmail: (email: string) => void }) {
  const [email, setEmail] = createSignal('');
  const [error, setError] = createSignal('');
  
  return (
    <div class="flex flex-col gap-4">
      <h2>Let&apos;s log you in!</h2>

      <form
        class="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();

          if (!email()) return;
          props.setSentEmail(email());

          db.auth.sendMagicCode({ email: email() }).catch((err: unknown) => {
            console.error(err);
            props.setSentEmail('');
            setError('Unable to send code' + (err instanceof Error ? `: ${err.message}` : ''));
          });
        }}
      >
        <Input
          id="email"
          name="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Enter your email"
          type="email"
          value={email()}
        />

        <Button type="submit">Send Code</Button>
      </form>

      {error() && <p class="text-red-500">{error()}</p>}
    </div>
  );
}

function MagicCode(props: { sentEmail: string }) {
  const navigate = useNavigate();
  const [code, setCode] = createSignal('');
  const [error, setError] = createSignal('');
  
  return (
    <div class="flex flex-col gap-4">
      <h2>Okay we sent an email to {props.sentEmail}! What was the code?</h2>
      <form
        class="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();

          if (!code()) return;

          db.auth
            .signInWithMagicCode({ code: code(), email: props.sentEmail })
            .then(() => navigate('/'))
            .catch((err: unknown) => {
              console.error(err);
              setCode('');
              setError('Unable to verify code' + (err instanceof Error ? `: ${err.message}` : ''));
            });
        }}
      >
        <Input onChange={(e) => setCode(e.currentTarget.value)} size={6} type="text" value={code()} />

        <Button type="submit">Verify</Button>
      </form>

      {error() && <p class="text-red-500">{error()}</p>}
    </div>
  );
}
