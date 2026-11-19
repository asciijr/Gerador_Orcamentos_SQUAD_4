# 0003 — Dependências aprovadas para o MVP

- **Data:** 18/11/2026
- **Status:** aceita pelo Tech Lead
- **Regra:** Guia de Engenharia, seções 2 e 10 — toda dependência nova é verificada no npm
  e precisa do aval do Tech Lead. Qualquer pacote fora desta lista exige nova aprovação.

## Já instaladas no setup (card #1)

| Pacote | Onde | Para quê |
|---|---|---|
| `prisma`, `@prisma/client`, `@prisma/adapter-pg` | backend | ORM oficial do Playbook e migrations |
| `@faker-js/faker` | backend (dev) | Script `db:seed` |
| `decimal.js` | backend | Aritmética monetária exata |
| `class-validator`, `class-transformer` | backend | Validação dos DTOs com o `ValidationPipe` |
| `vitest`, `@testing-library/*`, `jsdom` | frontend (dev) | Testes de componentes |
| `husky`, `lint-staged`, `@commitlint/*` | raiz (dev) | Git Hooks do Playbook |
| `@fission-ai/openspec` | raiz (dev) | Especificação dos cards (ver 0002) |

## Aprovadas para instalar no card indicado

| Pacote | Card | Observação |
|---|---|---|
| `pdfmake` + `@types/pdfmake` | #9 | Geração do PDF (ver 0004) |

## Fora do MVP (não instalar sem nova decisão)

Tailwind, shadcn/ui, React Hook Form, Zod, React Router (o MVP tem duas telas, alternadas
por estado), `@nestjs/swagger`, Playwright/Puppeteer.
