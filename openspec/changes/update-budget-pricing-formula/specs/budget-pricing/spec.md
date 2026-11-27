# Spec Delta

## MODIFIED Requirements

### Requirement: Fórmula de preço
O sistema SHALL calcular mão de obra = horas × custo/hora, custo-base = mão de obra + despesas extras, margem de contingência = custo-base × percentual de contingência / 100, margem de contribuição = custo-base × percentual de contribuição / 100 e preço final = custo-base + margem de contingência + margem de contribuição, devolvendo cada parcela. Os percentuais são entradas editáveis do Comercial e usam padrão sugerido de 30% para contingência e 20% para contribuição na interface.

#### Scenario: Orçamento de referência
- **WHEN** horas = 160, custo/hora = 125.00, despesas extras = 4500.00, contingência = 30% e contribuição = 20%
- **THEN** mão de obra = "20000.00", custo-base = "24500.00", margem de contingência = "7350.00", margem de contribuição = "4900.00" e preço final = "36750.00"

#### Scenario: Despesas e margem zeradas
- **WHEN** horas = 10, custo/hora = 50, despesas extras = 0, contingência = 0% e contribuição = 0%
- **THEN** custo-base = "500.00", margem de contingência = "0.00", margem de contribuição = "0.00" e preço final = "500.00"

#### Scenario: Exemplo comercial da planilha
- **WHEN** horas = 5, custo/hora = 5.20, despesas extras = 0, contingência = 30% e contribuição = 20%
- **THEN** mão de obra = "26.00", custo-base = "26.00", margem de contingência = "7.80", margem de contribuição = "5.20" e preço final = "39.00"

#### Scenario: Margens calculadas separadamente sobre o custo-base
- **WHEN** horas = 10, custo/hora = 80.00, despesas extras = 200.00, contingência = 30% e contribuição = 20%
- **THEN** mão de obra = "800.00", custo-base = "1000.00", margem de contingência = "300.00", margem de contribuição = "200.00" e preço final = "1500.00"

### Requirement: Valores com duas casas decimais
O sistema MUST devolver todos os valores monetários como texto com exatamente duas casas decimais, sem erro de ponto flutuante.

#### Scenario: Soma que falharia em ponto flutuante
- **WHEN** horas = 3, custo/hora = 0.10, despesas extras = 0.20, contingência = 30% e contribuição = 20%
- **THEN** mão de obra = "0.30", custo-base = "0.50", margem de contingência = "0.15", margem de contribuição = "0.10" e preço final = "0.75"

### Requirement: Arredondamento meio-para-cima
O sistema MUST arredondar a mão de obra, a margem de contingência e a margem de contribuição para duas casas com ROUND_HALF_UP, como a função ARRED das planilhas, e calcular ambas as margens sobre o custo-base já arredondado.

#### Scenario: Meio centavo sobe
- **WHEN** horas = 0.5, custo/hora = 0.05, despesas extras = 0, contingência = 30% e contribuição = 20% (mão de obra exata = 0.025)
- **THEN** mão de obra = "0.03"

#### Scenario: Margem sobre o custo arredondado
- **WHEN** horas = 0.5, custo/hora = 0.15, despesas extras = 0.02, contingência = 30% e contribuição = 20%
- **THEN** mão de obra = "0.08", custo-base = "0.10", margem de contingência = "0.03", margem de contribuição = "0.02" e preço final = "0.15"

### Requirement: Validação das entradas
O sistema MUST rejeitar o cálculo, informando o campo, quando horas ou custo/hora não forem maiores que zero, quando despesas extras, contingência ou contribuição forem negativas, quando um valor tiver mais de duas casas decimais ou não for numérico finito. O endpoint do card #5 traduz essa rejeição em HTTP 400.

#### Scenario: Horas iguais a zero
- **WHEN** horas = 0
- **THEN** o cálculo é rejeitado apontando o campo "hours"

#### Scenario: Margem negativa
- **WHEN** contingência = -0.01
- **THEN** o cálculo é rejeitado apontando o campo "contingencyPercent"

#### Scenario: Contribuição negativa
- **WHEN** contribuição = -0.01
- **THEN** o cálculo é rejeitado apontando o campo "contributionPercent"

#### Scenario: Mais de duas casas decimais
- **WHEN** custo/hora = 10.123
- **THEN** o cálculo é rejeitado apontando o campo "hourlyRate"

#### Scenario: Valor não numérico
- **WHEN** contingência = "abc", "10,50", vazio ou infinito
- **THEN** o cálculo é rejeitado apontando o campo "contingencyPercent"

#### Scenario: Contribuição não numérica
- **WHEN** contribuição = "abc", "10,50", vazio ou infinito
- **THEN** o cálculo é rejeitado apontando o campo "contributionPercent"
