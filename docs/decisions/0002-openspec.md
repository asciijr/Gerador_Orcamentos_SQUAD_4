# 0002 — Adoção do OpenSpec para especificar cada card

- **Data:** 18/11/2026
- **Status:** aceita pelo Tech Lead; comunicar ao Diretor de Projetos
- **Card:** #3 (apresentação ao squad); instalação no #1

## Contexto

O squad é formado majoritariamente por estudantes que usam assistentes de IA. O Playbook
(seções 9 e 10) exige que o comportamento seja definido antes do código e que a IA seja
instruída de forma ancorada, sem decidir regras por conta própria.

O OpenSpec (`@fission-ai/openspec`, licença MIT, verificado no npm em 18/11/2026, versão
2.1.0) guarda, por mudança, uma proposta, requisitos com cenários WHEN/THEN, um design e
uma lista de tarefas, em Markdown dentro do repositório. Ele não faz commits nem mexe no Git.

## Decisão

Adotar o OpenSpec com estas regras de convivência com o Playbook:

1. **Instalação local, nunca global:** `@fission-ai/openspec` fica fixado no
   `package.json` da raiz (como husky e commitlint) e é executado com `npx openspec`.
   Telemetria anônima pode ser desligada com `OPENSPEC_TELEMETRY=0`.
2. **Um change = um card** do Odoo / issue do GitHub. O `tasks.md` é checklist técnico
   do card, não quadro de gestão: status, prazo e horas continuam no Odoo.
3. **TDD preservado:** o Tech Lead/QA escreve a proposta e a suíte de testes do card a
   partir dos cenários WHEN/THEN, commitando os dois na branch do card antes do dev
   começar. Durante o `apply`, é proibido alterar arquivos de teste (regra repetida em
   `openspec/config.yaml` e no `AGENTS.md`).
4. **AGENTS.md continua a fonte única** de diretrizes. O OpenSpec 2.x não edita o
   `AGENTS.md`; ele instala skills em `.agents/skills` e `.claude/skills` (cópias reais, sem links simbólicos, por causa do Windows), versionadas
   no repositório (`skillsScope: project`). `CLAUDE.md` e
   `.github/copilot-instructions.md` apenas apontam para o `AGENTS.md`.
5. **Arquivar dentro do PR:** o change é arquivado (`npx openspec archive <nome>`) na
   própria branch do card, antes do merge, para que nada chegue à `develop` sem PR.
6. **Validação local:** antes do PR, `npx openspec validate --all --strict`. O CI fica exatamente como o
   modelo do Guia de Engenharia (seção 5.3), sem job extra.

## Alternativas consideradas

- **Sem ferramenta, só prompts ancorados no teste (seção 10.2):** continua valendo; o
  OpenSpec apenas padroniza onde a especificação fica.
- **GitHub Spec Kit:** mais pesado e exige Python no host.

## Consequências

- PRs ficam um pouco maiores (Markdown do change); o limite de ~400 linhas considera só código.
- Exige Node.js 22.20 ou superior no host (o LTS atual, Node 24, atende).
