import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function load(){
 const html=fs.readFileSync('web/index.html','utf8'),ctx={};vm.createContext(ctx);
 vm.runInContext(html.slice(html.indexOf("'use strict';"),html.indexOf('const FILTERS='))+
 ';globalThis.api={MEDICINES,RX_PRESENTATIONS,getPrescription,copyMedicinePrescription,clinicalCounts,'+
 'quantityOptions:typeof quantityOptions==="function"?quantityOptions:null,'+
 'validateQuantity:typeof validateQuantity==="function"?validateQuantity:null,'+
 'getClinicalState:typeof getClinicalState==="function"?getClinicalState:null,'+
 'calcPediatric:typeof calcPediatric==="function"?calcPediatric:null};',ctx);
 return ctx.api;
}
const api=load();
const adult={mode:'adult',presentation:'historical-adult',adultAge:'35',careContext:'ambulatory',quantity:'20'};
test('quantidade exata e embalagem fechada recusam intermediários, decimais e inválidos',()=>{
 assert.equal(typeof api.quantityOptions,'function');
 assert.deepEqual(JSON.parse(JSON.stringify(api.quantityOptions(15,24))),{requiredQuantity:15,packQuantity:24});
 assert.equal(api.validateQuantity(15,24,'required',15),true);
 assert.equal(api.validateQuantity(15,24,'pack',24),true);
 for(const q of [16,20,23,25,15.5,0,-1,NaN,Infinity]){
  assert.equal(api.validateQuantity(15,24,'required',q),false);
  assert.equal(api.validateQuantity(15,24,'pack',q),false);
 }
 assert.equal(api.validateQuantity(15,24,'pack',15),false);
 assert.equal(api.validateQuantity(15,24,'required',24),false);
 assert.equal(api.validateQuantity(15,null,'pack',24),false);
});
test('quatro estados distinguem conteúdo histórico, lacunas e alto risco',()=>{
 assert.equal(typeof api.getClinicalState,'function');
 assert.equal(api.getClinicalState('diclofenaco','K50-8h','adult'),'VALIDATED');
 assert.equal(api.getClinicalState('dipirona','historical-adult','adult'),'REVIEW_PENDING');
 assert.equal(api.getClinicalState('naproxeno','','adult'),'INCOMPLETE');
 assert.equal(api.getClinicalState('cisatracurio','','adult'),'HIGH_RISK');
});
test('revisão gera prévia identificada e só copia após confirmação explícita do mesmo conteúdo',async()=>{
 const preview=api.getPrescription('dipirona',adult);
 assert.equal(preview.status,'REVIEW_PENDING');assert.match(preview.text,/EM REVISÃO CLÍNICA/);
 assert.match(preview.text,/Máximo: 4 g\/dia/);
 let copied='';
 await assert.rejects(api.copyMedicinePrescription('dipirona',adult,t=>{copied=t;}),/confirmação/i);
 assert.equal(copied,'');
 await api.copyMedicinePrescription('dipirona',adult,t=>{copied=t;},async()=>true);
 assert.equal(copied,preview.text);
 await assert.rejects(api.copyMedicinePrescription('dipirona',adult,()=>assert.fail('cópia cancelada'),async()=>false),/cancelada/i);
 assert.equal(api.getPrescription('dipirona',adult).status,'REVIEW_PENDING');
});
test('alto risco e incompleto não são liberados nem com confirmação',async()=>{
 for(const id of ['cisatracurio','alteplase','insulina-glargina','naproxeno'])
  await assert.rejects(api.copyMedicinePrescription(id,adult,()=>assert.fail('não copiar'),async()=>true));
});
test('pediatria usa exclusivamente dose e concentração pediátricas explícitas',()=>{
 const m=api.MEDICINES.find(m=>m.id==='dipirona');
 assert.equal(typeof api.calcPediatric,'function');
 const result=api.calcPediatric(m,{age:'60',weight:'20'});
 assert.equal(result.ml,4);assert.match(result.display,/200/);
 const input={mode:'pediatric',presentation:'historical-pediatric',age:'60',weight:'20',quantity:'1',careContext:'ambulatory'};
 const rx=api.getPrescription('dipirona',input);
 assert.match(rx.text,/50 mg\/mL/);assert.match(rx.text,/4 mL/);
 assert.doesNotMatch(rx.text,/500 mg, comprimidos/);
 assert.throws(()=>api.getPrescription('dipirona',{...input,presentation:'historical-adult'}));
 assert.throws(()=>api.getPrescription('dipirona',{...input,age:'1'}));
 assert.throws(()=>api.getPrescription('dipirona',{...input,weight:''}));
 assert.throws(()=>api.getPrescription('nitrofurantoina',{...input}));
});
test('lacunas e placeholders no esquema em revisão impedem geração, sem alterar o histórico',()=>{
 const isolated=load(),s=isolated.RX_PRESENTATIONS.dipirona.find(s=>s.code==='historical-adult');
 for(const [key,value] of [['route',''],['presentation',''],['dose','dose conforme indicação'],['instruction','Tomar conforme protocolo']]){
  const before=s[key];s[key]=value;assert.throws(()=>isolated.getPrescription('dipirona',adult));s[key]=before;
 }
});
test('confirmação é transitória e não autoriza texto modificado durante o diálogo',async()=>{
 const input={...adult};let writes=0;
 await assert.rejects(api.copyMedicinePrescription('dipirona',input,()=>writes++,async()=>{input.quantity='21';return true;}),/alterado/i);
 assert.equal(writes,0);
});
test('esquemas assistenciais não são exportados como receita domiciliar',()=>{
 const s=api.RX_PRESENTATIONS.salbutamol.find(s=>s.population==='adult');
 assert.throws(()=>api.getPrescription('salbutamol',{...adult,presentation:s.code}),/Contexto/);
 const rx=api.getPrescription('salbutamol',{...adult,presentation:s.code,careContext:'urgent'});
 assert.match(rx.text,/Urgência/);assert.match(rx.text,/20 minutos/);
});
test('limite por dose pediátrico também é respeitado após arredondamento',()=>{
 const isolated=load(),m=isolated.MEDICINES.find(m=>m.id==='paracetamol');
 // 33.4 kg * 15 = 501 mg, 32 mg/mL; volume rounding must not exceed 501 mg.
 const result=isolated.calcPediatric(m,{age:'120',weight:'33.4'});
 assert.equal(result.ml,15.6);assert.ok(result.ml*32<=501);
 const old=m.pediatric.concentration;delete m.pediatric.concentration;
 assert.ok(isolated.calcPediatric(m,{age:'60',weight:'20'}).error);m.pediatric.concentration=old;
});
test('algoritmo pediátrico genérico e preparação hospitalar não voltam como fallback',()=>{
 const isolated=load(),m=isolated.MEDICINES.find(m=>m.id==='dipirona');
 for(const kind of ['renameFixed','weightMg','epinephrine']){
  const forged={...m,pediatric:{...m.pediatric,kind,rx:'Dose pediátrica genérica'}};
  assert.ok(isolated.calcPediatric(forged,{age:'60',weight:'20'}).error);
 }
});
test('quantidades históricas calculáveis também são exatas, inclusive por peso pediátrico',()=>{
 const omep={...adult,quantity:'1'};
 assert.throws(()=>api.getPrescription('omeprazol',omep),/Quantidade/);
 assert.match(api.getPrescription('omeprazol',{...omep,quantity:'28'}).text,/28 cápsulas/);
 const ped={mode:'pediatric',presentation:'historical-pediatric',age:'60',weight:'25',quantity:'1'};
 assert.throws(()=>api.getPrescription('oseltamivir',ped),/Quantidade/);
 assert.match(api.getPrescription('oseltamivir',{...ped,quantity:'20'}).text,/20 cápsulas/);
 assert.throws(()=>api.getPrescription('oseltamivir',{...ped,weight:'15',quantity:'20'}),/Quantidade/);
 assert.match(api.getPrescription('oseltamivir',{...ped,weight:'15',quantity:'10'}).text,/10 cápsulas/);
 assert.throws(()=>api.getPrescription('omeprazol',{...ped,quantity:'1'}),/Quantidade/);
 assert.match(api.getPrescription('omeprazol',{...ped,quantity:'28'}).text,/28 comprimidos/);
});
test('calculadoras pediátricas históricas mantêm concentrações e limites de cada produto',()=>{
 for(const [id,ml] of [['dipirona',4],['paracetamol',9.3],['ibuprofeno',4],['amoxicilina',10],['amoxicilina-clavulanato',5.6],['azitromicina',5],['cefalexina',5],['prednisolona',6.6],['dexametasona',30],['metoclopramida',0.5],['cefuroxima',2.5],['sulfametoxazol-trimetoprima',10],['metronidazol',6]]){
  const result=api.calcPediatric(api.MEDICINES.find(m=>m.id===id),{age:'60',weight:'20'});
  assert.equal(result.ml,ml,id);assert.equal(result.status,'REVIEW_PENDING');
 }
});
