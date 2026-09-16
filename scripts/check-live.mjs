import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const errors=[];let host,guest;
const synthetic={version:1,profiles:[{id:'test',name:'Test Host'}],roles:['Manager','Bench Coach'],candidates:[{id:'synthetic',name:'Fictional Candidate',title:'Manager'}],scenarios:[{id:'test-plan',name:'Synthetic plan',placements:{synthetic:{aff:'iowa',role:'Manager',final:false}},notes:[],events:[]}],appliedRosters:['last-year-roster-v1']};
try{
 const hc=await browser.newContext(),gc=await browser.newContext();
 // Both browsers receive only fictional test data; the roster migration is already marked applied.
 for(const context of [hc,gc])await context.addInitScript(data=>localStorage.setItem('cubs-coaching-v1',JSON.stringify(data)),synthetic);
 host=await hc.newPage();guest=await gc.newPage();host.setDefaultTimeout(15000);guest.setDefaultTimeout(15000);
 for(const page of [host,guest])page.on('pageerror',e=>errors.push(e.message));
 await host.goto('http://localhost:3948');console.log('App loaded');
 assert.equal(await host.getByRole('button',{name:'Peavey Manager',exact:true}).count(),0);
 await host.getByRole('button',{name:'Live session',exact:true}).click();await host.getByRole('button',{name:'Start live session',exact:true}).click();
 await host.getByText('Live · 1 connected · Keep this tab open',{exact:true}).waitFor({timeout:30000});
 console.log('Host session started');await hc.grantPermissions(['clipboard-read','clipboard-write']);await host.getByRole('button',{name:'Copy invite link'}).click();const link=await host.evaluate(()=>navigator.clipboard.readText());
 console.log('Invite copied');await guest.goto(link);await guest.getByLabel('Your name / nickname').fill('Test Partner');await guest.getByRole('button',{name:'Join live session',exact:true}).click();
 await guest.getByText('Live · Connected to shared board',{exact:true}).waitFor({timeout:30000});
 console.log('Guest connected');await host.getByRole('combobox',{name:'Active leadership profile'}).getByRole('option',{name:'Test Partner'}).waitFor({state:'attached'});
 await guest.getByRole('button',{name:'＋ Add candidate',exact:true}).click();await guest.getByLabel('Candidate name',{exact:true}).fill('Fictional Option');await guest.getByLabel('Position / title',{exact:true}).fill('Manager');await guest.getByRole('button',{name:'Add candidate',exact:true}).click();
 await host.getByRole('button',{name:'Fictional Option Manager',exact:true}).waitFor();
 await host.getByRole('button',{name:'Fictional Candidate Manager',exact:true}).click();await host.getByLabel('Board position').selectOption({label:'STAFF Roving Coaches — Manager'});await host.getByRole('button',{name:'Save changes'}).click();
 await guest.locator('[data-aff="roving"][data-role="Manager"]').getByRole('button',{name:'Fictional Candidate Manager',exact:true}).waitFor();
 await guest.getByRole('button',{name:'Fictional Candidate Manager',exact:true}).click();await guest.locator('#opinion').fill('A synthetic discussion note');await guest.getByRole('button',{name:'Save changes'}).click();await host.getByText('commented on Fictional Candidate: “A synthetic discussion note”',{exact:false}).waitFor();
 // Reactions belong to the current roster and synchronize in both directions.
 await host.getByRole('button',{name:'Love',exact:true}).click();
 await guest.locator('.reaction-people').getByText('❤️ Test Host',{exact:true}).waitFor();
 await guest.getByRole('button',{name:'Sick',exact:true}).click();
 await host.locator('.reaction-people').getByText('🤘 Test Partner',{exact:true}).waitFor();
 await guest.getByRole('button',{name:'Sick',exact:true}).click();
 await host.locator('.reaction-people').getByText('🤘 Test Partner',{exact:true}).waitFor({state:'hidden'});
 assert.equal(await guest.getByRole('button',{name:'Sick',exact:true}).getAttribute('aria-pressed'),'false');
 await guest.getByRole('button',{name:'Duplicate scenario',exact:true}).click();await guest.getByLabel('Scenario name').fill('Test alternative');await guest.getByRole('button',{name:'Create scenario',exact:true}).click();await host.getByRole('button',{name:'Test alternative',exact:true}).waitFor();
 await guest.getByText('No reactions yet. Give this option a little feedback.',{exact:true}).waitFor();
 await host.locator('.reaction-people').getByText('❤️ Test Host',{exact:true}).waitFor();
 await host.screenshot({path:'/private/tmp/coaching-live-session.png',fullPage:true});
 await host.close();await guest.getByText('Host disconnected · Changes paused.',{exact:false}).waitFor();assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS: real connection with fictional data, partner identity, candidate addition, move, opinion, reactions in both directions, reaction removal, duplicate without inherited votes, scenario, disconnect, no browser errors.');
}catch(e){console.log('Host status:',await host?.locator('#liveStatus').textContent().catch(()=>''));console.log('Guest status:',await guest?.locator('#liveStatus').textContent().catch(()=>''));console.log('Errors:',errors);throw e;}finally{await browser.close();}
