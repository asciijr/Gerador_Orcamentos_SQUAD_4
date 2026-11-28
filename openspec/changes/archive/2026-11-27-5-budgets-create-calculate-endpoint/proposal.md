# Proposal

Card #5 — `[Budgets] Criar endpoint POST /api/budgets/calculate` · MoSCoW: **Must Have** (prévia de preço do Documento de Escopo).

## Why

Projetos e Comercial precisam obter a prévia do preço pelo backend, reutilizando a fórmula já implementada pelo motor de orçamento. O endpoint HTTP expõe essa capacidade para o frontend e devolve validações observáveis para o chamador.

## What Changes

- Cria `POST /api/budgets/calculate`, com prefixo global `/api`, e retorna HTTP 200 para entradas válidas.
- Recebe `client`, `project`, `hours`, `hourlyRate`, `extraExpenses` e `marginPercent` pelo DTO.
- Delega o cálculo ao `BudgetsService`, que reutiliza o motor público de preços do módulo `budgets`.
- Retorna HTTP 400 para campos obrigatórios, tipos inválidos, desconhecidos e valores numéricos inválidos, indicando o campo afetado quando aplicável.
- Mantém os valores monetários como texto com duas casas decimais e sem `number`/`float`.

**Fora do escopo:** persistência do orçamento, geração de PDF, autenticação, histórico de cálculos, formatação visual em R$ no frontend e mudanças na fórmula provisória do cálculo.

**Dependências novas:** nenhuma. Nenhum pacote externo foi instalado.

## Capabilities

### New Capabilities
Nenhuma.

### Modified Capabilities
- `budget-pricing`: adiciona o contrato observável do endpoint HTTP de cálculo e seus códigos de resposta.

## Impact

- Backend, módulo de domínio `budgets`: `budgets.controller.ts`, `budgets.service.ts`, `dto/calculate-budget.dto.ts` e `budgets.module.ts`.
- API afetada: `POST /api/budgets/calculate`.
- Testes e2e: `backend/test/budgets.e2e-spec.ts`, escritos pelo Tech Lead/QA antes da implementação e não modificados durante o apply.
