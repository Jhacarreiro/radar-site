# Radar Site

Arquivo publico e landing pages para os canais Radar.
Site: https://getrad.ar

## Stack
- Hugo (static site generator)
- Cloudflare Pages (hosting, deploy automatico a cada push para `main`)

## Estrutura

```
content/
  news/pt/posts/                    <- Radar PT (weight: 1)
  sector/financial/posts/           <- Financial Services PT (weight: 2)
  companies/universo/posts/         <- Universo (weight: 4)
  strategy/finserv/posts/           <- FinServ Strategy PT (weight: 5)
  legacy/companies/sonae/posts/     <- Grupo Sonae (arquivado)
  pricing/                          <- Pagina de precos
```

**Organizacao por seccao:** cada canal vive dentro de uma seccao tematica (`news/`, `sector/`, `companies/`, `strategy/`). Canais arquivados vao para `legacy/` mantendo a mesma hierarquia (ex: `companies/sonae` -> `legacy/companies/sonae`).

Os canais activos aparecem na homepage, ordenados por `weight` (menor = mais acima).
Os canais legacy aparecem em `/legacy/` com disclaimer.

## URLs e redirects

| Canal | URL actual |
|-------|-----------|
| Radar PT | getrad.ar/news/pt/ |
| Financial Services PT | getrad.ar/sector/financial/ |
| Universo | getrad.ar/companies/universo/ |
| FinServ Strategy PT | getrad.ar/strategy/finserv/ |
| Sonae (legacy) | getrad.ar/legacy/companies/sonae/ |

Nao existem aliases nem redirects. URLs antigos nao funcionam — e intencional.

## Edition IDs

**Formato novo (short):**

| Canal | Short | Exemplo |
|-------|-------|---------|
| Radar PT | newspt | newspt-2026-04-07-am |
| Financial Services PT | secfin | secfin-2026-04-07-am |
| Sonae | csonae | csonae-2026-04-07-am |
| Universo | cuniv | cuniv-2026-04-07-am |
| FinServ Strategy | stratfin | stratfin-2026-04-07-am |

**Edition IDs antigos** nos ficheiros ja publicados (rpt-*, fspt-*, sonae-*, univ-*) foram renomeados para o formato novo. Todos os posts seguem agora o formato `{short}-{data}-{window}`.

## Cada edicao

Ficheiro markdown com frontmatter:
- `edition_id`, `channel`, `date`, `title`, `status`
- `items` com fontes verificaveis (primary_source, verification_sources, context_sources)
- Corpo com a mensagem WhatsApp exacta

## Nav

O menu de navegacao esta em `layouts/partials/nav.html`.
Ordem actual: Radar | Pricing | Legacy Channels.

---

## Operacoes — Regras importantes

### Renomear um canal

Renomear NAO e criar um canal novo. E so mudar o nome.

**Checklist:**
1. Alterar `title` no `_index.md` do canal
2. Alterar `meta` no `_index.md` se aplicavel
3. **Verificar que os posts/historico ficam no mesmo directorio** — nao mover, nao apagar
4. Confirmar que nao ficam referencias ao nome antigo (grep no repo inteiro)
5. O directorio da pasta pode manter o nome antigo — os URLs internos nao mudam

**Erro comum:** criar um canal novo vazio e deixar o historico no antigo. Os posts pertencem ao canal, nao ao nome.

### Mover um canal de pasta

Quando um canal muda de seccao:

**Checklist:**
1. Mover a pasta inteira (com posts e _index.md)
2. Criar `_index.md` na seccao pai se nao existir
3. Apagar a pasta antiga (se ficou vazia)

### Arquivar um canal (mover para Legacy)

Quando um canal deixa de publicar e vai para a seccao Legacy:

**Checklist:**
1. Mover a pasta inteira do canal (com posts) para `content/legacy/{seccao}/{canal}/`
   - Exemplo: `content/companies/sonae/` -> `content/legacy/companies/sonae/`
   - Manter a hierarquia original dentro de legacy
2. Criar `_index.md` na seccao intermédia dentro de legacy se nao existir (ex: `legacy/companies/_index.md`)
3. **Remover `whatsapp_url`** do `_index.md` — canais legacy nao tem botao "Subscribe via WhatsApp"
4. Verificar que todos os posts migraram (incluindo os mais recentes que possam ter sido publicados entre o inicio e o fim da operacao)
5. **Adicionar `aliases` a todos os posts** — os links enviados no WhatsApp apontam para o path antigo e ficam partidos apos o arquivo. Para cada post, adicionar no frontmatter:
   ```yaml
   aliases:
     - /{seccao-antiga}/{canal}/posts/{edition_id}/
   ```
   Exemplo (Sonae estava em `companies/sonae/`):
   ```yaml
   aliases:
     - /companies/sonae/posts/csonae-2026-04-06-am/
   ```
   Este e o UNICO caso em que `aliases` sao permitidos no site — exclusivamente em posts de canais arquivados, para preservar links ja enviados no WhatsApp.
6. O canal desaparece automaticamente da homepage (o `index.html` exclui a seccao `legacy`)
7. O canal aparece automaticamente na pagina `/legacy/`

**Notas sobre a pagina Legacy:**
- Tem um disclaimer no topo com duas frases (headline + nota de orgulho)
- Os cards dos canais legacy NAO tem botao WhatsApp (o layout `layouts/legacy/list.html` nao renderiza `whatsapp_url`)
- Canais mais antigos ficam em baixo na pagina (ordenados por weight, maior = mais abaixo)
- O layout legacy percorre `legacy/{seccao}/{canal}` (2 niveis) para encontrar canais com `description`
- O historico/arquivo de cada canal continua acessivel via botao "History"

### Posts

- **Nao usar `slug:` nem `aliases:`** — zero em todo o site
- O URL de cada post e sempre o nome do ficheiro (sem extensao)
- O nome do ficheiro segue o formato `{short}-{data}-{window}.md` (ex: `secfin-2026-04-06-am.md`)
- Na listagem do arquivo, o texto dos links e o **titulo** do post (`.Title`), o href e o nome do ficheiro

## Layouts

| Ficheiro | Responsabilidade |
|----------|-----------------|
| `layouts/index.html` | Homepage — lista canais activos (exclui `pricing` e `legacy`) |
| `layouts/legacy/list.html` | Pagina `/legacy/` (raiz) e sub-paginas legacy |
| `layouts/_default/list.html` | Listagem generica (arquivo de posts) |
| `layouts/_default/single.html` | Post individual com fontes |
| `layouts/partials/nav.html` | Menu de navegacao |
| `layouts/partials/footer.html` | Footer |
| `layouts/pricing/list.html` | Pagina de precos |
| `layouts/_default/baseof.html` | Template base (head, body, CSS) |

## CSS

Ficheiro unico: `static/css/style.css`
- Tema escuro (dark mode por defeito)
- Variaveis CSS em `:root` para cores
- Seccao `.legacy-disclaimer` para o disclaimer dos canais legacy (texto centrado, sem borda lateral)

## Deploy

Push para `main` -> Cloudflare Pages faz build automatico com Hugo.
Dominio: `getrad.ar` (CNAME via Cloudflare Pages)

## Publicacao automatica

Os posts sao publicados automaticamente por um bot que faz commit e push para este repo.
Cada commit de publicacao segue o formato: `pub: [channel_id] [edition_id]`
Os posts vao para a pasta `posts/` dentro do directorio do canal respectivo.

**Atencao:** durante operacoes de migracao/arquivo, verificar se o bot nao publicou posts novos entre o inicio e o fim da operacao. Posts publicados no path antigo precisam de ser movidos manualmente.
