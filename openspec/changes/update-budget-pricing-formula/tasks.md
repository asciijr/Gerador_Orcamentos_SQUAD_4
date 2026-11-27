# Tasks

## 1. Contrato da fórmula

- [x] 1.1 Suíte de testes do card atualizada com autorização do Tech Lead, cobrindo fórmula, validação e arredondamento para contingência e contribuição separadas em `pricing-engine.spec.ts` e `PriceCalculator.test.tsx`.

## 2. Persistência

- [x] 2.1 Atualizar `backend/prisma/schema.prisma` e criar migration Prisma (`20261127120000_update_budget_margins`) para `contingencyPercent`, `contributionPercent`, `baseCost`, `contingencyValue` e `contributionValue`, com inicialização segura para bancos locais antes do `SET NOT NULL`.
- [x] 2.2 Atualizar `backend/prisma/seed.ts` e regenerar o Prisma Client para os novos campos.

## 3. Backend

- [x] 3.1 Atualizar `PricingInput`, `PricingResult` e `applyPricingFormula` no módulo `budgets` (`pricing-engine.ts`) com as duas margens sobre o custo-base e arredondamento `ROUND_HALF_UP`.
- [x] 3.2 Atualizar a validação em `parseInput` para rejeitar percentuais negativos, entradas não numéricas e valores com mais de duas casas em `contingencyPercent` e `contributionPercent`.
- [x] 3.3 Executar a suíte de testes, lint e typecheck do backend (`npm --prefix backend test`, `lint`, `tsc --noEmit`).

## 4. Frontend

- [x] 4.1 Atualizar os tipos e o payload do serviço em `frontend/src/services/budgets.ts` para enviar `contingencyPercent` e `contributionPercent` e receber `baseCost`, `contingencyValue` e `contributionValue`.
- [x] 4.2 Atualizar o organismo `PriceCalculator` para aceitar contingência (padrão 30%) e contribuição (padrão 20%) e exibir custo-base, parcelas e preço final.
- [ ] 4.3 Executar a suíte frontend dentro do container Docker (`docker compose exec frontend npm test`, `lint` e `typecheck`) após subir os containers.

## 5. Documentação e validação final

- [x] 5.1 Atualizar `openspec/config.yaml`, `README.md` e registrar a decisão em `docs/decisions/0005-separacao-margens-orcamento.md`.
- [ ] 5.2 Validar o cenário de referência (`horas = 5`, `custo/hora = 5.20`, `despesas extras = 0`, `contingência = 30%`, `contribuição = 20%` → `custo-base = R$ 26,00` e `preço final = R$ 39,00`) após integração com o endpoint do card #5.
- [x] 5.3 Executar `npx openspec validate --all --strict`.

## Workflow follow-up

- Arquivar o change dentro da própria branch antes do merge (`npx openspec archive update-budget-pricing-formula --yes`) quando o card for concluído.
