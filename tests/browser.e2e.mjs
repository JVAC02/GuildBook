import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import assert from 'node:assert/strict';import {chromium} from 'playwright';
const root=process.cwd();fs.mkdirSync('test-results',{recursive:true});
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),file=u.pathname==='/standalone'?path.join(root,'GuildBook-v6-Site.html'):path.join(root,'web',u.pathname==='/'?'index.html':u.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('content-type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
 browser=await chromium.launch();
 for(const variant of ['web','standalone'])for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},permissions:['clipboard-read','clipboard-write'],reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+(variant==='standalone'?'/standalone':'/')+'#revenues');
  assert.equal(await page.locator('#cards article').count(),322);
  assert.equal(await page.locator('#mobile-nav').isVisible(),width<768);assert.equal(await page.locator('#desktop-nav').isVisible(),width>=768);
  await page.locator('#search').fill('dipirona');assert.equal(await page.locator('#cards h3').first().textContent(),'Dipirona');
  assert.equal(await page.locator('.copy:not([disabled])').count(),0);
  for(const query of ['Alteplase','Cisatracúrio','Insulina glargina']){await page.locator('#search').fill(query);assert.equal(await page.locator('.copy:not([disabled])').count(),0);assert.doesNotMatch(await page.locator('#cards').innerText(),/Tomar 01 comprimido/);}
  await page.locator('#search').fill('diclofenaco');const card=page.locator('[data-id="diclofenaco"]');
  assert.equal(await card.locator('.copy').isDisabled(),true);
  await card.locator('[data-presentation="K50-8h"]').click();
  await card.locator('[data-rx-field="indication"]').selectOption({index:1});await card.locator('[data-rx-field="adultAge"]').fill('35');await card.locator('[data-rx-field="days"]').fill('5');await card.locator('[data-rx-field="quantity"]').fill('14');await card.locator('[data-rx-field="screened"]').check();assert.equal(await card.locator('.copy').isDisabled(),true);
  await card.locator('[data-rx-field="quantity"]').fill('15');assert.equal(await card.locator('.copy').isEnabled(),true);
  // Windows native clipboard converts LF to CRLF. Preserve every other character and blank line.
  const preview=await card.locator('.rx').textContent();await card.locator('.copy').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.equal(copied.replaceAll('\r\n','\n'),preview);assert.match(preview,/Limite:.*150 mg\/dia/);assert.match(preview,/Cuidados:/);
  await page.screenshot({path:`test-results/${variant}-${width}-rx.png`,fullPage:true});
  const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,header:getComputedStyle(document.querySelector('.internal-header')).position,bottom:document.querySelector('.copy').getBoundingClientRect().bottom,nav:document.querySelector('#mobile-nav').getBoundingClientRect().top}));assert.equal(geometry.overflow,false);assert.notEqual(geometry.header,'sticky');if(width<768)assert.ok(geometry.bottom<=geometry.nav,'copy button covered by navigation');
  await card.locator('[data-mode="pediatric"]').click();assert.equal(await card.locator('.copy').isDisabled(),true);await card.locator('[data-mode="adult"]').click();
  await card.locator('[data-presentation="Na-IM"]').click();assert.equal(await card.locator('.copy').isDisabled(),true);assert.match(await card.locator('.adult-panel').innerText(),/INTRAMUSCULAR/);
  await card.locator('[data-presentation="K50-12h"]').click();assert.equal(await card.locator('[data-rx-field="quantity"]').inputValue(),'');assert.equal(await card.locator('.copy').isDisabled(),true);
  await card.locator('[data-rx-field="indication"]').selectOption({index:1});await card.locator('[data-rx-field="days"]').fill('5');await card.locator('[data-rx-field="quantity"]').fill('10');await card.locator('[data-rx-field="screened"]').check();assert.match(await card.locator('.rx').textContent(),/12 horas/);
  await page.locator('#search').fill('cetoprofeno');await page.locator('[data-presentation="IV100"]').click();assert.match(await page.locator('.adult-panel').innerText(),/INTRAVENOSA/);assert.equal(await page.locator('.copy').isDisabled(),true);
  const nav=width<768?'#mobile-nav':'#desktop-nav';await page.locator(`${nav} a[href="#pathologies"]`).click();await page.locator('#pathology-search').fill('pediátrica');assert.equal(await page.locator('[data-copy-pathology="prescription"]').count(),0);assert.match(await page.locator('#pathology-cards').innerText(),/doses adultas/);
  await page.locator('[data-copy-pathology="soap"]').first().click();assert.match(await page.evaluate(()=>navigator.clipboard.readText()),/MODELO EM BRANCO/);
  await page.locator('#pathology-search').fill('tuberculose');assert.match(await page.locator('#pathology-cards').innerText(),/não é segunda linha/);
  await page.screenshot({path:`test-results/${variant}-${width}-tb.png`,fullPage:true});
  await page.locator(`${nav} a[href="#revenues"]`).click();await page.waitForFunction(()=>document.querySelector('#desktop-nav a[aria-current="page"][href="#revenues"]'));
  await page.locator('#search').fill('diclofenaco');
  assert.equal(await card.locator('[data-mode="adult"]').getAttribute('aria-pressed'),'true');
  const adultPreview=await card.locator('.rx').textContent();
  await page.locator(`${nav} a[href="#dosages"]`).click();await page.waitForFunction(()=>document.querySelector('#desktop-nav a[aria-current="page"][href="#dosages"]'));
  await page.locator('#search').fill('dipirona');
  const dip=page.locator('[data-id="dipirona"]');
  assert.equal(await dip.locator('[data-mode="pediatric"]').getAttribute('aria-pressed'),'true');
  await dip.locator('[data-presentation="historical-pediatric"]').click();
  await dip.locator('.age').fill('60');
  await page.locator('#global-weight').fill('20');
  await dip.locator('[data-rx-field="quantity"]').fill('1');
  assert.match(await dip.locator('.dose-result').textContent(),/200.*4 mL/);
  const pendingPreview=await dip.locator('.rx').textContent();
  assert.match(pendingPreview,/EM REVISÃO CLÍNICA/);
  await page.evaluate(()=>navigator.clipboard.writeText('sentinela'));
  page.once('dialog',dialog=>dialog.dismiss());await dip.locator('.copy').click();
  assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'sentinela');
  page.once('dialog',dialog=>{assert.match(dialog.message(),/Conteúdo em revisão clínica/);return dialog.accept();});
  await dip.locator('.copy').click();
  assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replaceAll('\r\n','\n'),pendingPreview);
  await page.locator('#search').fill('oseltamivir');
  const oselt=page.locator('[data-id="oseltamivir"]');
  await oselt.locator('[data-presentation="historical-pediatric"]').click();
  await oselt.locator('.age').fill('60');await page.locator('#global-weight').fill('25');
  await oselt.locator('[data-rx-field="quantity"]').fill('1');assert.equal(await oselt.locator('.copy').isDisabled(),true);
  assert.match(await oselt.locator('.quantity-help').textContent(),/20 cápsulas/);
  await oselt.locator('[data-rx-field="quantity"]').fill('20');assert.equal(await oselt.locator('.copy').isEnabled(),true);
  await page.locator(`${nav} a[href="#revenues"]`).click();await page.waitForFunction(()=>document.querySelector('#desktop-nav a[aria-current="page"][href="#revenues"]'));
  assert.equal(await page.locator('#search').inputValue(),'diclofenaco');
  assert.equal(await card.locator('[data-mode="adult"]').getAttribute('aria-pressed'),'true');
  assert.equal(await card.locator('.rx').textContent(),adultPreview);
  await page.locator('#search').fill('cetoprofeno');
  const ceto=page.locator('[data-id="cetoprofeno"]');
  await ceto.locator('[data-presentation="Caps50-8h"]').click();
  await ceto.locator('[data-rx-field="indication"]').selectOption({index:1});
  await ceto.locator('[data-rx-field="adultAge"]').fill('35');
  await ceto.locator('[data-rx-field="days"]').fill('5');
  await ceto.locator('[data-rx-field="screened"]').check();
  for(const q of ['16','20','23','25','15.5','0','-1']){
   await ceto.locator('[data-rx-field="quantity"]').fill(q);assert.equal(await ceto.locator('.copy').isDisabled(),true);
  }
  await ceto.locator('[data-rx-field="quantity"]').fill('15');assert.equal(await ceto.locator('.copy').isEnabled(),true);
  await ceto.locator('[data-rx-field="quantityMode"]').selectOption('pack');
  assert.equal(await ceto.locator('.copy').isDisabled(),true);
  await ceto.locator('[data-rx-field="quantity"]').fill('24');assert.equal(await ceto.locator('.copy').isEnabled(),true);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${variant} ${width}px: busca, bloqueios, seleção, quantidade, clipboard, pediatria, TB, navegação e geometria`);await context.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
