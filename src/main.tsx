import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update for offline caching of app shell & study assets
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA]: New content available, updating service worker cache in background...');
    },
    onOfflineReady() {
      console.log('[PWA]: NursesStudy is ready for offline operation');
    },
    onRegisterError(error: any) {
      console.warn('[PWA]: Service Worker registration notice:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
