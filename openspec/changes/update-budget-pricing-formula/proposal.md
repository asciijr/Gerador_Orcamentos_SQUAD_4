# Proposal

Card #22 — `[Budgets] Correção no cálculo do orçamento` · MoSCoW: **Must Have** (motor de regras matemáticas do Documento de Escopo).

## Why

Hotfix urgente da fórmula provisória de orçamento: o cálculo atual aplica uma única margem sobre o custo total, enquanto a regra aprovada pelo Comercial exige separar margem de contingência e margem de contribuição, ambas calculadas sobre o custo-base. A fórmula vigente também não representa a planilha de precificação enviada pela área Comercial.

## What Changes

- Substitui o campo único `marginPercent` por dois campos editáveis: `contingencyPercent` e `contributionPercent`, com `30%` e `20%` como valores sugeridos na interface.
- Atualiza o contrato do cálculo: `custo-base = mão de obra + despesas extras` (`laborCost + extraExpenses`).
- Passa a calcular separadamente: `margem de contingência = custo-base × contingencyPercent / 100` e `margem de contribuição = custo-base × contributionPercent / 100`.
- Calcula `preço final = custo-base + margem de contingência + margem de contribuição`.
- Mantém `decimal.js`, arredondamento `ROUND_HALF_UP` e validação das entradas com até duas casas decimais.
- Atualiza a apresentação do frontend para exibir custo-base e as duas margens separadamente.
- Atualiza o schema Prisma, a migration e o seed para persistir `contingencyPercent`, `contributionPercent`, `baseCost`, `contingencyValue` e `contributionValue` (ainda não há dados em produção).

## Capabilities

### New Capabilities

<!-- Nenhuma capacidade nova. A alteração corrige os requisitos existentes da capacidade de precificação. -->

### Modified Capabilities

- `budget-pricing`: altera a fórmula de preço, a forma das entradas das margens, o arredondamento das parcelas e a composição do preço final.

## Impact

- Backend: `backend/src/modules/budgets/pricing-engine.ts` e suíte Jest `backend/src/modules/budgets/pricing-engine.spec.ts` (autorização excepcional do Tech Lead para ajuste dos testes diante da urgência).
- Contrato de API/serviço: tipos e payloads em `PricingInput`, `PricingResult` e `frontend/src/services/budgets.ts` (o endpoint HTTP `POST /api/budgets/calculate` pertence ao card #5).
- Frontend: componente `PriceCalculator` e sua suíte Vitest em `frontend/src/components/organisms/PriceCalculator/`.
- Banco: `backend/prisma/schema.prisma`, `backend/prisma/seed.ts` e migration `backend/prisma/migrations/20261127120000_update_budget_margins/migration.sql` (sem dados em produção; backfill padrão com `0` para manter compatibilidade com bancos locais populados pelo seed).
- Dependências novas: nenhuma.
- Fora do escopo: endpoint HTTP (card #5), persistência/emissão via API (card #7), impostos, descontos comerciais, integração com CRM, geração de PDF e alteração dos custos/hora fixos.
