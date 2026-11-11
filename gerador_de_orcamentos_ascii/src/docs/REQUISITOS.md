# Especificação Técnica de Requisitos: Gerador de Orçamentos (SQUAD 4)

## 1. Visão Geral e Modelo de Negócio

O sistema é uma solução *standalone* voltada para unificar o fluxo entre os times de **Projetos** e **Comercial**, substituindo o uso de planilhas dispersas pela consolidação automatizada de propostas e geração instantânea de PDF institucional ASCII.

### Modelo de Precificação Oficial
O motor de cálculo adota estritamente a seguinte composição de preço:

$$\text{Preço Final} = (\text{Horas} \times \text{Custo/Hora}) + \text{Despesas Diretas} + \text{Contingência de Projetos} + \text{Margem de Contribuição}$$

Onde:
* **Custo Direto de Mão de Obra (CDMO):** $\text{Horas Totais} \times \text{Custo/Hora Médio}$.
* **Despesas Diretas ($DD$):** Gastos pontuais alocados diretamente ao projeto (viagens, licenças específicas, infraestrutura temporária, etc.).
* **Contingência de Projetos ($CP$):** Reserva de risco técnico/operacional, calculada como valor fixo ou percentual aplicado sobre a base de custo direto.
* **Margem de Contribuição ($MC$):** Parâmetro comercial de rentabilidade e cobertura indireta da organização sobre a proposta.

---

## 2. Requisitos Funcionais (RF)

### Módulo 1: Calculadora Conjunta & Motor de Regras

#### RF01 - Entrada de Dados Técnicos (Time de Projetos)
* **Descrição:** A interface deve fornecer formulário para a equipe de Projetos inserir as estimativas de esforço e contingência técnica.
* **Campos Obrigatórios:**
  * Nome do Cliente / Identificador do Projeto.
  * Quantidade total de Horas estimadas (ou Sprints convertidas em horas).
  * Parâmetro de Contingência de Projetos (definido em percentual ou valor financeiro direto).
  * Descrição/Detalhamento do escopo ou entregáveis.
* **Critérios de Aceitação:**
  * Não permitir submissão de horas nulas ($\le 0$).
  * A contingência deve aceitar valor $0$ (se não houver risco), mas nunca valores negativos.

#### RF02 - Entrada de Parâmetros Financeiros (Time Comercial)
* **Descrição:** A interface deve fornecer formulário para a equipe Comercial definir custos unitários, custos adicionais e a margem de contribuição.
* **Campos Obrigatórios:**
  * Custo por Hora (taxa horária média adotada pela squad/operação).
  * Despesas Diretas (somatório discriminado ou total de licenças, equipamentos, logística).
  * Margem de Contribuição (definida em valor monetário direto ou taxa percentual aplicável).
* **Critérios de Aceitação:**
  * Custo/Hora deve ser estritamente $> 0$.
  * Despesas Diretas $\ge 0$.
  * Margem de Contribuição não pode gerar preço final deficitário.

#### RF03 - Validação Dinâmica e Tratamento de Erros
* **Descrição:** Validação síncrona no frontend via esquema declarativo (Zod + React Hook Form).
* **Critérios de Aceitação:**
  * Notificação imediata de campos inválidos antes de submeter a requisição.
  * Mascaramento e formatação visual em padrão monetário nacional ($R\$$) e numérico.

#### RF04 - Cálculo Reativo e Prévia de Composição (`POST /api/budgets/calculate`)
* **Descrição:** Endpoint de alta performance para cálculo simulado antes da gravação definitiva.
* **Critérios de Aceitação:**
  * O backend deve decompor e devolver no payload de resposta:
    1. Subtotal de Mão de Obra ($\text{Horas} \times \text{Custo/Hora}$).
    2. Subtotal de Despesas Diretas.
    3. Valor Absoluto da Contingência de Projetos.
    4. Valor Absoluto da Margem de Contribuição.
    5. Preço Final Consolidado.
  * Tempo de resposta do cálculo $\le 200\text{ ms}$.

---

### Módulo 2: Emissão e Renderização de PDF

#### RF05 - Persistência e Emissão do Orçamento (`POST /api/budgets`)
* **Descrição:** Consolidação final dos dados informados, persistindo o registro no banco de dados e acionando o compilador do PDF.
* **Critérios de Aceitação:**
  * Criação de ID único e código de proposta auditável.
  * Retorno com status HTTP `201 Created` contendo os dados gravados e a URL/Blob do PDF gerado.

#### RF06 - Geração de Documento de Alta Fidelidade (Identidade ASCII)
* **Descrição:** Renderização do PDF utilizando engine baseada em HTML/CSS (Chromium headless/Playwright).
* **Estrutura Obrigatória do PDF:**
  1. Cabeçalho com identidade visual, logo ASCII e número de protocolo.
  2. Quadro de informações cadastrais (Cliente, Data de Emissão, Validade).
  3. Tabela discriminada:
    * Estimativa de Horas e Taxa Horária aplicada.
    * Despesas Diretas previstas.
    * Contingência de Projetos aplicada.
    * Preço Final consolidado com Margem de Contribuição incorporada (conforme diretriz de transparência comercial: opção de exibir valor final ou detalhado).
  4. Rodapé corporativo com paginação ("Página X de Y") e notas de conformidade.

#### RF07 - Pré-visualização e Download
* **Descrição:** Modal de visualização imediata do PDF gerado no frontend e botão de download direto.

---

### Módulo 3: Histórico Gerencial e Auditoria

#### RF08 - Listagem de Propostas Emitidas (`GET /api/budgets`)
* **Descrição:** Painel administrativo simples para auditoria das propostas geradas.
* **Campos exibidos na tabela:** ID, Data de Emissão, Cliente/Projeto, Horas Totais, Preço Final, Ações.

#### RF09 - Filtros de Auditoria
* **Descrição:** Busca por nome do cliente/projeto e filtro de período (data inicial e data final).

#### RF10 - Reemissão e Redownload (`GET /api/budgets/{id}/export`)
* **Descrição:** Capacidade de regenerar ou baixar imediatamente o documento PDF original de qualquer orçamento já persistido.

---

## 3. Regras de Negócio (RN)

### RN01 - Aplicação Rigorosa do Algoritmo de Precificação
O backend é a única autoridade para cálculo dos valores finais. A fórmula é dada por:

$$\text{PrecoFinal} = (\text{horas} \times \text{custoHora}) + \text{despesasDiretas} + \text{contingenciaProjetos} + \text{margemContribuicao}$$

* **Caso Contingência seja percentual ($p_{cp}$):** $\text{contingenciaProjetos} = ((\text{horas} \times \text{custoHora}) + \text{despesasDiretas}) \times p_{cp}$.
* **Caso Margem de Contribuição seja percentual ($p_{mc}$):** $\text{margemContribuicao} = (\text{Base Custo} + \text{contingenciaProjetos}) \times p_{mc}$.

### RN02 - Imutabilidade via Snapshot JSONB
Ao emitir o orçamento, todos os parâmetros informados e os valores intermediários calculados devem ser armazenados como snapshot estruturado (JSONB) no banco de dados. Qualquer alteração futura nos custos padrão da empresa não poderá alterar o valor histórico deste orçamento.

### RN03 - Restrições de Domínio Numérico
* $\text{horas} \in \mathbb{R}_{> 0}$
* $\text{custoHora} \in \mathbb{R}_{> 0}$
* $\text{despesasDiretas} \in \mathbb{R}_{\ge 0}$
* $\text{contingenciaProjetos} \in \mathbb{R}_{\ge 0}$
* $\text{margemContribuicao} \in \mathbb{R}_{\ge 0}$

---

## 4. Requisitos Não Funcionais (RNF)

| Identificador | Categoria | Descrição Técnica |
| :--- | :--- | :--- |
| **RNF01** | **Arquitetura** | Arquitetura autônoma (*standalone*), sem dependências síncronas de CRM ou gateways externos no MVP. |
| **RNF02** | **Precisão Numérica** | Toda a aritmética financeira no backend deve ser implementada com `BigDecimal` (escala configurada em 2 casas decimais e arredondamento `RoundingMode.HALF_EVEN`). |
| **RNF03** | **Qualidade & Testes** | O módulo do motor matemático puro deve atingir **100% de cobertura de testes unitários**, incluindo validações de borda e arredondamento. |
| **RNF04** | **Renderização de PDF** | Geração via Headless Browser (Playwright/Chromium) a partir de templates HTML/CSS para garantir fidelidade de tipografia, quebras de página e layout A4. |
| **RNF05** | **Contratos de API** | Todos os endpoints devem seguir especificação OpenAPI 3.0 / Swagger. |
| **RNF06** | **Persistência** | PostgreSQL com tabela principal tipada e coluna `snapshot_parametros` do tipo `JSONB`. |

---

## 5. Contratos de Dados (DTO / Payload)

### 5.1. Requisição de Simulação / Criação (`POST /api/budgets/calculate` e `POST /api/budgets`)

```json
{
  "cliente": "Empresa XPTO",
  "projeto": "Modernização do Portal Web",
  "horas": 160.0,
  "custoHora": 125.00,
  "despesasDiretas": 4500.00,
  "contingenciaProjetos": 2500.00,
  "margemContribuicao": 8000.00
}
```

### 5.2. Resposta Consolidada do Cálculo

```json
{
  "cliente": "Empresa XPTO",
  "projeto": "Modernização do Portal Web",
  "memoriaCalculo": {
    "horas": 160.0,
    "custoHora": 125.00,
    "custoMaoDeObra": 20000.00,
    "despesasDiretas": 4500.00,
    "contingenciaProjetos": 2500.00,
    "margemContribuicao": 8000.00,
    "precoFinal": 35000.00
  },
  "formulaAplicada": "(horas * custoHora) + despesasDiretas + contingenciaProjetos + margemContribuicao"
}
```