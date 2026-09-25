import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

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
  assert.match(builtServer, /Versão 6 · prescrições sintomáticas revisadas/);
});
