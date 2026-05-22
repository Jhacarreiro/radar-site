const q=document.getElementById('q'),brand=document.getElementById('brand'),cat=document.getElementById('cat'),sortEl=document.getElementById('sort'),count=document.getElementById('count'),grid=document.getElementById('grid');
const cards=[...document.querySelectorAll('[data-card]')];
const ageRankFresh={fresh:0,aging:1,old:2,future:3,unknown:4};
const ageRankUpcoming={future:0,fresh:1,aging:2,old:3,unknown:4};
const ageRankLast={aging:0,old:1,fresh:2,future:3,unknown:4};
const num=v=>Number(v||0);
const dateNum=c=>Number(String(c.dataset.date||'').replaceAll('-',''))||0;
function byText(a,b){return (a.dataset.title||'').localeCompare(b.dataset.title||'', 'pt')}
function sortCards(rows){
  const mode=sortEl.value||'fresh';
  rows.sort((a,b)=>{
    if(mode==='upcoming') return (ageRankUpcoming[a.dataset.age]??9)-(ageRankUpcoming[b.dataset.age]??9) || dateNum(a)-dateNum(b) || byText(a,b);
    if(mode==='lastcall') return (ageRankLast[a.dataset.age]??9)-(ageRankLast[b.dataset.age]??9) || dateNum(a)-dateNum(b) || byText(a,b);
    if(mode==='price') return num(a.dataset.price)-num(b.dataset.price) || byText(a,b);
    return (ageRankFresh[a.dataset.age]??9)-(ageRankFresh[b.dataset.age]??9) || dateNum(b)-dateNum(a) || byText(a,b);
  });
  return rows;
}
function apply(){
  const term=(q.value||'').trim().toLowerCase(),b=brand.value,c=cat.value;let visible=[];
  for(const card of cards){
    const ok=(!term||card.dataset.search.includes(term))&&(!b||card.dataset.brand===b)&&(!c||card.dataset.category===c);
    card.hidden=!ok;if(ok)visible.push(card);
  }
  sortCards(visible).forEach(card=>grid.appendChild(card));
  count.textContent=visible.length;
}
[q,brand,cat,sortEl].forEach(el=>el.addEventListener('input',apply));
apply();

const base='/whipit/lidl';
const modal=document.getElementById('shops-modal'), list=document.getElementById('shops-list'), statusBox=document.getElementById('shops-status'), storeSearch=document.getElementById('store-search'), useLocation=document.getElementById('use-location'), productBox=document.getElementById('availability-product'), productLink=document.getElementById('availability-product-link');
let storesCache=null,userPos=null,currentProduct=null,availabilityAbort=null,availabilityTimer=null;
function openAvailability(card){
  currentProduct={title:card.dataset.productTitle,brand:card.dataset.productBrand,price:card.dataset.productPrice,date:card.dataset.productDateLabel,unit:card.dataset.productUnit,url:card.dataset.productUrl,availabilityId:card.dataset.availabilityId,globalAvailable:card.dataset.globalAvailable==='1',globalText:card.dataset.globalAvailabilityText||''};
  modal.hidden=false;document.body.classList.add('modal-open');
  storeSearch.value=''; userPos=null; list.innerHTML='';
  renderProductHeader();
  statusBox.textContent=currentProduct.availabilityId?'Usa localização ou escreve cidade/rua para verificar até 5 lojas.':'Este produto não tem identificador de disponibilidade.';
  loadStores();
}
function renderProductHeader(){
  const productStatus=currentProduct.globalAvailable?'<div class="product-availability-status available"><b>▰▰▰</b><span>Melhor aposta</span></div>':'<div class="product-availability-status unknown"><b>▱▱▱</b><span>Sem dados</span></div>';
  const globalText=currentProduct.globalText?`<p class="global-availability-text">${escapeHtml(currentProduct.globalText)}</p>`:'';
  productBox.innerHTML=`<div class="availability-product-card"><div><strong>${escapeHtml(currentProduct.brand||'')}</strong><h3>${escapeHtml(currentProduct.title||'')}</h3><p>${escapeHtml(currentProduct.price||'')} · ${escapeHtml(currentProduct.date||'')} · ${escapeHtml(currentProduct.unit||'')}</p>${globalText}</div>${productStatus}</div>`;
  productLink.href=currentProduct.url||'https://www.lidl.pt/';
}
function closeShops(){modal.hidden=true;document.body.classList.remove('modal-open'); if(availabilityAbort) availabilityAbort.abort();}
document.querySelectorAll('[data-availability]').forEach(el=>el.addEventListener('click',()=>openAvailability(el.closest('[data-card]'))));
document.querySelectorAll('[data-close-shops]').forEach(el=>el.addEventListener('click',closeShops));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeShops()});
async function loadStores(){if(storesCache)return storesCache;const res=await fetch(`${base}/data/stores.json`,{cache:'no-cache'});const data=await res.json();storesCache=data.stores||[];return storesCache}
function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function km(a,b,c,d){const R=6371,toRad=x=>x*Math.PI/180;const dLat=toRad(c-a),dLon=toRad(d-b);const x=Math.sin(dLat/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(x))}
function todayHours(store){const items=(store.opening_hours&&store.opening_hours.items)||[];const today=new Date().toISOString().slice(0,10);let item=items.find(x=>x.date===today)||items[0];if(!item)return 'Horário n/d';const ranges=item.timeRanges||[];if(!ranges.length)return 'Fechado';return ranges.map(r=>`${(r.from||'').slice(11,16)}–${(r.to||'').slice(11,16)}`).join(', ')}
function mapsUrl(s){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.latitude},${s.longitude}`)}`}
function lidlStoreId(id){return String(id||'').replace(/^PT/,'')}
function availabilityMeta(indicator,store){
  const v=String(indicator||'UNKNOWN').toUpperCase();
  if(v==='AVAILABLE'||v==='HIGH_STOCK') return {bars:'▰▰▰',label:'Melhor aposta',cls:'available'};
  if(v==='LOW_STOCK') return {bars:'▰▰▱',label:'Boa aposta',cls:'low'};
  if(v==='SOLD_OUT'||v==='NOT_IN_THIS_STORE') return {bars:'▰▱▱',label:'Talvez',cls:'no'};
  if(currentProduct&&currentProduct.globalAvailable&&store){return {bars:store.stock_bars||'▰▱▱',label:store.stock_label||'Talvez',cls:'estimated'}}
  return {bars:'▱▱▱',label:'Sem dados',cls:'unknown'};
}
async function fetchAvailability(stores){
  if(!currentProduct||!currentProduct.availabilityId) return new Map();
  if(availabilityAbort) availabilityAbort.abort();
  availabilityAbort=new AbortController();
  const ids=stores.map(s=>lidlStoreId(s.id)).filter(Boolean).join(',');
  if(!ids) return new Map();
  const url=`https://www.lidl.pt/p/api/storestock/PT/pt/${encodeURIComponent(currentProduct.availabilityId)}?storeids=${ids}`;
  const res=await fetch(url,{signal:availabilityAbort.signal,cache:'no-cache'});
  const rows=await res.json();
  return new Map((Array.isArray(rows)?rows:[]).map(r=>[String(r.storeId).padStart(5,'0'),r.storeAvailabilityIndicator]));
}
function candidateStores(){
  if(!storesCache) return [];
  const term=fold((storeSearch.value||'').trim());
  let rows=[...storesCache];
  if(term) rows=rows.filter(s=>fold(`${s.city||''} ${s.street||''} ${s.zip||''}`).includes(term));
  if(userPos){rows.forEach(s=>s._dist=km(userPos.lat,userPos.lon,s.latitude,s.longitude));rows.sort((a,b)=>(a._dist-b._dist)||(b.stock_score-a.stock_score));}
  else rows.sort((a,b)=>(b.stock_score-a.stock_score)||(a.city||'').localeCompare(b.city||'pt'));
  return rows.slice(0,5);
}
async function verifyStores(){
  await loadStores();
  const term=(storeSearch.value||'').trim();
  if(!userPos && term.length<2){list.innerHTML='';statusBox.textContent='Usa localização ou escreve pelo menos 2 letras para verificar até 5 lojas.';return;}
  const rows=candidateStores();
  if(!rows.length){list.innerHTML='<p class="modal-note">Sem lojas para esse filtro.</p>';statusBox.textContent='Sem lojas encontradas.';return;}
  list.innerHTML=rows.map(s=>storeCard(s,null,true)).join('');
  statusBox.textContent=`A consultar disponibilidade em ${rows.length} lojas…`;
  try{
    const map=await fetchAvailability(rows);
    const indicators=rows.map(s=>map.get(lidlStoreId(s.id))||'UNKNOWN');
    list.innerHTML=rows.map((s,i)=>storeCard(s,indicators[i],false)).join('');
    const allUnknown=indicators.every(v=>String(v||'UNKNOWN').toUpperCase()==='UNKNOWN');
    statusBox.textContent=allUnknown?'A Lidl devolveu sem dados para estas lojas.':(userPos?`${rows.length} lojas mais próximas`:`${rows.length} lojas para “${term}”`);
  }catch(e){
    if(e.name==='AbortError') return;
    list.innerHTML=rows.map(s=>storeCard(s,'UNKNOWN',false)).join('');
    statusBox.textContent='Não consegui consultar a Lidl agora.';
  }
}
function storeCard(s,indicator,loading){
  const meta=loading?{bars:'…',label:'A consultar',cls:'loading'}:availabilityMeta(indicator,s);
  const dist=s._dist!=null?`<span>${s._dist.toFixed(s._dist<10?1:0)} km</span>`:'';
  return `<article class="store-card availability ${meta.cls}"><div><h3>${escapeHtml(s.city||'Lidl')}</h3><p>${escapeHtml(s.street||'')}</p><div class="store-meta">${dist}<span>${escapeHtml(todayHours(s))}</span></div></div><div class="store-stock"><b>${escapeHtml(meta.bars)}</b><span>${escapeHtml(meta.label)}</span></div><div class="store-actions"><a href="${mapsUrl(s)}" target="_blank" rel="nofollow noopener">Maps</a><a href="${escapeAttr(s.official_url||'https://www.lidl.pt/c/lojas-e-horarios/s10020746')}" target="_blank" rel="nofollow noopener">Lidl</a></div></article>`
}
storeSearch&&storeSearch.addEventListener('input',()=>{clearTimeout(availabilityTimer);availabilityTimer=setTimeout(()=>verifyStores(),350)});
useLocation&&useLocation.addEventListener('click',()=>{if(!navigator.geolocation){statusBox.textContent='Localização não disponível neste browser.';return}statusBox.textContent='A pedir localização…';navigator.geolocation.getCurrentPosition(pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};verifyStores()},()=>{statusBox.textContent='Não consegui obter localização. Podes escrever cidade ou rua.'},{enableHighAccuracy:false,timeout:10000,maximumAge:300000})});
function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function escapeAttr(s){return escapeHtml(s).replace(/'/g,'&#39;')}

