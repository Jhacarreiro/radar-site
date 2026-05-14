
let __offersCache = null;
const base = (window.REFURB_BASE_PATH || '').replace(/\/$/, '');
const eur = v => (v === null || v === undefined) ? '—' : `${Math.round(Number(v)).toLocaleString('pt-PT')}€`;
const verdictLabel = v => ({excellent:'Excelente', good:'Bom', maybe:'Talvez', avoid:'Evitar'}[v] || '—');
const verdictClass = v => ({excellent:'good', good:'good', maybe:'warn', avoid:'bad'}[v] || '');
function escapeHtml(s){return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function escapeAttr(s){return escapeHtml(s).replace(/'/g, '&#39;');}
function offerCard(o){
  const warrantyMonths = Number(o.warranty_months || 0);
  const warrantyBadge = warrantyMonths >= 36 ? '<span class="badge good">🛡️ 3 anos garantia</span>' : warrantyMonths ? `<span class="badge">🛡️ ${warrantyMonths} meses garantia</span>` : '<span class="badge warn">Garantia n/d</span>';
  const note = (o.warnings || [])[0] || 'Confirma preço, estado e garantia na loja original antes de comprar';
  const warningBadge = `<span class="badge warn">⚠️ ${escapeHtml(note)}</span>`;
  return `<article class="card" data-offer-card><div class="card-top"><div><h3>${escapeHtml(o.title || 'Oferta')}</h3></div><span class="badge ${verdictClass(o.verdict)}">${verdictLabel(o.verdict)}</span></div><div class="badges">${warrantyBadge}${warningBadge}</div><div class="price-row"><div class="price-box"><small>Recond.</small><strong>${eur(o.refurbished_price)}</strong></div><div class="price-box"><small>Novo</small><strong>${eur(o.best_new_price)}</strong></div><div class="price-box"><small>Poupança</small><strong>${eur(o.saving_eur)} · ${o.saving_percent || 0}%</strong></div></div><div class="meta">Vendido por ${escapeHtml(o.seller || o.store || 'loja original')}</div><div class="actions"><a class="button primary" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.listing_url || '#')}">Ver artigo na PcComponentes</a><a class="button" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.url_pt || '#')}">Comparar PT</a><a class="button" target="_blank" rel="nofollow noopener" href="${escapeAttr(o.url_amz || '#')}">Amazon.es</a></div></article>`;
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
