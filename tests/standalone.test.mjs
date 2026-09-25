import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const standalone = fs.readFileSync('GuildBook-v6-Site.html', 'utf8');

test('arquivo único não depende de recursos externos', () => {
  assert.doesNotMatch(standalone, /<(?:script|link|img)\b[^>]*(?:src|href)="https?:/i);
  assert.doesNotMatch(standalone, /(?:src|href)="\.\//i);
  assert.match(standalone, /data:image\/svg\+xml;base64,/);
  assert.match(standalone, /id="guildbook-offline-utilities"/);
});

test('arquivo único inclui a versão clínica revisada', () => {
  assert.match(standalone, /guildbook-version" content="6"/);
  assert.doesNotMatch(standalone, /Dipirona 500 mg[^\n]{0,500}por até 3 dias/);
  assert.doesNotMatch(standalone, /Paracetamol 500 mg[^\n]{0,500}por até 3 dias/);
});
