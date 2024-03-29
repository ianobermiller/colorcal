import { route } from 'preact-router';
import { useState } from 'preact/hooks';
import { auth } from './data';
import { Button } from './Button';

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
    <>
      <h2>Let&apos;s log you in!</h2>

      <input
        id="email"
        name="email"
        onChange={(e) => setEmail(e.currentTarget.value)}
        placeholder="Enter your email"
        type="email"
        value={email}
      />

      <Button
        onClick={() => {
          if (!email) return;
          setSentEmail(email);

          auth.sendMagicCode({ email }).catch((err) => {
            console.error(err);
            setSentEmail('');
          });
        }}
      >
        Send Code
      </Button>
    </>
  );
}

function MagicCode({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState('');
  return (
    <>
      <h2>Okay we sent an email to {sentEmail}! What was the code?</h2>

      <input
        onChange={(e) => setCode(e.currentTarget.value)}
        placeholder="Enter the code from the email"
        type="text"
        value={code}
      />

      <Button
        onClick={() => {
          auth
            .signInWithMagicCode({ code, email: sentEmail })
            .then(() => {
              route('/');
            })
            .catch((err) => {
              console.error(err);
              setCode('');
            });
        }}
      >
        Verify
      </Button>
    </>
  );
}
