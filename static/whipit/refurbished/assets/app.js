
let __offersCache = null;
const base = (window.REFURB_BASE_PATH || '').replace(/\/$/, '');
const eur = v => (v === null || v === undefined) ? '—' : `${Math.round(Number(v)).toLocaleString('pt-PT')}€`;
const verdictLabel = v => ({excellent:'Excelente', good:'Bom', maybe:'Talvez', avoid:'Evitar'}[v] || '—');
const verdictClass = v => ({excellent:'good', good:'good', maybe:'warn', avoid:'bad'}[v] || '');
function escapeHtml(s){return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/'/g, '&#39;');}
function cleanTitle(s){
  s = String(s || 'Oferta').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*\([^)]*PT\)\s*$/i, '');
  const cuts = [
    /\s+Intel Core\b/i,
    /\s+AMD Ryzen\b/i,
    /\s+Smart TV\b/i,
    /\s+Adaptive Sync\b/i,
    /\s+AdaptiveSync\b/i,
    /\s+FreeSync\b/i,
    /\s+G-Sync\b/i,
    /\s+Altura\b/i,
    /\s+HDR10\b/i,
    /\s+Dolby\b/i,
    /, com\s+/i,
    /\s+Filtro\b/i
  ];
  for (const re of cuts){ const m = s.search(re); if(m > 24){ s = s.slice(0, m).trim(); break; } }
  if(s.length > 64){ const cut = s.slice(0,64); s = cut.slice(0, Math.max(cut.lastIndexOf(' '), 42)).trim(); }
  return s;
}
function skuOf(o){return o.model || String(o.product_id || '').replace(/^pccomponentes-/, '') || 'n/d';}
function offerCard(o){
  const warrantyMonths = Number(o.warranty_months || 0);
  const warrantyBadge = warrantyMonths >= 36 ? '<span class="badge good">🛡️ 3 anos</span>' : warrantyMonths ? `<span class="badge">🛡️ ${warrantyMonths} meses</span>` : '<span class="badge warn">Garantia n/d</span>';
  const note = (o.warnings || [])[0] || 'Confirma preço, estado e garantia na loja original antes de comprar';
  const state = o.condition || 'a confirmar na loja';
  return `<article class="card" data-offer-card><div class="card-top"><div><h3 title="${escapeAttr(o.title || 'Oferta')}">${escapeHtml(cleanTitle(o.title))}</h3><div class="meta">SKU: ${escapeHtml(skuOf(o))}</div></div><div class="card-status">${warrantyBadge}<span class="state-badge">Estado: ${escapeHtml(state)}</span></div></div><div class="badges"><span class="badge warn">⚠️ ${escapeHtml(note)}</span></div><div class="price-row"><div class="price-box"><small>Recondicionado</small><strong>${eur(o.refurbished_price)}</strong></div><div class="price-box"><small>Novo</small><strong>${eur(o.best_new_price)}</strong></div><div class="price-box"><small>Poupança</small><strong>${eur(o.saving_eur)} · ${o.saving_percent || 0}%</strong></div></div><div class="meta">${escapeHtml(o.store || 'PcComponentes')}</div><div class="actions two-actions"><a class="button primary" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.listing_url || '#')}">Recondicionado</a><a class="button" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.url_new || '#')}">Novo</a></div></article>`;
}
async function offers(){
  if(!__offersCache){
    const res = await fetch(`${base}/data/offers.json`, {cache:'no-cache'});
    const data = await res.json();
    __offersCache = data.offers || [];
  }
  return __offersCache;
}
async function runSearch(q){
  const content = document.querySelector('#page-content');
  const results = document.querySelector('#search-results');
  if(!results || !content) return;
  q = q.trim().toLowerCase();
  if(!q){results.hidden = true; results.innerHTML = ''; content.hidden = false; return;}
  const list = (await offers()).filter(o => [o.title,o.category_label,o.store,o.seller,o.condition,o.brand,o.model].join(' ').toLowerCase().includes(q));
  content.hidden = true; results.hidden = false;
  results.innerHTML = `<div class="section-title full"><h2>Resultados</h2><small>${list.length} ofertas</small></div>` + (list.length ? list.map(offerCard).join('') : '<div class="empty">Sem resultados.</div>');
}
document.addEventListener('input', e => { if(e.target && e.target.id === 'search') runSearch(e.target.value); });
