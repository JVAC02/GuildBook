import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
export function loadClinical(html=fs.readFileSync('web/index.html','utf8')){
 const context={};vm.createContext(context);
 const start=html.indexOf("'use strict';"),end=html.indexOf('const FILTERS=');
 vm.runInContext(html.slice(start,end)+';globalThis.api={MEDICINES,PATHOLOGIES,RX_PRESENTATIONS,CLINICAL_SOURCES,renameRecord,getPrescription,formatPrescription,copyMedicinePrescription,clinicalCounts,pathologyPrescription,pathologySoap,normalizeActiveName};',context);
 return context.api;
}
const api=loadClinical();
const valid=(id,code)=>({mode:'adult',presentation:code,indication:api.RX_PRESENTATIONS[id].find(s=>s.code===code).indications[0],adultAge:'35',days:'5',quantity:id==='diclofenaco'?'15':'24',screened:true});
test('preserva 322 cadastros e 49 patologias, sem declarar auditoria integral',()=>{
 assert.equal(api.MEDICINES.length,322);assert.equal(api.PATHOLOGIES.length,49);
 assert.deepEqual(JSON.parse(JSON.stringify(api.clinicalCounts())),{catalog:322,enabled:2,blocked:320,schemes:4});
 assert.equal(new Set(api.MEDICINES.map(m=>m.id)).size,322);
 for(const m of api.MEDICINES)assert.ok(['cadastro','conteudo-revisado','receita-habilitada'].includes(m.validation.status));
});
test('todos os registros não validados recusam geração e cópia adulta/pediátrica',async()=>{
 let writes=0;
 for(const m of api.MEDICINES.filter(m=>m.validation.status==='cadastro')){
  for(const mode of ['adult','pediatric'])await assert.rejects(api.copyMedicinePrescription(m.id,{...valid('diclofenaco','K50-8h'),mode},()=>writes++),/bloqueada/);
  assert.throws(()=>api.formatPrescription(m,'Tomar 01 comprimido uma vez ao dia.'),/bloqueada/);
 }
 assert.equal(writes,0);
 for(const name of ['Alteplase','Cisatracúrio','Insulina glargina','Futuro medicamento']){
  const m=api.renameRecord(name);assert.equal(m.adult.rx,null);assert.equal(m.pediatric.rx,null);assert.equal(m.pediatric.kind,'manual');assert.doesNotMatch(m.presentations,/comprimido|oral|EV/);
 }
});
test('alteplase e cisatracúrio nunca aparecem como comprimidos orais; glargina não tem receita EV',()=>{
 for(const id of ['alteplase','cisatracurio']){const m=api.MEDICINES.find(m=>m.id===id);assert.doesNotMatch(m.presentations,/comprimido|oral/i);assert.match(m.presentations,/intravenos/i);assert.equal(api.RX_PRESENTATIONS[id],undefined);}
 const m=api.MEDICINES.find(m=>m.id==='insulina-glargina');assert.match(m.presentations,/subcutâneo/);assert.match(m.presentations,/não administrar EV/);assert.equal(api.RX_PRESENTATIONS[m.id],undefined);
});
test('adrenalina é identificada como sinônimo, sem duplicar esquema de epinefrina',()=>{
 assert.equal(api.MEDICINES.find(m=>m.id==='adrenalina').aliasOf,'epinefrina');
 assert.equal(api.MEDICINES.find(m=>m.id==='escopolamina-dipirona').category,'Sintomáticos');
 assert.notEqual(api.normalizeActiveName('Diclofenaco sódico'),api.normalizeActiveName('Diclofenaco potássico'));
});
test('combinação, indicação, população, avaliação e quantidade são verificadas no momento de copiar',()=>{
 const data=valid('diclofenaco','K50-8h');
 for(const delta of [{mode:'pediatric'},{presentation:'Na-IM'},{presentation:''},{indication:'Dengue'},{adultAge:'12'},{adultAge:'65'},{days:''},{days:'0'},{days:'9007199254740992'},{days:'1.5'},{quantity:'0'},{quantity:'14'},{quantity:'25'},{quantity:'NaN'},{quantity:'15.5'},{screened:false}])assert.throws(()=>api.getPrescription('diclofenaco',{...data,...delta}));
 assert.match(api.getPrescription('diclofenaco',data).text,/50 mg/);
});
test('cada esquema habilitado tem fonte direta, título, ano, data e texto sem perdas',async()=>{
 for(const [id,schemes] of Object.entries(api.RX_PRESENTATIONS))for(const s of schemes){
  const source=api.CLINICAL_SOURCES[s.sourceId];assert.ok(source.url.startsWith('https://'));assert.ok(source.title&&source.year&&source.reviewedAt);
  assert.match(s.dose,/\d/);assert.ok(s.route&&s.limit&&s.duration&&s.indications.length);
  if(s.validation!=='validated'){assert.throws(()=>api.getPrescription(id,{...valid('diclofenaco','K50-8h'),presentation:s.code}));continue;}
  const data={...valid(id,s.code),quantity:String(s.unitsPerDay*5)};
  let copied;const preview=api.getPrescription(id,data).text;await api.copyMedicinePrescription(id,data,text=>{copied=text;});assert.equal(copied,preview);
  for(const text of [s.limit,s.cautions,s.instruction.replaceAll('{days}','5')])assert.ok(copied.includes(text));
  assert.match(copied,/Via: ORAL\n\nMedicamento:/);assert.match(copied,/Quantidade a dispensar:/);assert.doesNotMatch(copied,/-{5,}|undefined|\{days\}/);
 }
});
test('apresentação controla dose e quantidade sem importar instruções de outro produto',()=>{
 const a=api.getPrescription('diclofenaco',valid('diclofenaco','K50-8h')).text;
 const b=api.getPrescription('diclofenaco',{...valid('diclofenaco','K50-12h'),quantity:'10'}).text;
 assert.match(a,/8 horas/);assert.match(b,/12 horas/);assert.match(b,/10 comprimidos/);assert.notEqual(a,b);
 const im=api.RX_PRESENTATIONS.cetoprofeno.find(s=>s.code==='IM100');const iv=api.RX_PRESENTATIONS.cetoprofeno.find(s=>s.code==='IV100');assert.equal(im.route,'INTRAMUSCULAR');assert.equal(iv.route,'INTRAVENOSA');assert.match(iv.dose,/20 minutos/);
});
test('patologia pediátrica não copia receitas adultas, nem com objeto forjado',()=>{
 const p=api.PATHOLOGIES.find(p=>p.id==='pac-pediatrica');assert.equal(p.population,'pediatric');
 assert.throws(()=>api.pathologyPrescription(p,valid('diclofenaco','K50-8h')),/bloqueada/);
 assert.throws(()=>api.pathologyPrescription({...p,protocolValidated:true,population:'adult'}),/bloqueada/);
 for(const p of api.PATHOLOGIES)assert.throws(()=>api.pathologyPrescription(p));
});
test('etambutol faz parte da fase intensiva RHZE, nunca segunda linha automática',()=>{
 const tb=api.PATHOLOGIES.find(p=>p.id==='tuberculose');assert.ok(tb.treatment.firstLine.includes('etambutol'));assert.equal(tb.treatment.secondLine.length,0);assert.ok(tb.treatment.phases[0].medicationIds.includes('etambutol'));assert.equal(tb.treatment.phases[0].months,2);
 for(const p of api.PATHOLOGIES.filter(p=>p.id!=='tuberculose')){assert.equal(p.treatment.firstLine.length,0);assert.equal(p.treatment.secondLine.length,0);}
});
test('prontuário não inventa condutas realizadas',()=>{
 const soap=api.pathologySoap(api.PATHOLOGIES[0]);assert.match(soap,/MODELO EM BRANCO/);assert.match(soap,/\[não registrado\]/);assert.doesNotMatch(soap,/Orientado retorno|Realizado exame|Paciente orientado/i);
});
test('catálogo não tem corte numérico nem rotulagem automática RENAME; artefatos concordam',()=>{
 const source=fs.readFileSync('web/index.html','utf8');assert.doesNotMatch(source,/injectablePattern|topicalPattern|RX_DASH|MEDICINES.length>=322|NEW_RENAME_MEDICINES.length===122|322 medicamentos auditados|Medicamento essencial RENAME/);
 assert.match(source,/copyMedicinePrescription\(m.id,views\(m.id\),copyText\)/);
 for(const script of [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)])new vm.Script(script[1]);
 const build=fs.readFileSync('dist/server/index.js','utf8');assert.ok(build.includes(JSON.stringify(source).slice(1,-1)));
});
