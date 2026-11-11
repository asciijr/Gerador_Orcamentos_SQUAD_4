# Documentação da Stack Tecnológica — Gerador de Orçamentos (SQUAD 4)

## 1. Visão Geral da Arquitetura

O sistema adota o padrão **Standalone Monolítico Desacoplado** (ou Backend REST + Single Page Application), focado em rápida entrega, confiabilidade matemática e alta fidelidade visual na geração de propostas em PDF.

```
+-----------------------------------------------------------+
|                      Camada Frontend                      |
|           React 18 + Vite + Tailwind CSS + shadcn/ui      |
|           Gerenciamento: React Hook Form + Zod            |
+-----------------------------+-----------------------------+
                              | HTTPS / JSON
                              v
+-----------------------------------------------------------+
|                      Camada Backend                       |
|                   Java 21 + Spring Boot 3                 |
|  - Módulo Matemático: Precisão com BigDecimal             |
|  - Módulo de Renderização: Playwright (Headless Chromium) |
+-----------------------------+-----------------------------+
                              | JPA / Hibernate
                              v
+-----------------------------------------------------------+
|                   Persistência de Dados                   |
|                   PostgreSQL 16 (JSONB)                   |
+-----------------------------------------------------------+
```

---

## 2. Tecnologias de Backend

### 2.1. Java 21 & Spring Boot 3
* **Função no Projeto:** Núcleo do processamento de regras de negócio, APIs REST e motor financeiro.
* **Por que foi escolhido:**
  * **Java 21 (LTS):** Suporte a Virtual Threads (Project Loom) para operações de I/O eficientes e tipagem estática rigorosa.
  * **Spring Boot 3.x:** Padrão de mercado para microserviços/standalone APIs, fornecendo injeção de dependências robusta, segurança corporativa e inicialização rápida.
* **Componentes Principais:**
  * `Spring Web`: Exposição dos endpoints REST.
  * `Spring Data JPA`: Abstração de persistência sobre o PostgreSQL.
  * `Spring Validation`: Validação declarativa via anotações (`@NotNull`, `@PositiveOrZero`).

### 2.2. Aritmética de Alta Precisão (`java.math.BigDecimal`)
* **Função no Projeto:** Executar a fórmula de precificação:
  $$\text{Preço Final} = (\text{Horas} \times \text{Custo/Hora}) + \text{Despesas Diretas} + \text{Contingência} + \text{Margem}$$
* **Por que foi escolhido:**
  * Tipos primitivos (`float` e `double`) sofrem com imprecisões de ponto flutuante binário (IEEE 754), inaceitáveis em cálculos comerciais e auditoria financeira.
* **Padrão de Implementação:**
  ```java
  BigDecimal maoDeObra = horas.multiply(custoHora);
  BigDecimal precoFinal = maoDeObra
      .add(despesasDiretas)
      .add(contingenciaProjetos)
      .add(margemContribuicao)
      .setScale(2, RoundingMode.HALF_EVEN);
  ```

### 2.3. Documentação de Contrato: OpenAPI 3 / SpringDoc (Swagger)
* **Função no Projeto:** Geração automática da especificação interativa dos endpoints.
* **Por que foi escolhido:**
  * Permite que o frontend inicie o desenvolvimento com dados mockados a partir do primeiro dia, evitando bloqueios mútuos.

---

## 3. Motor de Renderização de Documentos (PDF)

### 3.1. Playwright (ou Puppeteer) com Headless Chromium
* **Função no Projeto:** Converter templates HTML/CSS dinâmicos em arquivos PDF de alta resolução com identidade visual corporativa (ASCII).
* **Por que foi escolhido:**
  * **Alta Fidelidade Visual:** Permite usar CSS moderno (Flexbox, Grid, tipografia corporativa e paginação com `@page`) idêntico a uma página web.
  * **Manutenibilidade:** Alterar o layout do PDF exige apenas editar HTML/CSS em vez de recalcular coordenadas $X/Y$ via código Java (como em iText ou JasperReports).
* **Configuração de Exportação:**
  * Formato: `A4`
  * Impressão de fundos (`printBackground: true`)
  * Margens controladas: Superior/Inferior $20\text{mm}$, Laterais $15\text{mm}$.

---

## 4. Tecnologias de Frontend

### 4.1. React 18 + Vite
* **Função no Projeto:** Interface do usuário (Single Page Application - SPA).
* **Por que foi escolhido:**
  * **Vite:** Ferramenta de build de última geração com inicialização instantânea e *Hot Module Replacement* (HMR) ultrarrápido.
  * **React:** Ecossistema amplo, modularidade em componentes e reatividade natural para a calculadora de orçamentos.

### 4.2. Tailwind CSS + shadcn/ui
* **Função no Projeto:** Estilização utilitária e conjunto de componentes acessíveis e elegantes.
* **Por que foi escolhido:**
  * Elimina o tempo gasto escrevendo folhas de estilo do zero.
  * Fornece componentes prontos de alto padrão para modais de preview, inputs com máscara, abas e tabelas de auditoria.

### 4.3. React Hook Form + Zod
* **Função no Projeto:** Gerenciamento do estado dos formulários e validação de schema.
* **Por que foi escolhido:**
  * Validação no lado do cliente com respostas visuais instantâneas antes do envio à API.
  * Esquema único tipado compartilhável com TypeScript.

---

## 5. Banco de Dados e Infraestrutura

### 5.1. PostgreSQL 16
* **Função no Projeto:** Banco relacional principal.
* **Por que foi escolhido:**
  * Estabilidade e suporte nativo a colunas **JSONB**.
  * **Estratégia de Snapshot:** Permite gravar uma linha padrão relacional para listagens rápidas (`id`, `cliente`, `valor_total`, `data_emissao`) e salvar o payload bruto completo do cálculo em `snapshot_calculo JSONB`, garantindo auditoria perpétua sem dependência de migrações complexas de tabela.

### 5.2. Docker & Docker Compose
* **Função no Projeto:** Padronização do ambiente de desenvolvimento da squad.
* **Estrutura de Containers Locais:**
  * Container 1: `postgres:16-alpine` (Persistência)
  * Container 2: Instância da API Spring Boot + Dependências do Chromium para Playwright.

---

## 6. Matriz Resumo da Stack

| Camada | Tecnologia | Versão Sugerida | Principal Benefício no Cenário Atual |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Java | 21 (LTS) | Tipagem estática, estabilidade e suporte nativo a `BigDecimal` |
| **Framework Backend** | Spring Boot | 3.3.x | Produtividade REST e contratos automáticos OpenAPI |
| **Frontend Runtime** | Node.js | 20 (LTS) | Suporte ao ecossistema moderno de frontend |
| **Frontend Framework** | React + Vite | 18.x / 5.x | Build instantâneo e renderização reativa da calculadora |
| **Design System** | Tailwind + shadcn/ui | Tailwind v3.x | Componentes de UI profissionais prontos para uso |
| **Formulários/Validação**| React Hook Form + Zod| 7.x / 3.x | Validação em tempo real sem renderizações desnecessárias |
| **Geração de PDF** | Playwright Java | 1.51.0 | Renderização HTML/CSS fiel sem cálculo manual de coordenadas |
| **Banco de Dados** | PostgreSQL | 16-alpine | Recursos relacionais com flexibilidade de snapshots em JSONB |
| **Ambiente Local** | Docker Compose | v2+ | Subida da stack em um único comando (`docker compose up -d`) |