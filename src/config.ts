import type { Colones } from './features/menu/types';

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
export const config: BusinessConfig = {
  whatsappNumber: '50670185119', // Confirmado por Jose el 2026-10-24.
  socials: [],
};
