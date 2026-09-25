// ASSETS is embedded by scripts/build.mjs; no source files are served publicly.
const GUILDBOOK_VERSION='6.1';
const htmlEscape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJson=x=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const privateHeaders={'cache-control':'private, no-store, max-age=0','vary':'Cookie','x-content-type-options':'nosniff','referrer-policy':'same-origin'};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...privateHeaders,'content-type':'application/json; charset=utf-8'}});}
function html(body,status=200){return new Response(body,{status,headers:{...privateHeaders,'content-type':'text/html; charset=utf-8'}});}
function notice(title,body,signIn=false,status=200){return html(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)} · GuildBook</title><link rel="icon" href="/favicon.svg"><style>:root{font-family:system-ui,sans-serif;color:#173744;background:#f4f9fa}*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px}main{width:min(100%,460px);padding:36px;background:#fff;border:1px solid #d9e7e6;border-radius:24px;box-shadow:0 22px 60px #1737440f}img{width:64px;height:64px}h1{font-size:27px;letter-spacing:-.04em}p{font-size:16px;line-height:1.6;color:#5a727d}.action{display:block;margin-top:24px;padding:15px;text-align:center;text-decoration:none;border-radius:12px;background:#137c77;color:white;font-weight:700}.secondary{display:block;margin-top:18px;text-align:center;color:#137c77;font-size:14px}.small{font-size:13px}</style></head><body><main><img src="/favicon.svg" alt="GuildBook"><h1>${htmlEscape(title)}</h1><p>${htmlEscape(body)}</p>${signIn?'<a class="action" target="_top" href="/signin-with-chatgpt?return_to=%2F">Entrar com ChatGPT</a><p class="small">Não é necessário convite. Use sua própria conta ChatGPT.</p>':'<a class="action" href="/">Tentar novamente</a><a class="secondary" target="_top" href="/signout-with-chatgpt?return_to=%2F">Sair ou trocar de conta</a>'}</main></body></html>`,status);}
function identity(request){
  const id=request.headers.get('oai-authenticated-user-id');
  const email=request.headers.get('oai-authenticated-user-email');
  if(!id||!email||id.length>512||email.length>320)return null;
  let name=email;
  if(request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){
    try{name=decodeURIComponent(request.headers.get('oai-authenticated-user-full-name')||email)}catch{}
  }
  return {id,email:email.trim().toLowerCase(),name:name.slice(0,200)};
}
async function access(db,user,ownerEmail){
  // Only the deployment-configured owner's trusted identity can bootstrap ownership.
  if(user.email===ownerEmail){await db.prepare("INSERT OR IGNORE INTO site_owner (key,user_id) VALUES ('owner',?)").bind(user.id).run();}
  const owner=await db.prepare("SELECT user_id FROM site_owner WHERE key='owner'").first();
  let member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(user.id).first();
  const now=new Date().toISOString();
  if(!member){
    await db.prepare('INSERT OR IGNORE INTO members (user_id,email,name,blocked,created_at,last_seen) VALUES (?,?,?,0,?,?)').bind(user.id,user.email,user.name,now,now).run();
    member=await db.prepare('SELECT * FROM members WHERE user_id=?').bind(user.id).first();
  }else if(!member.blocked&&(Date.now()-Date.parse(member.last_seen)>60000||member.email!==user.email||member.name!==user.name)){
    await db.prepare('UPDATE members SET email=?,name=?,last_seen=? WHERE user_id=?').bind(user.email,user.name,now,user.id).run();
  }
  if(!member)throw new Error('Member registration unavailable');
  return {blocked:!!member.blocked,owner:owner?.user_id===user.id,ownerId:owner?.user_id};
}
function renderedApp(file,session){return html(ASSETS[file].body.replace('</head>',`<script>window.GUILDBOOK_SESSION=${safeJson(session)};</script></head>`));}
async function admin(request,url,db,user,permissions){
  if(!permissions.owner)return json({error:'Apenas o proprietário pode gerenciar usuários.'},403);
  if(url.pathname==='/admin'&&request.method==='GET')return renderedApp('admin.html',{...user,owner:true});
  if(url.pathname==='/api/admin/users'&&request.method==='GET'){
    const search=(url.searchParams.get('search')||'').slice(0,200),page=Math.max(0,Math.min(10000,Number.parseInt(url.searchParams.get('page')||'0',10)||0));
    const pattern='%'+search+'%';
    const result=await db.prepare('SELECT user_id,email,name,blocked,created_at,last_seen FROM members WHERE email LIKE ? OR name LIKE ? ORDER BY created_at DESC,user_id LIMIT 50 OFFSET ?').bind(pattern,pattern,page*50).all();
    const count=await db.prepare('SELECT COUNT(*) AS total FROM members WHERE email LIKE ? OR name LIKE ?').bind(pattern,pattern).first();
    return json({users:result.results,total:count.total,page,ownerId:permissions.ownerId});
  }
  if(url.pathname==='/api/admin/users/access'&&request.method==='POST'){
    if(request.headers.get('origin')!==url.origin)return json({error:'Origem da solicitação inválida.'},403);
    if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato inválido.'},415);
    const raw=await request.text();if(raw.length>4096)return json({error:'Solicitação muito grande.'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'Solicitação inválida.'},400)}
    if(typeof body.userId!=='string'||body.userId.length>512||typeof body.blocked!=='boolean')return json({error:'Dados inválidos.'},400);
    if(body.userId===permissions.ownerId)return json({error:'O acesso do proprietário não pode ser bloqueado.'},400);
    const target=await db.prepare('SELECT user_id FROM members WHERE user_id=?').bind(body.userId).first();
    if(!target)return json({error:'Usuário não encontrado.'},404);
    await db.batch([
      db.prepare('UPDATE members SET blocked=? WHERE user_id=?').bind(body.blocked?1:0,body.userId),
      db.prepare('INSERT INTO access_audit (actor,target,action,created_at) VALUES (?,?,?,?)').bind(user.id,body.userId,body.blocked?'block':'unblock',new Date().toISOString())
    ]);
    return json({ok:true,userId:body.userId,blocked:body.blocked});
  }
  return json({error:'Rota não encontrada.'},404);
}
export default {async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  const publicAssets={'/favicon.svg':'image/svg+xml','/manifest.webmanifest':'application/manifest+json','/icon-192.png':'image/png','/icon-512.png':'image/png','/apple-touch-icon.png':'image/png'};
  if(publicAssets[path]&&['GET','HEAD'].includes(request.method)){
    const a=ASSETS[path.slice(1)],body=a.binary?Uint8Array.from(atob(a.body),c=>c.charCodeAt(0)):a.body;
    return new Response(request.method==='HEAD'?null:body,{headers:{'content-type':publicAssets[path],'cache-control':'public, max-age=3600','x-content-type-options':'nosniff'}});
  }
  if(path==='/access-blocked')return notice('Acesso bloqueado','O proprietário desativou o acesso desta conta ao GuildBook. Entre em contato com ele para solicitar a reativação.',false,403);
  const user=identity(request);
  if(!user)return path.startsWith('/api/')?json({error:'Entre com sua conta ChatGPT.'},401):notice('Bem-vindo ao GuildBook','Medicamentos, dosagens e prescrições em um só lugar. Entre para continuar.',true);
  try{
    if(!env.DB||!env.GUILDBOOK_OWNER_EMAIL)throw new Error('Access storage or owner configuration missing');
    const permissions=await access(env.DB,user,env.GUILDBOOK_OWNER_EMAIL.trim().toLowerCase());
    if(permissions.blocked)return path.startsWith('/api/')?json({error:'Acesso bloqueado pelo proprietário.',code:'blocked'},403):notice('Acesso bloqueado','O proprietário desativou o acesso desta conta ao GuildBook.',false,403);
    if(path==='/admin'||path.startsWith('/api/admin/'))return await admin(request,url,env.DB,user,permissions);
    if(path==='/api/session'&&request.method==='GET')return json({user:{...user,owner:permissions.owner}});
    if((path==='/'||path==='/index.html')&&request.method==='GET')return renderedApp('index.html',{...user,owner:permissions.owner});
    return json({error:'Página não encontrada.'},404);
  }catch(error){
    console.error('GuildBook access failure',{path,message:String(error?.message||error)});
    return path.startsWith('/api/')?json({error:'Não foi possível validar o acesso. Tente novamente.'},503):notice('Acesso temporariamente indisponível','Não foi possível validar sua conta agora. Tente novamente em instantes.',false,503);
  }
}};
