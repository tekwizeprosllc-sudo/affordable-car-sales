const l=require('lucide-react');
const {execSync}=require('child_process');
const fs=require('fs');
const files=execSync("find app components -name '*.jsx'").toString().trim().split('\n');
let bad=0;
for(const f of files){
  const src=fs.readFileSync(f,'utf8');
  const m=src.match(/import\s*\{([^}]+)\}\s*from\s*'lucide-react'/);
  if(!m) continue;
  for(let n of m[1].split(',').map(s=>s.trim()).filter(Boolean)){
    const name=n.split(/\s+as\s+/)[0].trim();
    if(!(name in l)){ console.log('MISSING', name, '<-', f); bad++; }
  }
}
console.log(bad? bad+' missing':'all lucide imports valid ✓');
