# Diretrizes para Agentes de IA (ASCII Soluções em Tecnologia)

1. Ambiente: não sugira comandos globais. Execute tudo via Docker Compose.
2. Arquitetura: respeite a separação modular. Não importe arquivos internos
   de outros módulos sem passar pelo serviço público exportado.
3. Segurança: nunca insira senhas ou chaves de API literais no código.
4. Testes: toda implementação deve respeitar os testes unitários existentes,
   sem alterar suas assinaturas ou asserções.
5. Dependências: é proibido instalar pacotes externos sem confirmação prévia.

## Contexto deste repositório

- Projeto: Gerador de Orçamentos (Squad 4). Escopo e prioridades no Blueprint do projeto (Notion).
- Backend NestJS em `backend/` (Monolito Modular: `src/modules/<dominio>`, `src/shared`).
- Frontend React + Vite em `frontend/` (Atomic Design em `src/components`).
- Comandos do projeto rodam no container, por exemplo:
  `docker compose exec backend npm test` e `docker compose exec frontend npm test`.
- Valores monetários usam `decimal.js`, nunca `number`.
- Banco: Prisma em `backend/prisma` (schema, migrations e seed); nunca altere o banco à mão.

## Especificações (OpenSpec)

- Os requisitos de cada card ficam em `openspec/` (changes ativos em `openspec/changes/`,
  especificação consolidada em `openspec/specs/`). Leia o change do card antes de codar.
- O CLI está instalado no repositório: use `npx openspec <comando>` (nunca instale globalmente).
- As regras completas para gerar artefatos estão em `openspec/config.yaml`.
- Um change = um card. Arquivos de teste (`*.spec.ts`, `*.test.tsx`) são escritos pelo
  Tech Lead/QA antes da implementação e não podem ser alterados durante o apply.
