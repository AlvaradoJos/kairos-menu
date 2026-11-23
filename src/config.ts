// Datos del negocio (WhatsApp, envío, horario, dirección y redes). Los usan App, Header y Footer.

import type { Colones } from './features/menu/types';
import { parseWhatsappNumber } from './features/whatsapp/number';

/** Datos del negocio que muestra la página. */
export interface BusinessConfig {
  /** Formato internacional, solo dígitos o con +, espacios o guiones. Ej.: "50688887777". */
  whatsappNumber?: string;
  /** Costo del envío express. Sin definir: el mensaje dice "por confirmar". */
  deliveryFee?: Colones;
  hours?: string;
  address?: string;
  socials: { label: string; url: string }[];
}

// Datos pendientes del dueño. No inventar: dejar sin definir hasta tenerlos.
// El número de WhatsApp no va en el código: sale de VITE_WHATSAPP_NUMBER (archivo .env en local,
// variable del repo WHATSAPP_NUMBER al publicar). Ver .env.example.
export const config: BusinessConfig = {
  whatsappNumber: parseWhatsappNumber(import.meta.env.VITE_WHATSAPP_NUMBER),
  socials: [],
};
