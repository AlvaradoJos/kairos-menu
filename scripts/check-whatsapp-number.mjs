// Revisa WHATSAPP_NUMBER antes de publicar. Lo corre el trabajo "deploy" de .github/workflows/deploy.yml.
// Sin un número válido el sitio saldría sin botón de WhatsApp y nadie podría pedir, así que el deploy falla.
// Usa la misma regla que el sitio (parseWhatsappNumber); Node lee el .ts directamente (Node 22.18+).
// No imprime el número: el registro de GitHub Actions lo puede ver cualquiera con acceso al repo.

import { parseWhatsappNumber } from '../src/features/whatsapp/number.ts';

if (parseWhatsappNumber(process.env.WHATSAPP_NUMBER) === undefined) {
  console.error(
    'WHATSAPP_NUMBER falta o no es válido (10 a 15 dígitos con código de país, p. ej. 506 y 8 dígitos). ' +
      'Defínelo en Settings → Secrets and variables → Actions → Variables antes de publicar.',
  );
  process.exit(1);
}
console.log('WHATSAPP_NUMBER es válido.');
