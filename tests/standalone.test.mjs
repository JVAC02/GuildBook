import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const standalone = fs.readFileSync('GuildBook-v6-Site.html', 'utf8');

test('arquivo único não depende de recursos externos', () => {
  assert.doesNotMatch(standalone, /<(?:script|link|img)\b[^>]*(?:src|href)="https?:/i);
  assert.doesNotMatch(standalone, /(?:src|href)="\.\//i);
  assert.match(standalone, /data:image\/svg\+xml;base64,/);
  assert.match(standalone, /id="guildbook-offline-utilities"/);
});

test('arquivo único inclui a versão clínica revisada', () => {
  assert.match(standalone, /guildbook-version" content="Versão 6\.3 · auditoria clínica, 322 medicamentos RENAME\/MS e Patologias"/);
  assert.doesNotMatch(standalone, /Dipirona 500 mg[^\n]{0,500}por até 3 dias/);
  assert.doesNotMatch(standalone, /Paracetamol 500 mg[^\n]{0,500}por até 3 dias/);
});

function standalonePrescriptionApi() {
  const start = standalone.indexOf("'use strict';");
  const end = standalone.indexOf('const FILTERS=');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${standalone.slice(start, end)}\nglobalThis.api={MEDICINES,PATHOLOGIES,RX_META,RX_PRESENTATIONS,PEDIATRIC_RX_META,formatPrescription,normalizeActiveName};`, context);
  return context.api;
}

test('standalone valida em loop o receituário de 100% das medicações', () => {
  const { MEDICINES, RX_META, formatPrescription } = standalonePrescriptionApi();
  assert.ok(MEDICINES.length >= 322);
  assert.equal(Object.keys(RX_META).length, MEDICINES.length);
  for (const medicine of MEDICINES) {
    const prescription = formatPrescription(medicine, medicine.adult.rx);
    assert.match(prescription, /^USO .+\n\n1\) .+ \(.+\) ---------------------------- \d+ (?:cx|fr|tb|amp|cp)\n {3}(?:Tomar|Aplicar|Injetar|Inalar|Pingar|Dissolver sob a língua)\b/, medicine.id);
    assert.doesNotMatch(prescription, /Máximo:|Dose máxima:|Reavaliar se|somente enquanto houver sintomas|undefined|null|\[object Object\]|por via/i, medicine.id);
  }
});

test('standalone preserva versão 6.3 e atualização visual Adulto/Pediatria', () => {
  assert.match(standalone, /guildbook-version" content="Versão 6\.3 · auditoria clínica, 322 medicamentos RENAME\/MS e Patologias"/);
  assert.match(standalone, /rx-mode-label/);
  assert.match(standalone, /Receituário pronto · \$\{ped\?'Pediatria':'Adulto'\}/);
});


test('standalone contém 322 princípios ativos normalizados sem duplicatas', () => {
  const { MEDICINES, normalizeActiveName } = standalonePrescriptionApi();
  const names = MEDICINES.map(medicine => normalizeActiveName(medicine.name));
  assert.ok(MEDICINES.length >= 322, `total encontrado: ${MEDICINES.length}`);
  assert.equal(new Set(names).size, names.length);
});

test('standalone valida adulto, pediatria e todas as apresentações', () => {
  const { MEDICINES, RX_PRESENTATIONS, formatPrescription } = standalonePrescriptionApi();
  for (const medicine of MEDICINES) {
    for (const [pediatric, raw] of [[false, medicine.adult.rx], [true, medicine.pediatric.rx || medicine.adult.rx]]) {
      const prescription = formatPrescription(medicine, raw, pediatric);
      assert.match(prescription, /^USO .+\n\n1\) .+ \(.+\) ---------------------------- \d+ (?:cx|fr|tb|amp|cp|env)\n {3}(?:Tomar|Aplicar|Injetar|Inalar|Pingar|Dissolver sob a língua)\b/, medicine.id);
      assert.doesNotMatch(prescription, /Máximo:|Dose máxima:|Reavaliar se|somente enquanto houver sintomas|undefined|null|\[object Object\]|por via/i, medicine.id);
    }
    for (const option of RX_PRESENTATIONS[medicine.id] || []) {
      const prescription = `${option.route}\n\n1) ${option.presentation} ---------------------------- ${option.quantity} ${option.unit}\n   ${option.instruction}`;
      assert.match(prescription, /^USO .+\n\n1\) .+ \(.+\) ---------------------------- \d+ (?:cx|fr|tb|amp|cp|env)\n {3}(?:Tomar|Aplicar|Injetar|Inalar|Pingar|Dissolver sob a língua)\b/, `${medicine.id}/${option.code}`);
      assert.notEqual(option.code, 'SO');
    }
  }
});


test('standalone expõe patologias completas e seus vínculos', () => {
  const { MEDICINES, PATHOLOGIES } = standalonePrescriptionApi();
  const ids = new Set(MEDICINES.map(m => m.id));
  assert.ok(PATHOLOGIES.length >= 45);
  for (const p of PATHOLOGIES) {
    assert.ok(p.basic && p.exams && p.treatment && p.followUp, p.id);
    for (const id of p.treatment.medicationIds) assert.ok(ids.has(id), `${p.id}/${id}`);
  }
  assert.match(standalone, /global-weight/);
  assert.match(standalone, /Copiar Prescrição Completa da Patologia/);
  assert.match(standalone, /Copiar Conduta p\/ Prontuário \(SOAP\)/);
});
