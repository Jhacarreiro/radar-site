const body=document.body, country=body.dataset.country||'PT', locale=body.dataset.locale||'pt-PT', base=body.dataset.basePath||'/whipit/limited-offers', lidlDomain=body.dataset.lidlDomain||'https://www.lidl.pt';
let UI={};try{UI=JSON.parse(document.getElementById('lidl-ui')?.textContent||'{}')}catch(e){};const tr=(k,f)=>UI[k]||f;
const q=document.getElementById('q'),brand=document.getElementById('brand'),cat=document.getElementById('cat'),sortEl=document.getElementById('sort'),count=document.getElementById('count'),grid=document.getElementById('grid');
const cards=[...document.querySelectorAll('[data-card]')], stateRank={now:0,lastcall:1,future:2,past:3,unknown:4};
const num=v=>Number(v||0), dateNum=c=>Number(String(c.dataset.date||'').replaceAll('-',''))||0, byText=(a,b)=>(a.dataset.title||'').localeCompare(b.dataset.title||'',locale);
function allowedByMode(card,mode){const st=card.dataset.status||'unknown';if(mode==='fresh')return st==='now'||st==='lastcall';if(mode==='upcoming')return st==='future';if(mode==='lastcall')return st==='lastcall';if(mode==='past')return st==='past';return true}
function sortCards(rows){const mode=sortEl.value||'all';rows.sort((a,b)=>{if(mode==='upcoming')return dateNum(a)-dateNum(b)||byText(a,b);if(mode==='past')return dateNum(b)-dateNum(a)||byText(a,b);if(mode==='lastcall')return dateNum(a)-dateNum(b)||byText(a,b);if(mode==='price')return num(a.dataset.price)-num(b.dataset.price)||byText(a,b);return (stateRank[a.dataset.status]??9)-(stateRank[b.dataset.status]??9)||dateNum(b)-dateNum(a)||byText(a,b)});return rows}
const retailerButtons=[...document.querySelectorAll('[data-retailer-toggle]')];let activeRetailers=new Set(retailerButtons.map(b=>b.dataset.retailerToggle));retailerButtons.forEach(btn=>btn.addEventListener('click',()=>{const r=btn.dataset.retailerToggle;if(activeRetailers.has(r)){activeRetailers.delete(r);btn.classList.remove('active')}else{activeRetailers.add(r);btn.classList.add('active')}apply()}));
function apply(){const term=(q.value||'').trim().toLowerCase(),b=brand.value,c=cat.value,mode=sortEl.value||'all';let visible=[];for(const card of cards){const ok=activeRetailers.has(card.dataset.retailer||'LIDL')&&allowedByMode(card,mode)&&(!term||card.dataset.search.includes(term))&&(!b||card.dataset.brand===b)&&(!c||card.dataset.category===c);card.hidden=!ok;if(ok)visible.push(card)}sortCards(visible).forEach(card=>grid.appendChild(card));count.textContent=visible.length}
[q,brand,cat,sortEl].forEach(el=>el&&el.addEventListener('input',apply));apply();
const modal=document.getElementById('shops-modal'), list=document.getElementById('shops-list'), statusBox=document.getElementById('shops-status'), sourceNote=document.getElementById('shops-source-note')||document.querySelector('.shops-source-note'), storeSearch=document.getElementById('store-search'), useLocation=document.getElementById('use-location'), productBox=document.getElementById('availability-product'), productLink=document.getElementById('availability-product-link');
let storesCache=null,userPos=null,currentProduct=null,availabilityAbort=null,availabilityTimer=null;
function setSourceNote(){if(!sourceNote||!currentProduct)return;const isAldi=(currentProduct.retailer||'').toUpperCase()==='ALDI';const isPl=(locale||'').toLowerCase().startsWith('pl');sourceNote.textContent=isAldi?(isPl?'Szacunek, nie stan magazynowy.':'Aldi: estimativa, não stock real.'):(isPl?'Dane Lidla według sklepu, gdy są dostępne.':'Dados fornecidos pelo Lidl.')}
function openAvailability(card){currentProduct={country:card.dataset.country||country,retailer:card.dataset.retailer||'LIDL',stockMode:card.dataset.stockMode||'live',age:card.dataset.age||'',title:card.dataset.productTitle,brand:card.dataset.productBrand,price:card.dataset.productPrice,date:card.dataset.productDateLabel,url:card.dataset.productUrl,availabilityId:card.dataset.availabilityId,globalText:card.dataset.globalAvailabilityText||''};modal.hidden=false;document.body.classList.add('modal-open');storeSearch.value='';userPos=null;list.innerHTML='';renderProductHeader();setSourceNote();statusBox.textContent=currentProduct.age==='future'?tr('future_intro','Este produto ainda não entrou em vigor; a disponibilidade só deve fazer sentido a partir da data indicada.'):currentProduct.stockMode==='estimated'?tr('estimated_intro','Pesquisa uma localidade para ver lojas prováveis. Estimativa, não stock real.'):currentProduct.availabilityId?tr('modal','Use location or search to check stores.'):tr('no_id','No availability id for this product.');loadStores()}
function renderProductHeader(){const g=currentProduct.globalText?`<p class="global-availability-text">${escapeHtml(currentProduct.globalText)}</p>`:'';productBox.innerHTML=`<a class="availability-product-card" href="${escapeAttr(currentProduct.url||lidlDomain)}" target="_blank" rel="nofollow noopener"><div><strong>${escapeHtml(currentProduct.brand||'')}</strong><h3>${escapeHtml(currentProduct.title||'')}</h3><p>${escapeHtml(currentProduct.price||'')} · ${escapeHtml(currentProduct.date||'')}</p>${g}</div></a>`;productLink.href=currentProduct.url||lidlDomain}
function closeShops(){modal.hidden=true;document.body.classList.remove('modal-open');if(availabilityAbort)availabilityAbort.abort()}
document.querySelectorAll('[data-availability]').forEach(el=>el.addEventListener('click',()=>openAvailability(el.closest('[data-card]'))));document.querySelectorAll('[data-close-shops]').forEach(el=>el.addEventListener('click',closeShops));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeShops()});
async function loadStores(){if(storesCache)return storesCache;try{const res=await fetch(`${base}/data/stores.json`,{cache:'no-cache'});if(!res.ok)throw new Error('stores_fetch_failed');const data=await res.json();storesCache=data.stores||[];return storesCache}catch(e){storesCache=[];statusBox.textContent=tr('stores_unavailable','Store list is not available for this country yet.');return storesCache}}
function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}function km(a,b,c,d){const R=6371,toRad=x=>x*Math.PI/180,dLat=toRad(c-a),dLon=toRad(d-b),x=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function todayHours(store){const items=(store.opening_hours&&store.opening_hours.items)||[],today=new Date().toISOString().slice(0,10);let item=items.find(x=>x.date===today)||items[0];if(!item)return tr('hours_unknown','Hours n/a');const ranges=item.timeRanges||[];if(!ranges.length)return tr('closed','Closed');return ranges.map(r=>`${(r.from||'').slice(11,16)}–${(r.to||'').slice(11,16)}`).join(', ')}
function mapsUrl(s){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.latitude},${s.longitude}`)}`}
const availabilityApi='https://webhook.gallivanter.biz/api/lidl/availability';
async function fetchAvailability(stores){if(!currentProduct||!currentProduct.availabilityId)return new Map();if(availabilityAbort)availabilityAbort.abort();availabilityAbort=new AbortController();const res=await fetch(availabilityApi,{method:'POST',signal:availabilityAbort.signal,cache:'no-cache',headers:{'Content-Type':'application/json'},body:JSON.stringify({country:currentProduct.country||country,product_code:currentProduct.availabilityId,store_ids:stores.map(s=>s.id)})});if(!res.ok)throw new Error('availability_api_failed');const data=await res.json();return new Map((data.stores||[]).map(r=>[String(r.store_id),r]))}
function candidateStores(){if(!storesCache)return[];const term=fold((storeSearch.value||'').trim());let rows=[...storesCache].filter(s=>(s.retailer||'LIDL')===(currentProduct?.retailer||'LIDL'));if(term)rows=rows.filter(s=>fold(`${s.city||''} ${s.street||''} ${s.zip||''}`).includes(term));if(userPos){rows.forEach(s=>s._dist=km(userPos.lat,userPos.lon,s.latitude,s.longitude));rows.sort((a,b)=>(a._dist-b._dist)||(b.stock_score-a.stock_score))}else rows.sort((a,b)=>(b.stock_score-a.stock_score)||(a.city||'').localeCompare(b.city||'',locale));return rows.slice(0,5)}
async function verifyStores(){await loadStores();const term=(storeSearch.value||'').trim();if(!storesCache.length){list.innerHTML='<p class="modal-note">'+escapeHtml(tr('stores_unavailable','Store list is not available for this country yet.'))+'</p>';return}if(!userPos&&term.length<2){list.innerHTML='';statusBox.textContent=tr('type_two','Use location or type at least 2 letters.');return}const rows=candidateStores();if(!rows.length){list.innerHTML='<p class="modal-note">'+escapeHtml(tr('no_stores','No stores for this filter.'))+'</p>';statusBox.textContent=tr('no_stores','No stores found.');return}if(currentProduct.stockMode==='estimated'){const results=rows.map(s=>({bars:s.stock_bars||'▰▰▱',label:s.stock_label||tr('estimate','Boa aposta'),class:'estimated'}));list.innerHTML=rows.map((s,i)=>storeCard(s,results[i],false)).join('');statusBox.textContent=tr('estimated_note','Estimativa por dados oficiais da loja; a Aldi não disponibiliza stock por loja.');return}list.innerHTML=rows.map(s=>storeCard(s,null,true)).join('');statusBox.textContent=tr('checking','Checking availability…');try{const map=await fetchAvailability(rows),results=rows.map(s=>map.get(s.id)||{bars:'▱▱▱',label:tr('no_info','No information'),class:'unknown'});list.innerHTML=rows.map((s,i)=>storeCard(s,results[i],false)).join('');statusBox.textContent=results.every(v=>(v.class||'unknown')==='unknown')?tr('no_info','No information for these stores.'):tr('done','Availability checked.')}catch(e){if(e.name==='AbortError')return;list.innerHTML=rows.map(s=>storeCard(s,{bars:'▱▱▱',label:tr('no_info','No information'),class:'unknown'},false)).join('');statusBox.textContent=tr('api_failed','Could not query Lidl now.')}}
function storeCard(s,result,loading){const meta=loading?{bars:'…',label:tr('checking_short','Checking'),class:'loading'}:(result||{bars:'▱▱▱',label:tr('no_info','No information'),class:'unknown'}),dist=s._dist!=null?`<span>${s._dist.toFixed(s._dist<10?1:0)} km</span>`:'';return `<article class="store-card availability ${meta.class}"><div><h3>${escapeHtml(s.city||'Lidl')}</h3><p>${escapeHtml(s.street||'')}</p><div class="store-meta">${dist}<span>${escapeHtml(todayHours(s))}</span></div></div><div class="store-stock"><b>${escapeHtml(meta.bars)}</b><span>${escapeHtml(meta.label)}</span></div><div class="store-actions"><a href="${mapsUrl(s)}" target="_blank" rel="nofollow noopener">Maps</a><a href="${escapeAttr(s.official_url||lidlDomain)}" target="_blank" rel="nofollow noopener">Lidl</a></div></article>`}
storeSearch&&storeSearch.addEventListener('input',()=>{clearTimeout(availabilityTimer);availabilityTimer=setTimeout(()=>verifyStores(),350)});useLocation&&useLocation.addEventListener('click',()=>{if(!window.isSecureContext){statusBox.textContent=tr('geo_insecure','A localização do browser só funciona em HTTPS. Abre esta página em https://getrad.ar.');return}if(!navigator.geolocation){statusBox.textContent=tr('geo_unavailable','Este browser não disponibiliza localização. Escreve cidade ou rua.');return}statusBox.textContent=tr('geo_asking','A pedir localização ao browser…');navigator.geolocation.getCurrentPosition(pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};verifyStores()},err=>{const code=err&&err.code;statusBox.textContent=code===1?tr('geo_denied','Permissão de localização bloqueada. Autoriza a localização para getrad.ar nas definições do browser, ou escreve cidade/rua.'):code===3?tr('geo_timeout','O browser não devolveu a localização a tempo. Tenta novamente ou escreve cidade/rua.'):tr('geo_failed','Não foi possível obter localização. Escreve cidade ou rua.')},{enableHighAccuracy:false,timeout:15000,maximumAge:300000})});
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}function escapeAttr(s){return escapeHtml(s).replace(/'/g,'&#39;')}


/* Limited Offers alerts UI — zero LLM */
(function(){
  const api='https://webhook.gallivanter.biz/api/lidl/availability';
  const $=id=>document.getElementById(id);
  const modal=$('alerts-modal'), status=$('alerts-status'), auth=$('alerts-auth'), app=$('alerts-app');
  if(!modal||!status) return;
  const tokenKey='limitedOffersAlertToken';
  const token=()=>localStorage.getItem(tokenKey)||'';
  const setStatus=t=>{status.textContent=t};
  async function call(payload,authz=true){
    const headers={'Content-Type':'application/json'};
    if(authz&&token()) headers.Authorization='Bearer '+token();
    const res=await fetch(api,{method:'POST',cache:'no-cache',headers,body:JSON.stringify(payload)});
    const data=await res.json().catch(()=>({ok:false,error:'Resposta inválida'}));
    if(!res.ok||data.ok===false) throw new Error(data.error||('HTTP '+res.status));
    return data;
  }
  function currentAlert(){
    return {match_type:$('alerts-type')?.value||'keyword', match_value:($('alerts-value')?.value||'').trim(), label:($('alerts-label')?.value||'').trim()};
  }
  function validAlert(){
    const a=currentAlert();
    if(!a.match_value){setStatus('Escolhe primeiro o alerta: keyword, marca, categoria ou produto.');return null}
    return a;
  }
  function open(){modal.hidden=false;document.body.classList.add('modal-open');refresh().catch(()=>{})}
  function close(){modal.hidden=true;document.body.classList.remove('modal-open')}
  document.querySelectorAll('[data-close-alerts]').forEach(x=>x.addEventListener('click',close));
  $('alerts-open')?.addEventListener('click',()=>{ if($('alerts-type')) $('alerts-type').value='keyword'; if($('alerts-value')) $('alerts-value').value=''; if($('alerts-label')) $('alerts-label').value=''; open(); });
  async function refresh(){
    if(!token()){auth.hidden=false;app.hidden=true;setStatus('Escolhe o alerta e confirma WhatsApp/email para guardar.');return}
    auth.hidden=true;app.hidden=false;setStatus('Sessão activa. Agora podes guardar alertas e desligar alertas activos.');
    try{const data=await call({alerts_action:'list'}); renderList(data.alerts||[])}
    catch(e){localStorage.removeItem(tokenKey);auth.hidden=false;app.hidden=true;setStatus('Sessão expirada. Confirma o contacto outra vez.')}
  }
  function renderList(alerts){
    const box=$('alerts-list'); if(!box) return;
    const active=alerts.filter(a=>a.enabled!==0);
    if(!active.length){box.innerHTML='<p class="modal-note">Ainda não tens alertas activos.</p>';return}
    box.innerHTML=active.map(a=>`<article class="alert-item"><div><b>${escapeHtml(a.match_type)}: ${escapeHtml(a.match_value)}</b><span>${escapeHtml(a.channel)}</span></div><button class="button secondary" type="button" data-alert-delete="${a.id}">Desligar</button></article>`).join('');
    box.querySelectorAll('[data-alert-delete]').forEach(btn=>btn.addEventListener('click',async()=>{try{await call({alerts_action:'delete',alert_id:btn.dataset.alertDelete});await refresh();setStatus('Alerta desligado.')}catch(e){setStatus(e.message)}}));
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  $('alerts-start')?.addEventListener('click',async()=>{
    if(!validAlert()) return;
    const channel=$('alerts-channel').value,destination=$('alerts-destination').value.trim();
    if(!destination){setStatus('Indica o WhatsApp ou email para receber o código.');return}
    try{await call({alerts_action:'auth_start',channel,destination},false);$('alerts-code-row').hidden=false;setStatus('Código enviado. Introduz o código para confirmar.')}catch(e){setStatus(e.message)}
  });
  $('alerts-verify')?.addEventListener('click',async()=>{
    const channel=$('alerts-channel').value,destination=$('alerts-destination').value.trim(),code=$('alerts-code').value.trim();
    try{const data=await call({alerts_action:'auth_verify',channel,destination,code},false);localStorage.setItem(tokenKey,data.token);await refresh();setStatus('Contacto confirmado. Agora carrega em Guardar alerta.')}catch(e){setStatus(e.message)}
  });
  $('alerts-create')?.addEventListener('click',async()=>{
    const a=validAlert(); if(!a) return;
    if(!token()){setStatus('Confirma primeiro o WhatsApp/email com código.');return}
    try{await call({alerts_action:'create',match_type:a.match_type,match_value:a.match_value,label:a.label});$('alerts-value').value='';$('alerts-label').value='';await refresh();setStatus('Alerta guardado.')}catch(e){setStatus(e.message)}
  });
  document.querySelectorAll('[data-alert-product]').forEach(btn=>btn.addEventListener('click',()=>{
    const card=btn.closest('[data-card]'); if(!card) return;
    open();
    const value=card.dataset.productKey||card.dataset.availabilityId||card.dataset.productTitle||'';
    $('alerts-type').value='product'; $('alerts-value').value=value; $('alerts-label').value=card.dataset.productTitle||'';
    setStatus('Alerta preparado para este produto. Confirma contacto e guarda.')
  }));
  refresh().catch(()=>{});
})();
