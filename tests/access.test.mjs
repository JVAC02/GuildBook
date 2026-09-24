import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import worker from '../dist/server/index.js';
const origin='https://guildbook.example';
const owner={id:'owner-site-identity',email:'owner@example.com',name:'Proprietário'};
const visitor={id:'visitor-site-identity',email:'visitor@example.com',name:'Visitante'};
function database(){
 const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')))sql.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 const adapter={prepare(query){let values=[];return {bind(...v){values=v;return this},async first(){return sql.prepare(query).get(...values)||null},async all(){return {results:sql.prepare(query).all(...values)}},async run(){return sql.prepare(query).run(...values)}}},async batch(list){sql.exec('BEGIN');try{const results=[];for(const s of list)results.push(await s.run());sql.exec('COMMIT');return results}catch(e){sql.exec('ROLLBACK');throw e}}};
 return {env:{DB:adapter,GUILDBOOK_OWNER_EMAIL:owner.email},sql};
}
function req(path='/',user=null,options={}){const headers=new Headers(options.headers);if(user){headers.set('oai-authenticated-user-id',user.id);headers.set('oai-authenticated-user-email',user.email);headers.set('oai-authenticated-user-full-name',encodeURIComponent(user.name));headers.set('oai-authenticated-user-full-name-encoding','percent-encoded-utf-8')}return new Request(origin+path,{...options,headers})}
function mutation(userId,blocked,from=origin){return {method:'POST',headers:{origin:from,'content-type':'application/json'},body:JSON.stringify({userId,blocked})}}
test('anonymous viewers receive top-level ChatGPT sign-in, never the clinical source',async()=>{
 const {env}=database();for(const path of ['/','/index.html','/admin','/web/index.html']){const r=await worker.fetch(req(path),env);const body=await r.text();assert.match(body,/Entrar com ChatGPT/);assert.match(body,/target="_top"/);assert.doesNotMatch(body,/const MEDICINES/)}
 assert.equal((await worker.fetch(req('/api/session'),env)).status,401);
});
test('a new ChatGPT user enters without invitation but cannot administer or claim ownership',async()=>{
 const {env,sql}=database();const r=await worker.fetch(req('/',visitor),env);assert.equal(r.status,200);assert.match(await r.text(),/const MEDICINES/);assert.match(r.headers.get('cache-control'),/no-store/);
 assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM members').get().n,1);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM site_owner').get().n,0);
 for(const path of ['/admin','/api/admin/users','/api/admin/users?owner=true'])assert.equal((await worker.fetch(req(path,visitor),env)).status,403);
 assert.equal((await worker.fetch(req('/api/admin/users/access',visitor,mutation(visitor.id,false)),env)).status,403);
});
test('owner can list, block across devices, reactivate and audit access; self-block is refused',async()=>{
 const {env,sql}=database();await worker.fetch(req('/',visitor),env);await worker.fetch(req('/',owner),env);
 assert.equal((await worker.fetch(req('/admin',owner),env)).status,200);
 const listed=await (await worker.fetch(req('/api/admin/users',owner),env)).json();assert.equal(listed.total,2);assert.equal(listed.ownerId,owner.id);
 assert.equal((await worker.fetch(req('/api/admin/users/access',owner,mutation(owner.id,true)),env)).status,400);
 assert.equal((await worker.fetch(req('/api/admin/users/access',owner,mutation(visitor.id,true)),env)).status,200);
 for(const ua of ['Mobile Safari','Desktop Chrome']){const r=await worker.fetch(req('/',visitor,{headers:{'user-agent':ua}}),env);assert.equal(r.status,403);assert.doesNotMatch(await r.text(),/const MEDICINES/)}
 assert.equal((await worker.fetch(req('/api/session',visitor),env)).status,403);
 assert.equal((await worker.fetch(req('/api/admin/users/access',owner,mutation(visitor.id,false)),env)).status,200);
 assert.equal((await worker.fetch(req('/',visitor),env)).status,200);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM access_audit').get().n,2);
});
test('cross-origin mutations and malformed bodies are rejected without changing access',async()=>{
 const {env,sql}=database();await worker.fetch(req('/',owner),env);await worker.fetch(req('/',visitor),env);
 assert.equal((await worker.fetch(req('/api/admin/users/access',owner,mutation(visitor.id,true,'https://evil.example')),env)).status,403);
 assert.equal((await worker.fetch(req('/api/admin/users/access',owner,{method:'POST',headers:{origin,'content-type':'application/json'},body:'not JSON'}),env)).status,400);
 assert.equal(sql.prepare('SELECT blocked FROM members WHERE user_id=?').get(visitor.id).blocked,0);
});
test('persistent block survives handler requests and registration cannot clear it',async()=>{
 const {env}=database();await worker.fetch(req('/',owner),env);await worker.fetch(req('/',visitor),env);await worker.fetch(req('/api/admin/users/access',owner,mutation(visitor.id,true)),env);
 for(let i=0;i<3;i++)assert.equal((await worker.fetch(req('/',{...visitor,name:'Changed name'}),env)).status,403);
});
test('identity data is escaped and storage failures fail closed',async()=>{
 const {env}=database();const r=await worker.fetch(req('/',{...visitor,name:'</script><script>alert(77)</script>'}),env);const body=await r.text();assert.doesNotMatch(body,/<script>alert\(77\)<\/script>/);assert.match(body,/\\u003c\/script>/);
 const fail=await worker.fetch(req('/',visitor),{GUILDBOOK_OWNER_EMAIL:owner.email});assert.equal(fail.status,503);assert.doesNotMatch(await fail.text(),/const MEDICINES/);
});
test('only branding assets are public and application source paths are not exposed',async()=>{
 const {env}=database();assert.equal((await worker.fetch(req('/favicon.svg'),env)).status,200);
 assert.equal((await worker.fetch(req('/dist/index.html',visitor),env)).status,404);
 assert.equal((await worker.fetch(req('/worker/index.js',visitor),env)).status,404);
});
