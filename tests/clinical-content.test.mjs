import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('web/index.html', 'utf8');
const builtServer = fs.readFileSync('dist/server/index.js', 'utf8');

function medicineRecord(id) {
  const objectStart = source.indexOf(`id:'${id}'`);
  const factoryStart = source.indexOf(`mk('${id}'`);
  const start = objectStart === -1 ? factoryStart : objectStart;
  assert.notEqual(start, -1, `medicamento ${id} deve existir`);
  const end = source.indexOf('\n', start);
  return source.slice(start, end === -1 ? source.length : end);
}

test('analgésicos sintomáticos não inventam um limite fixo de três dias', () => {
  for (const id of ['dipirona', 'paracetamol', 'ibuprofeno']) {
    const record = medicineRecord(id);
    assert.doesNotMatch(record, /(?:por |)até 3 dias/);
    assert.match(record, /somente enquanto houver sintomas/);
    assert.match(record, /reavaliar se (?:os sintomas |)persistirem ou piorarem/i);
  }
});

test('demais prescrições sintomáticas não repetem o limite arbitrário', () => {
  assert.doesNotMatch(medicineRecord('simeticona'), /por (?:até )?3 dias/);
  assert.doesNotMatch(medicineRecord('butilbrometo-escopolamina'), /(?:por (?:até )?3 dias|por 2–3 dias)/);
});

test('durações vinculadas a tratamentos definidos permanecem intactas', () => {
  assert.match(medicineRecord('azitromicina'), /por 3 dias/);
  assert.match(medicineRecord('amoxicilina'), /por 10 dias/);
});

test('artefato publicado contém as correções de dipirona e paracetamol', () => {
  assert.doesNotMatch(builtServer, /Dipirona 500 mg[^\n]{0,500}por até 3 dias/);
  assert.doesNotMatch(builtServer, /Paracetamol 500 mg[^\n]{0,500}por até 3 dias/);
  assert.match(builtServer, /Versão 6\.2 · receituários e banco RENAME expandido/);
});

function loadPrescriptionApi(html) {
  const start = html.indexOf("'use strict';");
  const end = html.indexOf('const FILTERS=');
  assert.ok(start >= 0 && end > start, 'bloco clínico deve ser localizável');
  const script = `${html.slice(start, end)}\nglobalThis.api={MEDICINES,RX_META,RX_PRESENTATIONS,PEDIATRIC_RX_META,formatPrescription,normalizeActiveName};`;
  const context = {};
  vm.createContext(context);
  vm.runInContext(script, context);
  return context.api;
}

const VALID_RX = /^USO (?:ORAL|INTRAMUSCULAR \(IM\)|ENDOVENOSO \(EV\)|SUBCUTÂNEO \(SC\)|SUBLINGUAL \(SL\)|TÓPICO|INALATÓRIO|INTRANASAL|OFTÁLMICO|OTOLÓGICO|RETAL|VAGINAL)\n\n1\) .+ \(.+\) ---------------------------- \d+ (?:cx|fr|tb|amp|cp)\n {3}(?:Tomar|Aplicar|Injetar|Inalar|Pingar|Dissolver sob a língua)\b/;
const FORBIDDEN_RX = /Máximo:|Dose máxima:|Reavaliar se|somente enquanto houver sintomas|undefined|null|\[object Object\]|por via (?:oral|intravenosa|endovenosa|intramuscular|inalatória|tópica)/i;

test('todas as medicações geram receituário brasileiro estruturado individualmente', () => {
  const { MEDICINES, RX_META, formatPrescription } = loadPrescriptionApi(source);
  assert.ok(MEDICINES.length >= 50);
  assert.equal(Object.keys(RX_META).length, MEDICINES.length);
  for (const medicine of MEDICINES) {
    const prescription = formatPrescription(medicine, medicine.adult.rx);
    assert.match(prescription, VALID_RX, medicine.id);
    assert.doesNotMatch(prescription, FORBIDDEN_RX, medicine.id);
  }
});

test('versão 6.2 e alternância do Prontuário Pronto estão ligadas ao estado ativo', () => {
  assert.match(source, /guildbook-version" content="Versão 6\.2 · receituários e banco RENAME expandido"/);
  assert.match(fs.readFileSync('worker/index.js', 'utf8'), /GUILDBOOK_VERSION='6\.2'/);
  assert.equal(JSON.parse(fs.readFileSync('package.json', 'utf8')).version, '6.2.0');
  assert.match(source, /rx-mode-label/);
  assert.match(source, /textContent=`Receituário pronto · \$\{ped\?'Pediatria':'Adulto'\}`/);
  assert.match(source, /formatPrescription\(m,raw,ped\)/);
});


test('seletores RENAME oferecem receitas completas e alteráveis nas apresentações solicitadas', () => {
  const { RX_PRESENTATIONS } = loadPrescriptionApi(source);
  const expected = {
    dipirona: ['Cp', 'Gts', 'Susp/Sol', 'Amp'], paracetamol: ['Cp', 'Gts'],
    ondansetrona: ['Cp', 'Amp'], omeprazol: ['Cp', 'Amp'], furosemida: ['Cp', 'Amp'],
    dexametasona: ['Cp', 'Amp', 'Tb'], metoclopramida: ['Cp', 'Gts', 'Amp']
  };
  for (const [id, codes] of Object.entries(expected)) {
    assert.deepEqual(Array.from(RX_PRESENTATIONS[id], option => option.code), codes, id);
    for (const option of RX_PRESENTATIONS[id]) {
      const prescription = `${option.route}\n\n1) ${option.presentation} ---------------------------- ${option.quantity} ${option.unit}\n   ${option.instruction}`;
      assert.match(prescription, VALID_RX, `${id}/${option.code}`);
    }
  }
  assert.match(source, /style="white-space: pre-line"/);
  assert.match(source, /closest\('\.presentation'\)/);
});


test('expansão RENAME possui pelo menos 170 princípios ativos normalizados e sem duplicatas', () => {
  const { MEDICINES, normalizeActiveName } = loadPrescriptionApi(source);
  const names = MEDICINES.map(medicine => normalizeActiveName(medicine.name));
  assert.ok(MEDICINES.length >= 170, `total encontrado: ${MEDICINES.length}`);
  assert.equal(new Set(names).size, names.length, 'não pode haver princípio ativo normalizado repetido');
});

test('adulto, pediatria e todas as apresentações possuem receituário estrito', () => {
  const { MEDICINES, RX_PRESENTATIONS, formatPrescription } = loadPrescriptionApi(source);
  for (const medicine of MEDICINES) {
    for (const [mode, raw] of [['Adulto', medicine.adult.rx], ['Pediatria', medicine.pediatric.rx || medicine.adult.rx]]) {
      const prescription = formatPrescription(medicine, raw, mode === 'Pediatria');
      assert.match(prescription, VALID_RX, `${medicine.id}/${mode}`);
      assert.doesNotMatch(prescription, FORBIDDEN_RX, `${medicine.id}/${mode}`);
    }
    for (const option of RX_PRESENTATIONS[medicine.id] || []) {
      const prescription = `${option.route}\n\n1) ${option.presentation} ---------------------------- ${option.quantity} ${option.unit}\n   ${option.instruction}`;
      assert.match(prescription, VALID_RX, `${medicine.id}/${option.code}`);
      assert.doesNotMatch(prescription, FORBIDDEN_RX, `${medicine.id}/${option.code}`);
      assert.notEqual(option.code, 'SO', `${medicine.id}: a sigla SO é proibida`);
    }
  }
});
