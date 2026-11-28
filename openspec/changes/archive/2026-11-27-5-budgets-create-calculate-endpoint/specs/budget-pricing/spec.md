# Spec Delta

## MODIFIED Requirements

### Requirement: Validação das entradas
O sistema MUST rejeitar o cálculo, informando o campo, quando horas ou custo/hora não forem maiores que zero, quando despesas extras ou margem forem negativas, quando um valor tiver mais de duas casas decimais ou não for numérico finito. O endpoint `POST /api/budgets/calculate` traduz essa rejeição em HTTP 400.

#### Scenario: Horas iguais a zero
- **WHEN** horas = 0
- **THEN** o cálculo é rejeitado apontando o campo "hours"

#### Scenario: Margem negativa
- **WHEN** margem = -0.01
- **THEN** o cálculo é rejeitado apontando o campo "marginPercent"

#### Scenario: Mais de duas casas decimais
- **WHEN** custo/hora = 10.123
- **THEN** o cálculo é rejeitado apontando o campo "hourlyRate"

#### Scenario: Valor não numérico
- **WHEN** margem = "abc", "10,50", vazio ou infinito
- **THEN** o cálculo é rejeitado apontando o campo "marginPercent"

#### Scenario: Cálculo válido pela API
- **WHEN** o cliente envia um payload válido para `POST /api/budgets/calculate`
- **THEN** a API responde HTTP 200 com as parcelas calculadas em texto com duas casas decimais

#### Scenario: Campo obrigatório ausente pela API
- **WHEN** o cliente omite `client`, `project`, `hours`, `hourlyRate`, `extraExpenses` ou `marginPercent`
- **THEN** a API responde HTTP 400 indicando a validação do campo ausente

#### Scenario: Campo desconhecido pela API
- **WHEN** o cliente envia um campo não declarado no DTO de cálculo
- **THEN** a API responde HTTP 400 por rejeição de campo desconhecido

#### Scenario: Campo numérico inválido pela API
- **WHEN** o cliente envia um valor numérico fora das regras do motor de preço
- **THEN** a API responde HTTP 400 com `statusCode`, `field`, `message` e `fieldErrors` referentes ao campo inválido
