# Gerador de Orçamentos · ASCII · Squad 4

Ferramenta interna da ASCII (empresa júnior da FACOM/UFU) que une o esforço estimado pelo
time de **Projetos** (horas) aos parâmetros do **Comercial** (custo/hora, despesas extras e
margens de contingência e contribuição), calcula o preço, salva o orçamento, gera o PDF da proposta com a identidade visual
da ASCII e mantém um histórico para auditoria. Aplicação standalone: sem CRM e sem
envio de e-mail no MVP.

## Stack

- **Frontend:** React + TypeScript + Vite (Atomic Design), testes com Vitest
- **Backend:** Node.js LTS + TypeScript + NestJS 11 (Monolito Modular), testes com Jest
- **Banco:** PostgreSQL 16 (container), Prisma para migrations
- **Qualidade:** ESLint + Prettier, Husky + lint-staged + commitlint, GitHub Actions
- **Especificação:** OpenSpec (`openspec/`), ver `docs/decisions/0002-openspec.md`

## Como rodar

Pré-requisitos: Git, Docker com Docker Compose e Node.js LTS (22.20 ou superior) — o
Node local é usado só pelos Git Hooks e pelo OpenSpec (Guia do Membro, seção 2).

```bash
cp .env.example .env          # cria o arquivo de ambiente local (nunca versionado)
npm install                   # na raiz: ativa os Git Hooks e instala o OpenSpec
npm --prefix backend install  # dependências usadas pelos hooks (lint-staged) no backend
npm --prefix frontend install # idem no frontend
docker compose up --build     # sobe banco, backend e frontend; aplica as migrations
```

- Frontend: http://localhost:5173 (mostra "API: online" quando o backend responde)
- Backend: http://localhost:3000/api/health
- PostgreSQL: `localhost:5432` (usuário, senha e banco no `.env`)

## Testes, lint e seed

```bash
docker compose exec backend npm test          # testes unitários do backend (Jest)
docker compose exec backend npm run test:e2e  # testes end-to-end do backend
docker compose exec backend npm run lint
docker compose exec frontend npm test         # testes do frontend (Vitest)
docker compose exec frontend npm run lint
docker compose exec backend npm run db:seed   # popula o banco local com dados fictícios
```

## Estrutura

```text
backend/src/modules/budgets   módulo de orçamentos (cálculo, emissão, histórico)
backend/src/shared            infraestrutura transversal (health, database e, no card #9, pdf)
backend/prisma                schema, migrations e seed do banco
frontend/src/components       atoms, molecules, organisms, templates
frontend/src/pages            páginas ligadas às rotas
frontend/src/services         chamadas à API
openspec/                     especificações e changes por card
docs/decisions/               decisões de arquitetura (ADRs)
```

Módulos de negócio: `budgets`.

## Fluxo de trabalho

Branches `tipo/numero-descricao` a partir da `develop`, commits em Conventional Commits e
PR para a `develop` com o template. Detalhes no ASCII Playbook (Guia de Engenharia).

## Squad

- **Tech Lead:** Mateus Alves Viegas
- **Devs:** Ryan Pablo, Samira Rodrigues, Estevão, Rodrigo
