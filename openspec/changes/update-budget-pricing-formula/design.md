# Design

## Context

O motor provisório está em `backend/src/modules/budgets/pricing-engine.ts` e usa `decimal.js` com precisão de 40 dígitos e arredondamento `ROUND_HALF_UP`. A interface (`PriceCalculator`) e o modelo Prisma ainda carregavam um único campo `marginPercent` e uma única `marginValue`. Consulte `proposal.md` para o motivo da mudança e a spec delta para o contrato atualizado.

## Goals / Non-Goals

**Goals:**
- Backend (módulo de domínio `budgets`): separar contingência e contribuição no motor (`pricing-engine.ts`), na validação e no resultado.
- Contrato compartilhado: substituir `marginPercent`, `totalCost` e `marginValue` por `contingencyPercent`, `contributionPercent`, `baseCost`, `contingencyValue` e `contributionValue` em `PricingInput`, `PricingResult` e no serviço frontend `frontend/src/services/budgets.ts`.
- Frontend (organismo `PriceCalculator`): coletar e exibir custo-base e ambas as margens separadamente, com sugestão inicial de `30` e `20`.
- Persistência (Prisma): atualizar o modelo `Budget`, a migration e o seed para armazenar os dois percentuais e os dois valores calculados.

**Non-Goals:**
- Implementar o controller/endpoint HTTP `POST /api/budgets/calculate` (escopo do card #5).
- Alterar o fluxo de projetos, adicionar impostos, descontos, CRM ou PDF.

## Decisions

- **Custo-base arredondado antes das margens:** `laborCost = ARRED(horas × custoHora, 2)` e `baseCost = laborCost + despesasExtras`. Ambos os percentuais são calculados sobre `baseCost` e arredondados separadamente para duas casas (`ROUND_HALF_UP`). Alternativa rejeitada: calcular margens sobre valores não arredondados, pois diverge das planilhas.
- **Preço final por adição:** `finalPrice = baseCost + contingencyValue + contributionValue`. Não há composição entre as margens. Alternativa rejeitada: aplicar `baseCost × (1 + cont) × (1 + contrib)`, que não corresponde à planilha enviada.
- **Contrato explícito:** `PricingInput` passa a conter `contingencyPercent` e `contributionPercent`; `PricingResult` passa a conter `baseCost`, `contingencyValue` e `contributionValue`, removendo `marginPercent`, `totalCost` e `marginValue` enquanto não há dados nem consumidores em produção.
- **Persistência por migration:** substituir `margin_percent`, `total_cost` e `margin_value` por `contingency_percent`, `contribution_percent`, `base_cost`, `contingency_value` e `contribution_value`. Como ainda não há ambiente em produção, a migration inicializa eventuais registros locais (ex.: gerados pelo `db:seed`) com `0` antes de aplicar `SET NOT NULL` e remover as colunas antigas.
- **Defaults da interface:** o frontend sugere `30` em contingência e `20` em contribuição, mas o backend valida ambas como entradas obrigatórias e não aplica defaults implicitamente.

## Risks / Trade-offs

- **Desalinhamento temporário com branch paralela do card #5 →** O endpoint `POST /api/budgets/calculate` (card #5) precisa adotar o novo contrato de `PricingInput` e `PricingResult` ao integrar com a `develop`.
- **Inconsistência de arredondamento →** Todas as parcelas passam pelo mesmo `ROUND_HALF_UP` de duas casas em `pricing-engine.ts`.
- **Mudança no Prisma exige regeneração →** Criar migration versionada e regenerar o Prisma Client (`npx prisma generate`).

## Migration Plan

1. Atualizar `openspec/changes/update-budget-pricing-formula/` e registrar a decisão em `docs/decisions/0005-separacao-margens-orcamento.md`.
2. Atualizar `backend/prisma/schema.prisma`, a migration `20261127120000_update_budget_margins` e `backend/prisma/seed.ts`; regenerar o Prisma Client.
3. Atualizar os testes (`pricing-engine.spec.ts` e `PriceCalculator.test.tsx`, com liberação excepcional do Tech Lead) e o código de produção (`pricing-engine.ts`, `budgets.ts`, `PriceCalculator.tsx`).
4. Validar OpenSpec, lint, typecheck e suítes de testes.
