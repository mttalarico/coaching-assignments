import {validate} from './model.js';
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export class Conflict extends Error {}
// Three-way merge: independent edits survive; conflicting edits never silently overwrite.
export function mergeBoards(base, proposed, current) {
  validate(base); validate(proposed); validate(current);
  // Older boards have no reactions field; normalize so the first concurrent votes merge.
  [base, proposed, current] = [base, proposed, current].map(board => {
    const copy = structuredClone(board);
    for (const scenario of copy.scenarios) scenario.reactions ??= [];
    return copy;
  });
  function merge(a,b,c,path='board') {
    if(equal(a,b))return structuredClone(c);
    if(equal(a,c)||equal(b,c))return structuredClone(b);
    if(/\.placements\.[^.]+$/.test(path))throw new Conflict('Someone changed this assignment. Your draft is available to export; retry on the latest board.');
    if(Array.isArray(a)&&Array.isArray(b)&&Array.isArray(c)) {
      if([...a,...b,...c].every(x=>x&&typeof x.id==='string')) {
        const am=new Map(a.map(x=>[x.id,x])),bm=new Map(b.map(x=>[x.id,x])),cm=new Map(c.map(x=>[x.id,x]));
        return [...new Set([...c,...b].map(x=>x.id))].map(id=>merge(am.get(id),bm.get(id),cm.get(id),path+'.'+id)).filter(x=>x!==undefined);
      }
      if(path.endsWith('.events')||path.endsWith('.notes')) {
        const has=(arr,x)=>arr.some(y=>equal(x,y));
        if(a.every(x=>has(b,x)&&has(c,x)))return [...c,...b.filter(x=>!has(c,x))].sort((x,y)=>Date.parse(y.date)-Date.parse(x.date));
      }
    }
    if(a&&b&&c&&![a,b,c].some(Array.isArray)&&[a,b,c].every(x=>typeof x==='object')) {
      const result={};
      for(const key of new Set([...Object.keys(a),...Object.keys(b),...Object.keys(c)])) {
        if(['__proto__','constructor','prototype'].includes(key))throw new Conflict('Invalid board key');
        const value=merge(a[key],b[key],c[key],path+'.'+key);if(value!==undefined)result[key]=value;
      }
      return result;
    }
    throw new Conflict('Someone changed the same item. Your draft is available to export; retry on the latest board.');
  }
  try{return validate(merge(base,proposed,current));}catch(e){if(e instanceof Conflict)throw e;throw new Conflict('These changes conflict with the latest assignments. Your draft is available to export.');}
}
