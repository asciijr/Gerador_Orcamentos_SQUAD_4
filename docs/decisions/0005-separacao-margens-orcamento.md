# 0005 — Separação das margens de contingência e contribuição na tabela `budgets`

- **Data:** 27/11/2026
- **Status:** aceita pelo Tech Lead (hotfix comercial)
- **Card:** #22 (atualiza decisão [0004](0004-persistencia-e-pdf.md))

## Contexto

A decisão [0004](0004-persistencia-e-pdf.md) registrou a tabela `budgets` com a fórmula provisória do Blueprint (`margin_percent`, `total_cost` e `margin_value`). A validação com a área Comercial definiu que o preço é formado sobre o **custo-base** com duas margens independentes: **contingência** (sugestão inicial 30%) e **contribuição** (sugestão inicial 20%).

Como a aplicação ainda não foi lançada e não há dados em produção, a atualização pode substituir diretamente as colunas anteriores por meio de migration versionada.

## Decisão

Substituir na tabela `budgets` (`backend/prisma/schema.prisma`):
- `margin_percent` → `contingency_percent` (`DECIMAL(5, 2)`) e `contribution_percent` (`DECIMAL(5, 2)`)
- `total_cost` → `base_cost` (`DECIMAL(14, 2)`)
- `margin_value` → `contingency_value` (`DECIMAL(14, 2)`) e `contribution_value` (`DECIMAL(14, 2)`)

A migration `20261127120000_update_budget_margins` inicializa os novos campos com `0` antes de aplicar `SET NOT NULL` para não quebrar bancos locais já populados via `db:seed`.

## Consequências

- Motor (`pricing-engine.ts`), seed (`prisma/seed.ts`), frontend (`PriceCalculator` e `services/budgets.ts`) e endpoint de cálculo (card #5) passam a usar o contrato com as duas margens e `baseCost`.
