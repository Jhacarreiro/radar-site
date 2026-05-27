---
edition_id: "newspt-2026-05-27-lunch"
channel: "newspt"
date: "2026-05-27"
title: "Radar | Edição PT - almoço"
window: "almoço"
items:
  - title: "Uma falha pequena abriu a porta aos agentes de IA"
    primary_source:
      title: "BadHost CVE-2026-48710"
      url: "https://badhost.org/"
      publisher: "BadHost"
    verification_sources:
      - title: "Missing Host header validation poisons request.url.path, bypassing path-based security checks"
        url: "https://github.com/Kludex/starlette/security/advisories/GHSA-86qp-5c8j-p5mr"
        publisher: "GitHub Security Advisory"
      - title: "CVE-2026-48710"
        url: "https://security-tracker.debian.org/tracker/CVE-2026-48710"
        publisher: "Debian Security Tracker"
    context_sources:
      - title: "Millions of AI agents imperiled by critical vulnerability in open source package"
        url: "https://arstechnica.com/information-technology/2026/05/millions-of-ai-agents-imperiled-by-critical-vulnerability-in-open-source-package/"
        publisher: "Ars Technica"
    wire_copies: []
  - title: "A IA que encontra falhas já está a ficar fechada"
    primary_source:
      title: "Too dangerous to release: is Mythos the start of the restricted-AI era?"
      url: "https://www.nature.com/articles/d41586-026-01617-2"
      publisher: "Nature"
    verification_sources:
      - title: "Project Glasswing: Securing critical software for the AI era"
        url: "https://www.anthropic.com/glasswing"
        publisher: "Anthropic"
      - title: "Our evaluation of Claude Mythos Preview's cyber capabilities"
        url: "https://www.aisi.gov.uk/blog/our-evaluation-of-claude-mythos-previews-cyber-capabilities"
        publisher: "AI Security Institute"
    context_sources:
      - title: "Claude Mythos explained: Is Anthropic's most powerful AI model really too dangerous to release to the public?"
        url: "https://www.livescience.com/technology/artificial-intelligence/claude-mythos-explained-is-anthropics-most-powerful-ai-model-really-too-dangerous-to-release-to-the-public"
        publisher: "Live Science"
    wire_copies: []
  - title: "As pernas de robô ficaram menos de laboratório"
    primary_source:
      title: "3D-printable humanoid legs let robotics experiments run wild"
      url: "https://arstechnica.com/ai/2026/05/3d-printable-humanoid-legs-let-robotics-experiments-run-wild/"
      publisher: "Ars Technica"
    verification_sources:
      - title: "Hugging Face unveils two new humanoid robots"
        url: "https://techcrunch.com/2025/05/29/hugging-face-unveils-two-new-humanoid-robots/"
        publisher: "TechCrunch"
      - title: "Want a humanoid, open source robot for just $3,000? Hugging Face is on it."
        url: "https://arstechnica.com/ai/2025/05/hugging-face-hopes-to-bring-a-humanoid-robot-to-market-for-just-3000/"
        publisher: "Ars Technica"
    context_sources:
      - title: "Demonstrating Berkeley Humanoid Lite: An Open-source, Accessible, and Customizable 3D-printed Humanoid Robot"
        url: "https://huggingface.co/papers/2504.17249"
        publisher: "Hugging Face Papers"
    wire_copies: []
---
1️⃣ **Uma falha pequena abriu a porta aos agentes de IA**
A falha BadHost, no Starlette, permite contornar autenticação baseada em caminhos quando uma app usa request.url para decidir acessos. O risco chega a FastAPI, vLLM, LiteLLM, servidores MCP e painéis de agentes.

💡 Porque importa
Muita infraestrutura de IA corre em Python e foi montada depressa. A correção é atualizar o Starlette para 1.0.1 ou rever middleware de autenticação.

☕ Conversa de café
Quantas equipas têm agentes expostos na internet e só agora vão descobrir que o middleware era a fechadura?

---

2️⃣ **A IA que encontra falhas já está a ficar fechada**
A Nature voltou ao caso Claude Mythos: a Anthropic diz que o modelo encontrou milhares de vulnerabilidades e por isso só o abriu a parceiros do Project Glasswing, não ao público.

💡 Porque importa
O AISI britânico mediu 73% de sucesso em tarefas cyber de nível perito. A questão já não é só lançar modelos melhores, é quem fica com acesso.

☕ Conversa de café
Se a ferramenta é perigosa demais para todos, quem escolhe a lista dos que podem usá-la?

---

3️⃣ **As pernas de robô ficaram menos de laboratório**
A Hugging Face lançou o LeRobot Humanoid, uma plataforma bípede de 2.500 dólares com peças 3D, componentes comuns e ficheiros abertos para montagem, controlo e simulação.

💡 Porque importa
Não é um robot doméstico. É hardware barato para investigadores testarem software de robótica em corpos reais, fora do ecrã.

☕ Conversa de café
Com pernas a 2.500 dólares, quanto tempo falta para o problema deixar de ser comprar o robô e passar a ser ensiná-lo?
