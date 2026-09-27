import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync('GuildBook-v6-Site.html','utf8');
test('standalone não exige recursos externos e inclui o mesmo bloco clínico',()=>{
 assert.doesNotMatch(html,/<(?:script|link|img)\b[^>]*(?:src|href)="https?:/i);assert.doesNotMatch(html,/(?:src|href)="\.\//i);assert.match(html,/data:image\/svg\+xml;base64,/);
 const source=fs.readFileSync('web/index.html','utf8');const clinical=s=>s.slice(s.indexOf("'use strict';"),s.indexOf('const FILTERS='));assert.equal(clinical(html),clinical(source));
 const ctx={};vm.createContext(ctx);vm.runInContext(clinical(html)+';globalThis.result=clinicalCounts();',ctx);assert.equal(ctx.result.enabled,2);assert.ok(ctx.result.reviewPending>0);assert.equal(ctx.result.blocked,ctx.result.incomplete+ctx.result.highRisk);
 assert.match(html,/Versão 6\.3\.1/);assert.doesNotMatch(html,/----------------------------/);
});
