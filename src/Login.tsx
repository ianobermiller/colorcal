import { route } from 'preact-router';
import { useState } from 'preact/hooks';

import { Button } from './Button';
import { db } from './db';

interface Props {
  /** for preact-router */
  path: string;
}

export function Login(_: Props) {
  const [sentEmail, setSentEmail] = useState('');
  return <div>{!sentEmail ? <Email setSentEmail={setSentEmail} /> : <MagicCode sentEmail={sentEmail} />}</div>;
}

function Email({ setSentEmail }: { setSentEmail: (email: string) => void }) {
  const [email, setEmail] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <h2>Let&apos;s log you in!</h2>

      <form
        className="flex gap-2"
        onSubmit={() => {
          if (!email) return;
          setSentEmail(email);

          db.auth.sendMagicCode({ email }).catch((err: unknown) => {
            console.error(err);
            setSentEmail('');
          });
        }}
      >
        <input
          id="email"
          name="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="Enter your email"
          type="email"
          value={email}
        />

        <Button type="submit">Send Code</Button>
      </form>
    </div>
  );
}

function MagicCode({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState('');
  return (
    <div className="flex flex-col gap-4">
      <h2>Okay we sent an email to {sentEmail}! What was the code?</h2>

      <form
        className="flex gap-2"
        onSubmit={() => {
          db.auth
            .signInWithMagicCode({ code, email: sentEmail })
            .then(() => {
              route('/');
            })
            .catch((err: unknown) => {
              console.error(err);
              setCode('');
            });
        }}
      >
        <input onChange={(e) => setCode(e.currentTarget.value)} size={6} type="text" value={code} />

        <Button type="submit">Verify</Button>
      </form>
    </div>
  );
}
