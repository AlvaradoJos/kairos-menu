/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Política de seguridad solo en el build: el servidor de desarrollo de Vite usa scripts en línea.
// Todo se sirve desde el propio sitio; WhatsApp se abre como navegación, no como petición.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function contentSecurityPolicy(): Plugin {
  return {
    name: 'kairos-csp',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig(({ mode }) => ({
  // GitHub Pages sirve el sitio en /<repo>/; el workflow pasa BASE_PATH. Local y dominio propio: "/".
  base: loadEnv(mode, '.', '').BASE_PATH || '/',
  plugins: [react(), contentSecurityPolicy()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
}));
