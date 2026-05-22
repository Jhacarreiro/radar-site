const q=document.getElementById('q'),brand=document.getElementById('brand'),cat=document.getElementById('cat'),statusEl=document.getElementById('status'),count=document.getElementById('count');
const cards=[...document.querySelectorAll('[data-card]')];
function apply(){const term=(q.value||'').trim().toLowerCase(),b=brand.value,c=cat.value,s=statusEl.value;let visible=0;for(const card of cards){const ok=(!term||card.dataset.search.includes(term))&&(!b||card.dataset.brand===b)&&(!c||card.dataset.category===c)&&(!s||card.dataset.status===s);card.hidden=!ok;if(ok)visible++}count.textContent=visible}
[q,brand,cat,statusEl].forEach(el=>el.addEventListener('input',apply));
const modal=document.getElementById('shops-modal');
function openShops(){modal.hidden=false;document.body.classList.add('modal-open')}
function closeShops(){modal.hidden=true;document.body.classList.remove('modal-open')}
document.querySelectorAll('[data-shops]').forEach(el=>el.addEventListener('click',openShops));
document.querySelectorAll('[data-close-shops]').forEach(el=>el.addEventListener('click',closeShops));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeShops()});
