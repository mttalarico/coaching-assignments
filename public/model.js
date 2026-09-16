export const affiliates=[['iowa','AAA','Iowa','Cubs','#164c90'],['knoxville','AA','Knoxville','Smokies','#ba3544'],['south-bend','A+','South Bend','Cubs','#275caa'],['myrtle-beach','A','Myrtle Beach','Pelicans','#2496a4'],['arizona','AZL','Arizona','Cubs','#ad7045'],['roving','STAFF','Roving Coaches','Across affiliates','#587c66','arizona'],['release','OPTIONS','Release','Under consideration','#a45e68','arizona']];
export const uid=()=>crypto.randomUUID();
export function initial(){return {version:1,profiles:[{id:'matt',name:'Matt Talarico'}],roles:['Manager','Hitting Coach','Pitching Coach','Development Coach'],candidates:[],scenarios:[{id:'initial',name:'Initial plan',placements:{},notes:[],events:[]}]};}
export function move(state,scenario,id,aff,role,actor){if(!state.candidates.some(c=>c.id===id))throw Error('Candidate not found');if(aff!=='pool'&&(!affiliates.some(a=>a[0]===aff)||(aff!=='release'&&!state.roles.includes(role))))throw Error('Invalid position');const old=scenario.placements[id];scenario.placements[id]={aff,role:['pool','release'].includes(aff)?'':role,final:false};return `${state.candidates.find(c=>c.id===id).name}: ${old?.aff==='release'?'Release options':old&&old.aff!=='pool'?old.aff+' / '+old.role:'candidate pool'} → ${aff==='pool'?'candidate pool':aff==='release'?'Release options':aff+' / '+role}`;}
export function choose(scenario,id){const p=scenario.placements[id];if(!p||['pool','release'].includes(p.aff))throw Error('Assign a staffing position first');const value=!p.final;for(const q of Object.values(scenario.placements))if(q.aff===p.aff&&q.role===p.role)q.final=false;p.final=value;}
export function validate(s){const str=x=>typeof x==='string'&&x.length>0&&x.length<=500;const unique=a=>new Set(a).size===a.length;if(s?.version!==1||!Array.isArray(s.profiles)||!s.profiles.length||!Array.isArray(s.roles)||!s.roles.length||!s.roles.every(str)||!unique(s.roles)||!Array.isArray(s.candidates)||!Array.isArray(s.scenarios)||!s.scenarios.length)throw Error('Invalid board file');for(const list of [s.profiles,s.candidates,s.scenarios]){if(!list.every(x=>x&&str(x.id)&&str(x.name))||!unique(list.map(x=>x.id)))throw Error('Invalid names or duplicate IDs');}for(const c of s.candidates)if(typeof c.title!=='string')throw Error('Invalid candidate');for(const b of s.scenarios){validateReactions(s,b);if(!b.placements||typeof b.placements!=='object'||Array.isArray(b.placements)||!Array.isArray(b.events)||!Array.isArray(b.notes))throw Error('Invalid scenario');const finals=new Set();for(const [id,p]of Object.entries(b.placements)){if(!s.candidates.some(c=>c.id===id)||!p||typeof p.final!=='boolean'||!(p.aff==='pool'||p.aff==='release'&&p.role===''||affiliates.some(a=>a[0]===p.aff)&&p.aff!=='release'&&s.roles.includes(p.role)))throw Error('Invalid assignment');if(p.final){const key=p.aff+'|'+p.role;if(['pool','release'].includes(p.aff)||finals.has(key))throw Error('Duplicate final selection');finals.add(key);}}for(const e of [...b.notes,...b.events])if(!str(e.actor)||typeof e.text!=='string'||typeof e.date!=='string'||!Number.isFinite(Date.parse(e.date)))throw Error('Invalid activity');}return s;}

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

export const reactionOptions = [
  ['like', '👍', 'Like'], ['dislike', '👎', 'Dislike'], ['love', '❤️', 'Love'],
  ['fire', '🔥', 'Fire'], ['sick', '🤘', 'Sick'], ['thinking', '🤔', 'Thinking'],
];
export function sameReactionTarget(a, b) {
  return !a && !b || !!a && !!b && a.aff === b.aff && a.role === b.role;
}
export function reactionsFor(scenario, target) {
  return (scenario.reactions || []).filter(r => sameReactionTarget(r.target, target));
}
function validReactionTarget(state, target) {
  return target === undefined || target && typeof target === 'object' && !Array.isArray(target)
    && affiliates.some(a => a[0] === target.aff)
    && (target.aff === 'release' ? target.role === '' : state.roles.includes(target.role));
}
function reactionId(profile, emoji, target) {
  return target ? 'position:' + JSON.stringify([target.aff, target.role, profile, emoji]) : profile + ':' + emoji;
}
export function toggleReaction(state, scenario, profileId, emoji, target) {
  if (!state.profiles.some(p => p.id === profileId) || !reactionOptions.some(r => r[0] === emoji) || !validReactionTarget(state, target)) throw Error('Invalid reaction');
  scenario.reactions ??= [];
  const index = scenario.reactions.findIndex(r => r.profile === profileId && r.emoji === emoji && sameReactionTarget(r.target, target));
  if (index >= 0) { scenario.reactions.splice(index, 1); return false; }
  scenario.reactions.push({id: reactionId(profileId, emoji, target), profile: profileId, emoji, ...(target ? {target: {...target}} : {})});
  return true;
}
function validateReactions(state, scenario) {
  if (scenario.reactions === undefined) return;
  if (!Array.isArray(scenario.reactions)) throw Error('Invalid roster reactions');
  const ids = new Set();
  for (const r of scenario.reactions) {
    if (!r || !state.profiles.some(p => p.id === r.profile) || !reactionOptions.some(o => o[0] === r.emoji) || !validReactionTarget(state, r.target) || r.id !== reactionId(r.profile, r.emoji, r.target) || ids.has(r.id)) throw Error('Invalid roster reaction');
    ids.add(r.id);
  }
}
