import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerServiceWorker } from '@/app/pwa';
import { initStorage } from '@/shared/lib/utils/storage';
import '@/app/styles/tokens.css';
import '@/app/styles/reset.css';

const bootstrap = async (): Promise<void> => {
  await initStorage();
  const { default: App } = await import('./App');

  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

registerServiceWorker();
void bootstrap();
