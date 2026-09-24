import fs from 'node:fs';
import path from 'node:path';
const files=['index.html','admin.html','favicon.svg','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
const assets={};
for(const file of files){const binary=file.endsWith('.png');assets[file]={body:fs.readFileSync(path.join('web',file),binary?'base64':'utf8'),binary};}
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/server',{recursive:true});fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const ASSETS = '+JSON.stringify(assets)+';\n'+fs.readFileSync('worker/index.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('GuildBook Worker built; clinical content is served only after authentication and access checks.');
