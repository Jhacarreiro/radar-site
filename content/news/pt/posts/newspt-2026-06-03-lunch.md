---
edition_id: newspt-2026-06-03-lunch
channel: newspt
date: 2026-06-03
window: almoço
title: Radar PT - almoço de 3 de junho de 2026
items:
  - title: A Microsoft pôs data no quantum
    primary_source:
      title: How Microsoft's new quantum chip was made 1,000x more reliable with the help of Microsoft Discovery's agentic AI
      url: https://news.microsoft.com/source/features/innovation/majorana-2-microsoft-discovery-agentic-ai/
      publisher: Microsoft
      published_at: 2026-06-02T11:14:07Z
    verification_sources:
      - title: Majorana 2 - Microsoft's scalable quantum processor with reliable, long-lasting qubits
        url: https://www.microsoft.com/en-us/quantum/blog/majorana-2-scalable-quantum-processor-reliable-long-lasting-qubits/
        publisher: Microsoft Azure Quantum
        published_at: 2026-06-02
      - title: Microsoft used agentic AI to make its quantum chip 1,000 times more reliable
        url: https://thenextweb.com/news/microsoft-majorana-2-quantum-chip-agentic-ai-discovery
        publisher: The Next Web
        published_at: 2026-06-02T19:09:02+00:00
    context_sources:
      - title: Microsoft Majorana 1 chip carves new path for quantum computing
        url: https://news.microsoft.com/source/features/innovation/microsofts-majorana-1-chip-carves-new-path-for-quantum-computing/
        publisher: Microsoft
        published_at: 2025
      - title: Microsoft's topological approach faced earlier scrutiny
        url: https://thenextweb.com/news/microsoft-majorana-2-quantum-chip-agentic-ai-discovery
        publisher: The Next Web
        published_at: 2026-06-02T19:09:02+00:00
    wire_copies: []
  - title: Um agente encontrou o bug que todos deixaram passar
    primary_source:
      title: Karpathy's Autoresearch found a 3-year-old bug in our query engine and improved performance by 11%
      url: https://posthog.com/blog/karpathy-autoresearch-query-engine-bug
      publisher: PostHog
      published_at: 2026-06-03T10:17:29Z
    verification_sources:
      - title: Pull request fixing timestamp timezone filtering and ClickHouse primary key use
        url: https://github.com/PostHog/posthog/pull/54819
        publisher: GitHub / PostHog
        published_at: 2026
      - title: Autoresearch
        url: https://github.com/karpathy/autoresearch
        publisher: GitHub / Andrej Karpathy
        published_at: 2026-03
    context_sources:
      - title: Why is my primary key not used? How can I check?
        url: https://clickhouse.com/docs/knowledgebase/why_is_my_primary_key_not_used
        publisher: ClickHouse
        published_at: 2024-12-12
      - title: A simple guide to ClickHouse query optimization
        url: https://clickhouse.com/blog/a-simple-guide-to-clickhouse-query-optimization-part-1
        publisher: ClickHouse
    wire_copies: []
  - title: A China ensaiou o seu Falcon 9
    primary_source:
      title: China's Long March-12B rocket completes successful maiden flight
      url: https://english.news.cn/20260601/07a188c35411425da7236cdaaecee71b/c.html
      publisher: Xinhua
      published_at: 2026-06-01
    verification_sources:
      - title: In a surprise launch, China debuts another big rocket designed for reusability
        url: https://arstechnica.com/space/2026/06/another-falcon-9-lookalike-joins-chinas-growing-roster-of-rockets/
        publisher: Ars Technica
        published_at: 2026-06-02T16:05:48+00:00
      - title: China launches new Long March 12B rocket, reportedly without any safety warning
        url: https://www.livescience.com/space/space-exploration/china-launches-new-long-march-12b-rocket-reportedly-without-any-safety-warning
        publisher: Live Science
        published_at: 2026-06-02T14:56:30+00:00
    context_sources:
      - title: China deploys first satellites for a broadband network to rival Starlink
        url: https://arstechnica.com/space/2024/08/china-deploys-first-satellites-for-a-broadband-network-to-rival-starlink/
        publisher: Ars Technica
        published_at: 2024-08
      - title: China's long-term lunar plans now depend on developing its own Starship
        url: https://arstechnica.com/space/2024/11/chinas-long-term-lunar-plans-now-depend-on-developing-its-own-starship/
        publisher: Ars Technica
        published_at: 2024-11
    wire_copies: []
---
1️⃣ **A Microsoft pôs data no quantum**
A Microsoft apresentou o Majorana 2, um chip quântico com qubits que duram em média 20 segundos, e diz que quer chegar a um computador quântico escalável em 2029.

💡 Porque importa
O quantum vive há anos de promessas longas. Aqui há dois sinais concretos: mais estabilidade no chip e IA a acelerar testes, materiais e medições dentro do laboratório.

☕ Conversa de café
2029 ainda é perto demais para ser ciência ou longe o suficiente para parecer calendário?

---

2️⃣ **Um agente encontrou o bug que todos deixaram passar**
A PostHog deixou um agente de IA correr durante a noite sobre consultas lentas. Encontrou um bug de quase três anos no motor ClickHouse: filtros por data não usavam bem a chave primária.

💡 Porque importa
A correção reduziu em 62% os blocos lidos numa consulta de teste. A parte útil não é a magia: é pôr agentes a medir sistemas reais, com benchmark e revisão humana.

☕ Conversa de café
Quantos bugs só continuam vivos porque já fazem parte da mobília?

---

3️⃣ **A China ensaiou o seu Falcon 9**
A China lançou o Long March 12B, um foguetão de 72 metros preparado para reutilização. Não tentou recuperar o primeiro estágio, mas já voou com a lógica de pernas, grelhas e carga para constelações.

💡 Porque importa
Reutilizar foguetões baixa custos e muda quem consegue pôr satélites em massa no espaço. A corrida deixou de ser só americana; Pequim quer a sua própria máquina de Starlink.

☕ Conversa de café
A pergunta agora é quem copia a forma do Falcon 9 e quem copia mesmo a cadência.
