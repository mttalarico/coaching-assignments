import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.BOARD_URL||'http://localhost:3948/';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const synthetic={version:1,profiles:[{id:'test',name:'Test Host'}],roles:['Manager'],candidates:[],scenarios:[{id:'test-plan',name:'Synthetic plan',placements:{},notes:[],events:[]}],appliedRosters:['last-year-roster-v1']};
let host,guest;const errors=[];
try{
 const hc=await browser.newContext(),gc=await browser.newContext();
 for(const context of [hc,gc]){context.setDefaultTimeout(15000);await context.addInitScript(s=>{if(!localStorage.getItem('cubs-coaching-v1'))localStorage.setItem('cubs-coaching-v1',JSON.stringify(s));},synthetic);}
 host=await hc.newPage();guest=await gc.newPage();for(const p of [host,guest])p.on('pageerror',e=>errors.push(e.message));
 host.on('dialog',d=>d.accept());
 await host.goto(base);await host.getByRole('button',{name:'Live session',exact:true}).click();await host.getByRole('button',{name:'Start live session',exact:true}).click();
 await expect(host.locator('#liveStatus')).toHaveText('Live · 1 connected · Keep this tab open',{timeout:35000});
 await hc.grantPermissions(['clipboard-read','clipboard-write']);await host.getByRole('button',{name:'Copy invite link',exact:true}).click();const link=await host.evaluate(()=>navigator.clipboard.readText());const id=new URL(link).searchParams.get('join');assert.ok(id);assert.equal(new URL(link).hostname,'mttalarico.github.io');
 // Existing tab + legacy hash invite must show Join without reloading.
 await guest.goto(base);await guest.goto(base+'#join='+id);await expect(guest.getByRole('dialog')).toBeVisible();
 await guest.getByRole('button',{name:'Close dialog',exact:true}).click();
 await guest.getByRole('button',{name:'Join session',exact:true}).click();await guest.getByLabel('Invite link or session code').fill(id);await guest.getByRole('button',{name:'Continue',exact:true}).click();
 await guest.getByLabel('Your name / nickname').fill('Test Partner');await guest.getByRole('button',{name:'Join live session',exact:true}).click();
 await expect(guest.locator('#liveStatus')).toHaveText('Live · Connected to shared board',{timeout:35000});console.log('PASS: public invite from host, legacy hash in existing tab, pasted session code, live connection');
 await expect(host.getByRole('option',{name:'Test Partner',exact:true})).toBeAttached();
 // Reload host; session ID must survive and same invite must reconnect.
 await host.reload();await expect(host.locator('#liveStatus')).toHaveText('Live · 1 connected · Keep this tab open',{timeout:35000});
 await expect(guest.getByRole('button',{name:'Retry connection',exact:true})).toBeVisible({timeout:20000});await guest.getByRole('button',{name:'Retry connection',exact:true}).click();
 await expect(guest.locator('#liveStatus')).toHaveText('Live · Connected to shared board',{timeout:35000});await host.getByRole('button',{name:'Copy invite link',exact:true}).click();assert.equal(await host.evaluate(()=>navigator.clipboard.readText()),link);console.log('PASS: host refresh keeps same invite and guest can retry');
 await host.getByRole('button',{name:'Leave session',exact:true}).click();await expect(guest.getByRole('button',{name:'Retry connection',exact:true})).toBeVisible({timeout:20000});await guest.getByRole('button',{name:'Retry connection',exact:true}).click();await expect(guest.locator('#liveStatus')).toContainText('Host is not online',{timeout:35000});console.log('PASS: expired invite gives specific offline-host error and retry');
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
