import {readdir,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const files=[];
async function collect(dir=''){for(const entry of await readdir(join('public',dir),{withFileTypes:true})){if(entry.name.startsWith('.'))continue;const path=join(dir,entry.name);if(entry.isDirectory())await collect(path);else files.push(path);}}
await collect();files.sort();const hash=createHash('sha256');
for(const file of files){hash.update(file);hash.update(await readFile(join('public',file)));}
const version=hash.digest('hex').slice(0,16);
await rm('dist',{recursive:true,force:true});
for(const file of files){let content=await readFile(join('public',file));
 if(file.endsWith('.js')&&!file.startsWith('vendor/'))content=Buffer.from(content.toString().replace(/(from\s+['"])(\.\/[^'"?]+\.js)(['"])/g,`$1$2?v=${version}$3`));
 if(file==='index.html')content=Buffer.from(content.toString().replace(/((?:src|href)=")((?:app\.js|style\.css|vendor\/peerjs\.min\.js))"/g,`$1$2?v=${version}"`).replace('<html lang="en">',`<html lang="en" data-build="${version}">`));
 await mkdir(join('dist',file,'..'),{recursive:true});await writeFile(join('dist',file),content);
}
console.log(`Built ${files.length} files with cache version ${version}`);
