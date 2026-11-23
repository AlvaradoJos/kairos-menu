// Pruebas del script que revisa WHATSAPP_NUMBER antes de publicar, y de dónde lo corre el workflow.
// Van en JavaScript, junto al script: el proyecto no tiene los tipos de Node (no se agregan dependencias).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = 'scripts/check-whatsapp-number.mjs';

/** Corre el script como lo corre el deploy, con WHATSAPP_NUMBER o sin él. */
function check(number) {
  const env = { ...process.env };
  delete env.WHATSAPP_NUMBER;
  if (number !== undefined) env.WHATSAPP_NUMBER = number;
  return spawnSync(process.execPath, [script], { cwd: root, env, encoding: 'utf8' });
}

describe('scripts/check-whatsapp-number.mjs', () => {
  it('falla si WHATSAPP_NUMBER no existe', () => {
    expect(check().status).toBe(1);
  });

  it('falla si está vacío o tiene mal formato', () => {
    for (const bad of ['', '   ', '88887777', '506-abc-7777', '5068888777712345678']) {
      expect(check(bad).status, JSON.stringify(bad)).toBe(1);
    }
  });

  it('pasa con un número válido y no lo imprime', () => {
    const result = check('+506 8888-7777');
    expect(result.status).toBe(0);
    expect(result.stdout + result.stderr).not.toMatch(/8888/);
  });
});

describe('deploy.yml', () => {
  const workflow = readFileSync(`${root}.github/workflows/deploy.yml`, 'utf8');
  const [checkJob, deployJob] = workflow.split(/^ {2}deploy:\r?$/m);

  it('el trabajo "deploy" revisa el número antes del build', () => {
    const step = deployJob.indexOf(`run: node ${script}`);
    expect(step).toBeGreaterThan(-1);
    expect(step).toBeLessThan(deployJob.indexOf('run: npm run build'));
  });

  it('el trabajo "check" no revisa el número (los pull requests no tienen la variable)', () => {
    expect(checkJob).not.toContain(script);
  });
});
