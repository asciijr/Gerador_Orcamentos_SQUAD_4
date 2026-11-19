# 0001 — Stack: NestJS no backend e React + Vite no frontend

- **Data:** 18/11/2026
- **Status:** aceita pelo Tech Lead; comunicar ao Diretor de Projetos
- **Card:** #1

## Contexto

O projeto recomeça do zero, seguindo o ASCII Playbook. O Guia de Engenharia (seção 2)
define o backend padrão como Node.js + TypeScript + NestJS e reserva Python + FastAPI
para projetos de IA, dados ou automação. O Gerador de Orçamentos é cadastro, cálculo e
PDF: cai no padrão. O conteúdo anterior do repositório (Java/Spring Boot, fora da stack)
foi removido por completo.

## Decisão

- `backend/`: NestJS 11 + TypeScript, Monolito Modular, Jest, ESLint + Prettier, Prisma 7.
  A versão 11 foi fixada porque o template do NestJS 12 troca Jest/ESLint por
  Vitest/oxlint, e o Playbook exige Jest + ESLint.
- `frontend/`: React + TypeScript + Vite, Atomic Design, Vitest, ESLint + Prettier.
  TypeScript 6.0, porque o typescript-eslint ainda não suporta o TypeScript 7.
- PostgreSQL 16 em container; Prisma Client gerado no `npm install` e ao subir o container.

## Alternativas consideradas

- **Python + FastAPI:** permitido pelo Playbook só para projetos de dados/IA; só um membro do squad usa Python.
- **Manter Java/Spring Boot:** fora da stack oficial; exigiria exceção aprovada pelo Diretor.

## Consequências

Três dos quatro devs já usaram Node; frontend e backend compartilham linguagem e ferramentas.
