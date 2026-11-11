# Documentação de Arquitetura de Software — Gerador de Orçamentos (SQUAD 4)

## 1. Visão Geral e Contexto Arquitetural

O **Gerador de Orçamentos** é concebido como uma aplicação **Standalone** (autônoma), sem integrações síncronas com CRM corporativo ou servidores de disparo de e-mails neste ciclo de MVP.

O objetivo arquitetural primordial é:
1. **Garantir Confiabilidade Numérica:** Processamento de regras financeiras através de um motor desacoplado com aritmética de precisão arbitrária.
2. **Garantir Fidelidade Visual na Emissão de Documentos:** Pipeline de renderização HTML/CSS-to-PDF via navegador headless, assegurando fidelidade à identidade corporativa ASCII.
3. **Auditabilidade Estrita:** Armazenamento imutável dos cálculos por meio de snapshots de parâmetros.

```
                      +-----------------------------+
                      |     Navegador do Usuário    |
                      |   (Comercial / Projetos)    |
                      +--------------+--------------+
                                     |
                                     | HTTPS / REST
                                     v
+-------------------------------------------------------------------------+
|                  GERADOR DE ORÇAMENTOS (STANDALONE)                     |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                 Frontend SPA (React 18 + Vite)                    |  |
|  |  [Formulário Projetos] [Formulário Comercial] [Painel Histórico]  |  |
|  +-----------------------------------+-------------------------------+  |
|                                      |                                  |
|                                      | REST / JSON / HTTP Multipart     |
|                                      v                                  |
|  +-------------------------------------------------------------------+  |
|  |                 Backend API (Java 21 + Spring Boot 3)             |  |
|  |                                                                   |  |
|  |   +-----------------------+           +-----------------------+   |  |
|  |   |    Pricing Service    |           |     PDF Renderer      |   |  |
|  |   | (Motor Matemático Puro|           |  (Playwright Browser  |   |  |
|  |   |     via BigDecimal)   |           |       Headless)       |   |  |
|  |   +-----------+-----------+           +-----------+-----------+   |  |
|  |               |                                   |               |  |
|  |               +-----------------+-----------------+               |  |
|  |                                 |                                 |  |
|  |                                 v                                 |  |
|  |                     [Camada de Persistência JPA]                  |  |
|  +---------------------------------+---------------------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     | JDBC / TCP (Porta 5432)
                                     v
                      +-----------------------------+
                      |   PostgreSQL 16 (Relacional |
                      |    + Snapshot JSONB)        |
                      +-----------------------------+
```

---

## 2. Decisões Arquiteturais Fundamentais (ADRs)

### ADR-01: Arquitetura Standalone com Backend Desacoplado
* **Contexto:** Necessidade de cumprir o prazo do MVP recuperando duas semanas de atraso.
* **Decisão:** Eliminar integrações de CRM e mensageria de e-mail no MVP. Toda a aplicação opera em contêineres próprios com banco de dados dedicado.
* **Consequência:** Redução drástica da dependência externa e eliminação de falhas em cascata de serviços de terceiros.

### ADR-02: Isolamento do Motor Matemático
* **Contexto:** Risco de inconsistências fiscais e financeiras causadas por regras distribuídas ou truncamento de ponto flutuante.
* **Decisão:** O motor de cálculo é um serviço de domínio puro (`PricingEngineService`), sem efeitos colaterais de banco de dados ou renderização, utilizando `BigDecimal` com escala fixa de 2 casas decimais e arredondamento `HALF_EVEN`.
* **Consequência:** Capacidade de testar 100% dos cenários numéricos de forma determinística e ultrarrápida em testes unitários.

### ADR-03: Renderização de Documento via Headless Chromium (Playwright)
* **Contexto:** A proposta requer alta fidelidade estética (layout corporativo ASCII, quebras de página, tabelas e tipografia específica).
* **Decisão:** Descartar bibliotecas procedurais de coordenadas (iText/PDFBox cru) e utilizar renderização baseada em template HTML/CSS processado por headless browser.
* **Consequência:** Desenvolvimento do template visual em HTML/CSS padrão com visualização rápida no navegador e renderização 1:1 para documento final.

### ADR-04: Persistência por Snapshot em JSONB
* **Contexto:** Se a política de precificação, tributos ou custos/hora padrão da empresa mudar no futuro, os orçamentos emitidos no passado não podem ser recalculados nem desconfigurados.
* **Decisão:** Além das colunas relacionais principais para filtros e busca (`id`, `cliente`, `valor_total`, `data_emissao`), persistir um campo `snapshot_calculo` (`JSONB`) que armazena a foto estrita de todas as entradas, intermediários e totais.
* **Consequência:** Auditoria imutável nativa no banco de dados.

---

## 3. Decomposição Modular e Fluxo de Dados

### 3.1. Visão de Camadas do Backend

```
[Controller Layer]
  ├── BudgetController (POST /api/budgets/calculate, POST /api/budgets, GET /api/budgets, GET /api/budgets/{id}/pdf)
  └── RestExceptionHandler (Tratamento padronizado de Bean Validation e Business Exceptions)
          │
          ▼
[Domain / Service Layer]
  ├── PricingEngineService (Aritmética pura e aplicação da fórmula oficial)
  ├── BudgetManagementService (Orquestração: Cálculo -> Persistência -> Acionamento PDF)
  └── PdfGenerationService (Interpolação de Template + Playwright Chromium Driver)
          │
          ▼
[Infrastructure / Repository Layer]
  ├── BudgetRepository (Spring Data JPA)
  └── Entidade JPA `BudgetEntity` com conversor para JSONB
```

### 3.2. Fluxo Sequencial de Emissão e Geração do PDF

```
Usuário (UI)         BudgetController        PricingEngineService   BudgetRepository     PdfRendererService
     │                      │                         │                    │                     │
     ├─ Preenche Form ────> │                         │                    │                     │
     │                      ├─ POST /api/budgets ───> │                    │                     │
     │                      │  (DTO)                  │                    │                     │
     │                      │                         │                    │                     │
     │                      ├─ calculate(dto) ──────> │                    │                     │
     │                      │ <── MemoriaCalculo ─────┤                    │                     │
     │                      │                                              │                     │
     │                      ├─ save(entity + snapshot JSONB) ────────────> │                     │
     │                      │ <── persistedEntity ─────────────────────────┤                     │
     │                      │                                                                    │
     │                      ├─ renderPdf(persistedEntity) ─────────────────────────────────────> │
     │                      │                                                                    ├─ Injeta HTML
     │                      │                                                                    ├─ Page.pdf()
     │                      │ <── byte[] (PDF) ──────────────────────────────────────────────────┤
     │                      │
     │ <── HTTP 201 Created ┤ (Retorna DTO consolidado com metadados e URI do PDF)
     │
```

---

## 4. Modelo de Dados

### 4.1. Diagrama Entidade-Relacionamento Lógico

```
+------------------------------------------------------------------------+
|                                budgets                                 |
+------------------------------------------------------------------------+
| id                   : UUID           [PK, NOT NULL]                   |
| numero_protocolo     : VARCHAR(30)    [UNIQUE, NOT NULL, INDEX]        |
| cliente_nome         : VARCHAR(150)   [NOT NULL, INDEX]                |
| projeto_nome         : VARCHAR(150)   [NOT NULL]                       |
| data_emissao         : TIMESTAMPTZ    [NOT NULL, DEFAULT NOW()]        |
| status               : VARCHAR(20)    [NOT NULL]                       |
| horas_totais         : NUMERIC(10,2)  [NOT NULL]                       |
| custo_hora           : NUMERIC(12,2)  [NOT NULL]                       |
| despesas_diretas     : NUMERIC(12,2)  [NOT NULL]                       |
| contingencia_projeto : NUMERIC(12,2)  [NOT NULL]                       |
| margem_contribuicao  : NUMERIC(12,2)  [NOT NULL]                       |
| preco_final          : NUMERIC(14,2)  [NOT NULL]                       |
| snapshot_calculo     : JSONB          [NOT NULL]                       |
+------------------------------------------------------------------------+
```

### 4.2. Estrutura Interna da Coluna `snapshot_calculo` (JSONB)

```json
{
  "versao_motor": "1.0.0",
  "data_processamento": "2026-10-27T10:30:00Z",
  "parametros_entrada": {
    "horas": 160.0,
    "custo_hora": 125.00,
    "despesas_diretas": 4500.00,
    "contingencia_projetos": 2500.00,
    "margem_contribuicao": 8000.00
  },
  "subtotais": {
    "custo_mao_de_obra": 20000.00,
    "custo_direto_total": 24500.00,
    "custo_com_contingencia": 27000.00
  },
  "resultado_final": {
    "preco_final": 35000.00
  },
  "formula_descritiva": "(horas * custoHora) + despesasDiretas + contingenciaProjetos + margemContribuicao"
}
```

---

## 5. Especificação de Integração de APIs

| Método | Endpoint | Papel | Payload Entrada | Resposta |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/budgets/calculate` | Simulação em tempo real | DTO com dados de entrada | DTO com memória de cálculo decomposta |
| `POST` | `/api/budgets` | Emissão e persistência | DTO com dados de entrada e cabeçalho | Registro persistido com ID e resumo |
| `GET` | `/api/budgets` | Consulta ao histórico | Query params: `page`, `size`, `cliente`, `dataInicio`, `dataFim` | Página de registros resumidos |
| `GET` | `/api/budgets/{id}/pdf` | Recuperação do documento | Path param `id` | Stream binário `application/pdf` |

---

## 6. Estratégia de Deploy e Topologia de Infraestrutura

A aplicação é orquestrada através de contêineres Docker, possibilitando execução idêntica em ambiente de desenvolvimento local e em produção standalone (instância cloud única ou servidor dedicado).

O `Dockerfile` na raiz empacota o backend em uma imagem Java 21 com Chromium e suas dependências do Playwright. A execução deve fornecer `DB_URL`, `DB_USERNAME` e `DB_PASSWORD` para conectar ao PostgreSQL; a API escuta na porta `8080` por padrão.

```
+-------------------------------------------------------------------------+
|                              Host / VM                                  |
|                                                                         |
|  +------------------------+                     +--------------------+  |
|  |       Reverse Proxy    |                     |    PostgreSQL 16   |  |
|  |      (Nginx / Caddy)   |                     |     (Container)    |  |
|  |   - Termina SSL        |                     |   Porta: 5432      |  |
|  |   - Roteia / -> Front  |                     |   Volume montado   |  |
|  |   - Roteia /api -> Back|                     +---------^----------+  |
|  +-----------+------------+                               |             |
|              |                                            |             |
|       +------+------+                                     |             |
|       |             |                                     |             |
|       v             v                                     |             |
|  +---------+   +------------------------------------+     |             |
|  | Frontend|   | Backend Application (Container)    |     |             |
|  |  (SPA)  |   |  - Java 21 / Ubuntu Noble Runtime  |     |             |
|  | Static  |   |  - Playwright Chromium Driver      |-----+             |
|  |  Files  |   |  - Porta interna: 8080             |                   |
|  +---------+   +------------------------------------+                   |
+-------------------------------------------------------------------------+
```

### Requisitos de Recursos para o Contêiner de Backend
Como o Playwright/Chromium demanda memória para a renderização headless de páginas:
* **Memória Mínima Recomendada:** 1.5 GB de RAM.
* **Memória Ideal:** 2 GB a 4 GB de RAM.
* **Pool do Navegador:** O `BrowserContext` do Playwright deve ser reutilizado como um singleton gerenciado pelo Spring, abrindo e fechando apenas abas (`Page`) por requisição para evitar vazamento de memória (*memory leak*).

---

## 7. Critérios de Qualidade e Segurança

1. **Validação de Entrada:** Todas as entradas numéricas são saneadas tanto na camada de apresentação (via Zod) quanto na recepção pelo Spring Controller (via Bean Validation `@Valid`).
2. **Prevenção de Injeção em Templates:** Dados interpolados no template HTML do PDF devem ser sanitizados para evitar injeção de scripts (XSS no Chromium headless).
3. **Resiliência a Timeout no PDF:** O processo de compilação de PDF possui timeout explícito configurado em $10\text{ segundos}$ para evitar bloqueio de threads em caso de falha de renderização.