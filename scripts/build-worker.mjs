import fs from 'node:fs/promises';
import { build } from 'esbuild';
await fs.mkdir('dist/server',{recursive:true});
// The SPA entry is embedded so deep links work without an application server.
const html=await fs.readFile('dist/client/index.html','utf8');
await build({entryPoints:['worker/index.ts'],outfile:'dist/server/index.js',bundle:true,platform:'browser',target:'es2022',format:'esm',minify:true,define:{__APP_HTML__:JSON.stringify(html)}});
await fs.mkdir('dist/.openai',{recursive:true});
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});
