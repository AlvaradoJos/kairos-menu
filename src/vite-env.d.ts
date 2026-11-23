/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Número de WhatsApp que recibe los pedidos, con código de país. Ej.: 50688887777. */
  readonly VITE_WHATSAPP_NUMBER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
