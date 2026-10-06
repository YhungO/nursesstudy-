// Ensure React Fast Refresh preamble globals exist immediately
if (typeof window !== 'undefined') {
  (window as any).$RefreshReg$ = (window as any).$RefreshReg$ || (() => {});
  (window as any).$RefreshSig$ = (window as any).$RefreshSig$ || (() => (type: any) => type);
  (window as any).__vite_plugin_react_preamble_installed__ = true;
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update for offline caching of app shell & study assets
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
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
