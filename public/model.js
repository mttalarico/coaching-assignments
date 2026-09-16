export const affiliates=[['iowa','AAA','Iowa','Cubs','#164c90'],['knoxville','AA','Knoxville','Smokies','#ba3544'],['south-bend','A+','South Bend','Cubs','#275caa'],['myrtle-beach','A','Myrtle Beach','Pelicans','#2496a4'],['arizona','AZL','Arizona','Cubs','#ad7045']];
export const uid=()=>crypto.randomUUID();
export function initial(){return {version:1,profiles:[{id:'matt',name:'Matt Talarico'}],roles:['Manager','Hitting Coach','Pitching Coach','Development Coach'],candidates:[],scenarios:[{id:'initial',name:'Initial plan',placements:{},notes:[],events:[]}]};}
export function move(state,scenario,id,aff,role,actor){if(!state.candidates.some(c=>c.id===id))throw Error('Candidate not found');if(aff!=='pool'&&(!affiliates.some(a=>a[0]===aff)||!state.roles.includes(role)))throw Error('Invalid position');const old=scenario.placements[id];scenario.placements[id]={aff,role:aff==='pool'?'':role,final:false};return `${state.candidates.find(c=>c.id===id).name}: ${old&&old.aff!=='pool'?old.aff+' / '+old.role:'candidate pool'} → ${aff==='pool'?'candidate pool':aff+' / '+role}`;}
export function choose(scenario,id){const p=scenario.placements[id];if(!p||p.aff==='pool')throw Error('Assign a position first');const value=!p.final;for(const q of Object.values(scenario.placements))if(q.aff===p.aff&&q.role===p.role)q.final=false;p.final=value;}
export function validate(s){const str=x=>typeof x==='string'&&x.length>0&&x.length<=500;const unique=a=>new Set(a).size===a.length;if(s?.version!==1||!Array.isArray(s.profiles)||!s.profiles.length||!Array.isArray(s.roles)||!s.roles.length||!s.roles.every(str)||!unique(s.roles)||!Array.isArray(s.candidates)||!Array.isArray(s.scenarios)||!s.scenarios.length)throw Error('Invalid board file');for(const list of [s.profiles,s.candidates,s.scenarios]){if(!list.every(x=>x&&str(x.id)&&str(x.name))||!unique(list.map(x=>x.id)))throw Error('Invalid names or duplicate IDs');}for(const c of s.candidates)if(typeof c.title!=='string')throw Error('Invalid candidate');for(const b of s.scenarios){if(!b.placements||typeof b.placements!=='object'||Array.isArray(b.placements)||!Array.isArray(b.events)||!Array.isArray(b.notes))throw Error('Invalid scenario');const finals=new Set();for(const [id,p]of Object.entries(b.placements)){if(!s.candidates.some(c=>c.id===id)||!p||typeof p.final!=='boolean'||!(p.aff==='pool'||affiliates.some(a=>a[0]===p.aff)&&s.roles.includes(p.role)))throw Error('Invalid assignment');if(p.final){const key=p.aff+'|'+p.role;if(p.aff==='pool'||finals.has(key))throw Error('Duplicate final selection');finals.add(key);}}for(const e of [...b.notes,...b.events])if(!str(e.actor)||typeof e.text!=='string'||typeof e.date!=='string'||!Number.isFinite(Date.parse(e.date)))throw Error('Invalid activity');}return s;}

// Apply this roster once, preserving any staffing work already saved locally.
export function addLastYearRoster(state) {
  const migration = 'last-year-roster-v1';
  if (state.appliedRosters?.includes(migration)) return false;
  for (const role of ['Manager', 'Bench Coach']) {
    if (!state.roles.includes(role)) state.roles.splice(role === 'Manager' ? 0 : state.roles.indexOf('Manager') + 1, 0, role);
  }
  const empty = state.candidates.length === 0 && state.scenarios.length === 1 && Object.keys(state.scenarios[0].placements).length === 0;
  const scenario = empty ? state.scenarios[0] : {id: uid(), placements: {}, notes: [], events: []};
  scenario.name = "Last year's roster";
  if (!empty) state.scenarios.push(scenario);
  const roster = [
    ['iowa', 'Peavey', 'Luvollo'],
    ['knoxville', 'Rymel', 'Davis'],
    ['south-bend', 'Wasinger', 'Anastacio'],
    ['myrtle-beach', 'Cuevas', 'DeAngelo'],
    ['arizona', 'Machado', 'Dennis'],
  ];
  for (const [aff, manager, bench] of roster) {
    for (const [name, title] of [[manager, 'Manager'], [bench, 'Bench Coach']]) {
      let candidate = state.candidates.find(c => c.name === name && c.title === title);
      if (!candidate) {
        candidate = {id: uid(), name, title};
        state.candidates.push(candidate);
      }
      scenario.placements[candidate.id] = {aff, role: title, final: false};
    }
  }
  scenario.events.unshift({actor: 'Roster setup', text: "added last year's managers and bench coaches as the starting roster", date: new Date().toISOString()});
  state.appliedRosters = [...(state.appliedRosters || []), migration];
  return true;
}
