import { render } from 'preact';
import { initThinBackend } from 'thin-backend';
import { ThinBackend } from 'thin-backend-react';
import { App } from './App';
import './index.css';

initThinBackend({ host: 'https://color-calendar.thinbackend.app' });

render(
  <ThinBackend>
    <App />
  </ThinBackend>,
  document.body,
);
