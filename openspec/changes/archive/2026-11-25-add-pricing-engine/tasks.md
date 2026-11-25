# Tasks

## 1. Definição (até 21/11)

- [ ] 1.1 Reunir com o Diretor Comercial e levantar a fórmula de preço, a regra de arredondamento e os campos de entrada (a proposta inicial está em `proposal.md` e `specs/`) — PENDENTE: o card foi entregue com a fórmula genérica do Blueprint como provisória; a validação vira um change próprio (`update-pricing-formula`)
- [ ] 1.2 Reescrever `specs/budget-pricing/spec.md` com a fórmula aprovada e pelo menos 3 cenários de referência validados pelo Diretor Comercial — PENDENTE: mesmo motivo do 1.1
- [x] 1.3 Validar o change e avisar o Tech Lead no card (verificar: `npx openspec validate add-pricing-engine --strict` passa)

## 2. Suíte de testes (Tech Lead, até 23/11)

- [x] 2.1 Ajustar `pricing-engine.spec.ts` e o contrato em `pricing-engine.ts` ao spec aprovado (verificar: `docker compose exec backend npm test` falha só nos casos de `pricing-engine.spec.ts`)

## 3. Implementação (até 25/11)

- [x] 3.1 Implementar `calculatePrice` sem alterar os testes (verificar: `docker compose exec backend npm test` passa)
- [x] 3.2 Conferir 100% de cobertura de `pricing-engine.ts` (verificar: `docker compose exec backend npm run test:cov`)
- [x] 3.3 Trocar o cálculo local de `prisma/seed.ts` por `calculatePrice` (verificar: `docker compose exec backend npm run db:seed` cria 10 orçamentos)
- [x] 3.4 Atualizar a fórmula no contexto de `openspec/config.yaml`

## Workflow follow-up

- Arquivar o change na própria branch antes do merge: `npx openspec archive add-pricing-engine --yes`
- Marcar o PR como pronto (`gh pr ready`) com "Closes #4" na descrição
