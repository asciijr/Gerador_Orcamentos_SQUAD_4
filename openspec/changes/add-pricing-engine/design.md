# Design

## Context

Primeiro código de negócio do backend. Ver proposal.md (Why) e specs/budget-pricing/spec.md.

## Goals / Non-Goals

**Goals:** função pura, determinística e 100% coberta por testes, reaproveitada pelos cards #5 (prévia), #7 (emissão) e pelo seed.

**Non-Goals:** HTTP, banco, esforço em Sprints, formatação em moeda.

## Decisions

- **Arquivo interno do módulo `budgets`:** `backend/src/modules/budgets/pricing-engine.ts`. Outros módulos acessam o cálculo só pelo `BudgetsService` (Monolito Modular).
- **Contrato (fixado pela suíte de testes):**
  - `calculatePrice(input: PricingInput): PricingResult`
  - `PricingInput`: `hours`, `hourlyRate`, `extraExpenses`, `marginPercent`, cada um `string | number`.
  - `PricingResult`: `laborCost`, `extraExpenses`, `totalCost`, `marginValue`, `finalPrice`, todos `string` com duas casas.
  - Erro: `InvalidPricingInputError` com a propriedade `field`.
- **decimal.js em vez de number:** evita erro binário. Arredondar com `toDecimalPlaces(2, Decimal.ROUND_HALF_UP)` e serializar com `toFixed(2)`.
- **Máximo de duas casas nas entradas:** casa com as colunas `DECIMAL(…, 2)` da tabela `budgets`; nada é arredondado em silêncio na entrada.
- **Saída em string:** preserva as duas casas no JSON.

## Risks / Trade-offs

- [Fórmula ainda não validada pelo Comercial] → validar o orçamento de referência na assinatura do Blueprint; se mudar, a suíte é ajustada pelo Tech Lead antes do card começar.
