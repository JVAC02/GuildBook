import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
const site = fs.readFileSync('web/index.html', 'utf8');

test('GitHub Pages publica a interface web nas branches usadas pelo projeto', () => {
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /uses: actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /uses: actions\/deploy-pages@v4/);
  assert.match(workflow, /path: web/);
  assert.match(workflow, /SITE_URL: \$\{\{ steps\.deployment\.outputs\.page_url \}\}/);
  assert.match(workflow, /guildbook-version/);
  assert.match(workflow, /Dipirona 500 mg/);
  assert.match(workflow, /Paracetamol 500 mg/);
});

test('site estático não apresenta uma conta ChatGPT inexistente', () => {
  assert.match(site, /id="access-mode">Versão web</);
  assert.match(site, /accessMode\.textContent='Conta ChatGPT'/);
});
