export const PUBLIC_BOARD_URL = 'https://mttalarico.github.io/coaching-assignments/';
export function parseInvite(value) {
  const text=String(value||'').trim();
  let candidate=text;
  try {const url=new URL(text);candidate=url.searchParams.get('join')||new URLSearchParams(url.hash.slice(1)).get('join')||'';} catch {}
  return /^coaching-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(candidate)?candidate:null;
}
export function inviteFromLocation(href){
  const url=new URL(href);
  return url.searchParams.get('join')||new URLSearchParams(url.hash.slice(1)).get('join');
}
export function makeInvite(host,href){
  if(!parseInvite(host))throw Error('Start a live session first.');
  let url=new URL(href);
  if(['localhost','127.0.0.1','[::1]'].includes(url.hostname)||url.protocol==='file:')url=new URL(PUBLIC_BOARD_URL);
  url.hash='';url.searchParams.set('join',host);
  return url.href;
}
