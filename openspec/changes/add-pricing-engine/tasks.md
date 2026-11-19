# Tasks

## 1. Preparação

- [x] 1.1 Suíte de testes do card e esqueleto do contrato (tipos e `InvalidPricingInputError`) commitados pelo Tech Lead (verificar: `docker compose exec backend npm test` falha só nos casos de `pricing-engine.spec.ts`)

## 2. Implementação

- [ ] 2.1 Implementar a validação das entradas (verificar: casos do bloco "validação" passam)
- [ ] 2.2 Implementar o cálculo com decimal.js e ROUND_HALF_UP (verificar: toda a suíte passa)
- [ ] 2.3 Conferir cobertura de 100% do arquivo (verificar: `docker compose exec backend npm run test:cov` mostra 100% em `pricing-engine.ts`)
- [ ] 2.4 Trocar o cálculo local de `prisma/seed.ts` por `calculatePrice` (verificar: `docker compose exec backend npm run db:seed` cria 10 orçamentos)

## Workflow follow-up

- Arquivar o change na própria branch antes do merge: `npx openspec archive add-pricing-engine`.
- Abrir o PR para a `develop` com "Closes #4".
