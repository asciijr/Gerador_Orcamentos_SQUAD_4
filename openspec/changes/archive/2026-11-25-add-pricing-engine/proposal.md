# Proposal

Card #4 — `[Budgets] Implementar motor de cálculo de preço` · MoSCoW: **Must Have** (motor de regras matemáticas do Documento de Escopo).

## Why

Comercial e Projetos cruzam horas e custos em planilhas para montar cada proposta. O motor de
cálculo padroniza a formação do preço e é a base de todo o MVP (prévia, emissão, PDF e
histórico). É o incremento que o squad demonstra em 27/11.

## What Changes

- Novo cálculo de preço no módulo `budgets`, puro (sem banco, sem HTTP):
  mão de obra = horas × custo/hora; custo total = mão de obra + despesas extras;
  valor da margem = custo total × margem % / 100; preço final = custo total + valor da margem.
- Devolve cada parcela e o preço final com exatamente 2 casas decimais.
- Rejeita entradas inválidas indicando o campo.

**Fora do escopo:** endpoint HTTP (card #5), persistência (card #7), esforço em Sprints
(card #15, Should Have), formatação em R$ (frontend).

**Dependências novas:** nenhuma. Usa `decimal.js`, aprovado em `docs/decisions/0003-dependencias-aprovadas.md`.

## Capabilities

### New Capabilities
- `budget-pricing`: cálculo do preço de um orçamento a partir de horas, custo/hora, despesas
  extras e margem percentual, com regras de arredondamento e validação.

### Modified Capabilities
<!-- nenhuma -->

## Impact

- Código: `backend/src/modules/budgets/pricing-engine.ts` (arquivo interno do módulo).
- Testes: `backend/src/modules/budgets/pricing-engine.spec.ts`, escritos pelo Tech Lead antes da
  implementação, junto com o esqueleto do contrato.
- `backend/prisma/seed.ts` passa a usar este cálculo.
