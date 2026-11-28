# Design

## Context

Consulte `proposal.md` para a motivação. O motor de cálculo já existe no módulo de domínio `budgets` e expõe `calculatePrice` internamente; o contrato público necessário para outros consumidores é `BudgetsService`.

## Goals / Non-Goals

**Goals:**
- Expor o cálculo por HTTP sem duplicar a fórmula ou validação numérica.
- Validar metadados do orçamento e campos desconhecidos antes da execução do serviço.
- Preservar a interface pública do módulo `budgets` e os tipos monetários em texto.

**Non-Goals:**
- Persistência, autenticação, geração de PDF, histórico ou formatação em R$.
- Alteração da fórmula provisória ou das regras do motor de preço.

## Decisions

- **Camada HTTP no módulo `budgets` (backend):** `BudgetsController` recebe o DTO, aplica o prefixo global `api` e delega a execução ao `BudgetsService`. Alternativa descartada: calcular diretamente no controller, pois espalharia lógica de domínio e impediria reutilização por outros módulos.
- **DTO no módulo `budgets` (backend):** `CalculateBudgetDto` usa `class-validator` para `client` e `project` e marca os campos numéricos como definidos. Alternativa: aceitar `any` seria incompatível com a validação explícita e permitiria payloads frágeis.
- **Adaptação de erros no serviço (backend):** `BudgetsService` converte `InvalidPricingInputError` em `BadRequestException` com corpo estruturado. A alternativa de retornar a exceção do motor daria ao cliente uma resposta não padronizada.
- **Integração com motor existente:** o cálculo continua em `pricing-engine.ts`; o serviço só adapta o DTO e trata erros. Isso evita duplicar a fórmula e preserva `decimal.js`.
- **Validação global:** `ValidationPipe` do Nest valida DTO, remove campos permitidos e rejeita campos não declarados conforme os testes e2e.

## Risks / Trade-offs

- [Validação incompleta de tipos numéricos pelo DTO] → `BudgetsService` verifica o tipo de cada campo antes de chamar o motor e traduz os erros específicos.
- [Contrato monetário serializado como texto] → mantém precisão decimal no JSON; o frontend deve continuar tratando esses valores como texto até uma decisão futura.
- [Mudança futura da fórmula] → permanece isolada em `pricing-engine.ts`, sem necessidade de alterar o controller ou o DTO.

## Migration Plan

Sem migration de banco ou mudança de dependências. A implantação adiciona apenas rota NestJS dentro do módulo existente. Rollback: remover o endpoint e a associação do módulo, mantendo o motor e os testes existentes.
