# Radar Site

Arquivo público e landing pages para os canais 📡 Radar.

## Stack
- Hugo (static site generator)
- Cloudflare Pages (hosting, deploy automático a cada push)

## Estrutura
```
content/
  news/pt/posts/         ← Edição PT
  financial/pt/posts/    ← Financial Services PT
  companies/sonae/posts/ ← Grupo Sonae
```

## Cada edição
Ficheiro markdown com frontmatter (edition_id, channel, date, slug, items com fontes) e corpo com a mensagem WhatsApp exacta.

## Deploy
Push para `main` → Cloudflare Pages faz build automático com Hugo.

## Domínio
`radar.getrad.ar` (CNAME no DNS do site.eu)
