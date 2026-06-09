#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
ROOT = Path(__file__).resolve().parents[1]
PT = ROOT / 'static/whipit/limited-offers/index.html'
PL = ROOT / 'static/whipit/limited-offers/pl/index.html'
JS = ROOT / 'static/whipit/limited-offers/assets/app.js'
errors=[]

def read(p):
    if not p.exists():
        errors.append(f'missing file: {p}')
        return ''
    return p.read_text(encoding='utf-8')
pt,pl,js = read(PT), read(PL), read(JS)

def ui_keys(html, label):
    m=re.search(r'<script id="limited-offers-ui" type="application/json">(.*?)</script>', html)
    if not m:
        errors.append(f'{label}: missing <script id="limited-offers-ui">')
        return set()
    try:
        data=json.loads(m.group(1))
    except Exception as e:
        errors.append(f'{label}: invalid limited-offers-ui JSON: {e}')
        return set()
    return set(data)
pt_keys, pl_keys = ui_keys(pt,'PT'), ui_keys(pl,'PL')
missing = sorted(pt_keys - pl_keys)
if missing:
    errors.append('PL limited-offers-ui missing keys present in PT: ' + ', '.join(missing))
legacy = ['id="lidl-ui"', "getElementById('lidl-ui')"]
for token in legacy:
    for name, text in [('PT',pt),('PL',pl),('JS',js)]:
        if token in text:
            errors.append(f'{name}: legacy token still present: {token}')
required_pl = ['🇵🇱 Polska', '🇵🇹 Portugal', 'Alerty', 'Utwórz alert', 'Zapisz alert', 'Wyślij kod', 'Moje alerty', 'O mnie', 'Projekty']
for token in required_pl:
    if token not in pl:
        errors.append(f'PL: expected translated UI token missing: {token}')
forbidden_pl = [
    'Alertas', 'Recebe WhatsApp/email', 'Criar alerta', 'Guardar alerta', 'Enviar código',
    'Os meus alertas', 'Pesquisar por produto', 'Todas as marcas', 'Todas as categorias',
    'Última chamada', 'Fora de catálogo', 'Preço mais baixo', 'About me', 'Projects',
    'Limited Deals', 'Super Search', 'Refurbished', 'Nome opcional do alerta',
]
for token in forbidden_pl:
    if token in pl:
        errors.append(f'PL: untranslated/forbidden Portuguese-English UI token present: {token}')
# Runtime strings used by shared JS must be in the UI dict for both locales.
js_i18n_keys = set(re.findall(r"tr\('([^']+)'", js))
missing_pt_runtime = sorted(js_i18n_keys - pt_keys)
missing_pl_runtime = sorted(js_i18n_keys - pl_keys)
if missing_pt_runtime:
    errors.append('PT limited-offers-ui missing JS runtime keys: ' + ', '.join(missing_pt_runtime))
if missing_pl_runtime:
    errors.append('PL limited-offers-ui missing JS runtime keys: ' + ', '.join(missing_pl_runtime))
if errors:
    print('Limited Offers i18n QA failed:')
    for e in errors:
        print('-', e)
    sys.exit(1)
print('Limited Offers i18n QA passed')
