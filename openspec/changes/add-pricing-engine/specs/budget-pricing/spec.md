## Purpose

Calcular o preço de um orçamento da ASCII de forma exata e padronizada, a partir do esforço
estimado por Projetos e dos parâmetros financeiros do Comercial.

## ADDED Requirements

### Requirement: Fórmula de preço
O sistema SHALL calcular mão de obra = horas × custo/hora, custo total = mão de obra + despesas extras, valor da margem = custo total × margem % / 100 e preço final = custo total + valor da margem, devolvendo cada parcela.

#### Scenario: Orçamento de referência
- **WHEN** horas = 160, custo/hora = 125.00, despesas extras = 4500.00 e margem = 20%
- **THEN** mão de obra = "20000.00", custo total = "24500.00", valor da margem = "4900.00" e preço final = "29400.00"

#### Scenario: Despesas e margem zeradas
- **WHEN** horas = 10, custo/hora = 50, despesas extras = 0 e margem = 0
- **THEN** custo total = "500.00", valor da margem = "0.00" e preço final = "500.00"

### Requirement: Valores com duas casas decimais
O sistema MUST devolver todos os valores monetários como texto com exatamente duas casas decimais, sem erro de ponto flutuante.

#### Scenario: Soma que falharia em ponto flutuante
- **WHEN** horas = 3, custo/hora = 0.10, despesas extras = 0.20 e margem = 10%
- **THEN** mão de obra = "0.30", custo total = "0.50", valor da margem = "0.05" e preço final = "0.55"

### Requirement: Arredondamento meio-para-cima
O sistema MUST arredondar a mão de obra e o valor da margem para duas casas com ROUND_HALF_UP, como a função ARRED das planilhas, e calcular a margem sobre o custo total já arredondado.

#### Scenario: Meio centavo sobe
- **WHEN** horas = 0.5 e custo/hora = 0.05 (mão de obra exata = 0.025)
- **THEN** mão de obra = "0.03"

#### Scenario: Margem sobre o custo arredondado
- **WHEN** horas = 0.5, custo/hora = 0.15, despesas extras = 0.02 e margem = 5%
- **THEN** mão de obra = "0.08", custo total = "0.10", valor da margem = "0.01" e preço final = "0.11"

### Requirement: Validação das entradas
O sistema MUST rejeitar o cálculo, informando o campo, quando horas ou custo/hora não forem maiores que zero, quando despesas extras ou margem forem negativas, quando um valor tiver mais de duas casas decimais ou não for numérico finito. O endpoint do card #5 traduz essa rejeição em HTTP 400.

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
