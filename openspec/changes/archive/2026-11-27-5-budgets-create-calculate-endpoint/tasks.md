# Tasks

## 1. Suíte de testes do card commitada pelo Tech Lead/QA

- [x] 1.1 Criar os casos e2e de sucesso, números válidos, entradas inválidas, campos obrigatórios e campos desconhecidos em `backend/test/budgets.e2e-spec.ts` (verificar: o arquivo está em uma revisão anterior à implementação e os testes cobrem o contrato HTTP)

## 2. Contrato HTTP do backend

- [x] 2.1 Criar `CalculateBudgetDto` no módulo de domínio `budgets` com validação de cliente, projeto e campos definidos (verificar: requisições inválidas retornam HTTP 400)
- [x] 2.2 Registrar `BudgetsController` com `POST /budgets/calculate` e status 200 no prefixo global `/api` (verificar: `POST /api/budgets/calculate` responde 200 para payload válido)
- [x] 2.3 Implementar `BudgetsService.calculate` delegando ao motor de preço e convertendo `InvalidPricingInputError` em `BadRequestException` estruturada (verificar: o campo inválido aparece na resposta 400)
- [x] 2.4 Registrar os serviços e o controller no `BudgetsModule` mantendo `BudgetsService` como interface pública (verificar: um módulo consumidor consegue resolver `BudgetsService`)

## 3. Integração e verificação

- [x] 3.1 Executar a suíte e2e dentro do Docker Compose (verificar: `docker compose exec backend npm test` passa)
- [x] 3.2 Validar todos os artefatos OpenSpec em modo estrito (verificar: `npx openspec validate 5-budgets-create-calculate-endpoint --strict` passa)
- [x] 3.3 Arquivar o change na própria branch antes do merge (verificar: o change aparece em `openspec/changes/archive/` e a spec consolidada contém o contrato atualizado)

## Workflow follow-up

- Marcar o PR como pronto com a referência `Closes #5` na descrição.
