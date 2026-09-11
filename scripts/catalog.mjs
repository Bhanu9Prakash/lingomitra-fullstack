import fs from 'node:fs/promises';
import path from 'node:path';
const source=[['de','German','german','de',135],['es','Spanish','spanish','es',460],['fr','French','french','fr',275],['hi','Hindi','hindi','hi',600],['zh','Chinese','chinese','zh',1300],['ja','Japanese','japanese','jp',126],['kn','Kannada','kannada','kn',45]];
const languages=[]; const lessons=[];
for(const [code,name,directory,flagCode,speakers] of source){
  languages.push({id:languages.length+1,code,name,flagCode,speakers,isAvailable:true});
  const root=path.join('server/courses',directory);
  const files=(await fs.readdir(root)).filter(x=>/^lesson\d+\.md$/.test(x)).sort();
  for(const file of files){
    const content=await fs.readFile(path.join(root,file),'utf8');
    const title=content.match(/^#{1,3}\s+(?:Lesson\s+\d+\s*:\s*)?(.+)$/m)?.[1]?.replace(/\*\*/g,'')||`${name} lesson ${parseInt(file.slice(6))}`;
    lessons.push({id:lessons.length+1,lessonId:`${code}-${file.slice(0,-3)}`,languageCode:code,title,content,orderIndex:parseInt(file.slice(6))});
  }
  if(!files.length)throw new Error(`Missing lessons for ${name}`);
}
await fs.mkdir('generated',{recursive:true});
await fs.writeFile('generated/catalog.json',JSON.stringify({languages,lessons}));
console.log(`Prepared ${lessons.length} lessons in ${languages.length} languages.`);
