# Cards de Execução — Fluxo REDAP + Scrum (ASCII)
**Squad 4:** Gerador de Orçamentos  
**Fórmula de Precificação:** `(Horas × Custo/Hora) + Despesas Diretas + Contingência de Projetos + Margem de Contribuição`  
**Padrão de Anatomia:** `[Domínio] Ação objetiva` | Prioridade MoSCoW | Estimativa (T-Shirt/Fibonacci) | Definition of Done (DoD)

---

### CARD 01
* **Título:** `[Backend] Implementar motor desacoplado de precificação com BigDecimal`
* **Prioridade:** Must Have
* **Estimativa:** M (5 pts)
* **Requisito Associado:** RF04, RN01, RNF02, RNF03
* **Descrição:** Criar o serviço puro de domínio `PricingEngineService` responsável por calcular o orçamento a partir dos dados de entrada: $(\text{Horas} \times \text{Custo/Hora}) + \text{Despesas Diretas} + \text{Contingência de Projetos} + \text{Margem de Contribuição}$. Não deve haver persistência ou dependência externa nessa classe.
* **Definition of Done (DoD):**
  - [ ] Implementado exclusivamente com `BigDecimal`, com escala de 2 casas decimais e arredondamento `RoundingMode.HALF_EVEN`.
  - [ ] Retorna a memória de cálculo completa com subtotais decompostos (Mão de Obra, Despesas, Contingência, Margem e Preço Final).
  - [ ] 100% de cobertura de testes unitários cobrindo arredondamentos, limites e valores zerados.
  - [ ] Tratamento de exceção de domínio impedindo valores negativos em qualquer parâmetro ou horas $\le 0$.

---

### CARD 02
* **Título:** `[API] Criar endpoint de simulação reativa de cálculos`
* **Prioridade:** Must Have
* **Estimativa:** P (3 pts)
* **Requisito Associado:** RF04, RNF03, RNF05
* **Descrição:** Criar o endpoint `POST /api/budgets/calculate` para permitir que o frontend realize prévias e simulações do preço final em tempo real antes de persistir o orçamento.
* **Definition of Done (DoD):**
  - [ ] Endpoint documentado no OpenAPI/Swagger com contratos de Request e Response padronizados.
  - [ ] Validação de Bean Validation (`@Valid`, `@NotNull`, `@PositiveOrZero`) com retorno HTTP 400 descritivo em caso de erro.
  - [ ] Integração com o `PricingEngineService`.
  - [ ] Tempo de resposta estritamente $\le 200\text{ ms}$.

---

### CARD 03
* **Título:** `[Database] Criar modelagem da tabela budgets com snapshot JSONB`
* **Prioridade:** Must Have
* **Estimativa:** P (3 pts)
* **Requisito Associado:** RF05, RN02, RNF06
* **Descrição:** Desenhar e executar migração de banco de dados (Flyway ou DDL Hibernate) para a entidade `BudgetEntity`, incluindo colunas indexadas de consulta e coluna `snapshot_calculo` em `JSONB` para auditoria imutável.
* **Definition of Done (DoD):**
  - [ ] Tabela criada no PostgreSQL via container Docker com chaves primárias e índices (`cliente_nome`, `data_emissao`, `numero_protocolo`).
  - [ ] Coluna `snapshot_calculo` tipada como `JSONB` gravando a foto completa da requisição e dos subtotais.
  - [ ] Teste de persistência e leitura da entidade validando integridade do JSON salvo.

---

### CARD 04
* **Título:** `[PDF] Implementar PoC e serviço de renderização via Playwright`
* **Prioridade:** Must Have
* **Estimativa:** G (8 pts)
* **Requisito Associado:** RF06, RNF04, RNF07
* **Descrição:** Configurar o driver do Playwright Chromium headless no Spring Boot para compilar templates HTML/CSS corporativos com a identidade visual da ASCII em documentos PDF (A4).
* **Definition of Done (DoD):**
  - [ ] Instância gerenciada do Playwright Browser funcionando em contêiner/JVM com reciclagem de abas (`BrowserContext`).
  - [ ] Template HTML/CSS com tipografia, cabeçalho, logo ASCII, tabelas zebradas e quebras de página para formato A4.
  - [ ] Timeout configurado em no máximo $10\text{ segundos}$ para evitar congelamento de threads.
  - [ ] Retorno do binário em `byte[]` com `Content-Type: application/pdf`.

---

### CARD 05
* **Título:** `[API] Criar endpoints de emissão e recuperação de orçamentos`
* **Prioridade:** Must Have
* **Estimativa:** M (5 pts)
* **Requisito Associado:** RF05, RF08, RF10
* **Descrição:** Implementar os endpoints `POST /api/budgets` (persistência e acionamento de geração), `GET /api/budgets` (listagem com paginação e filtros) e `GET /api/budgets/{id}/pdf` (download do PDF).
* **Definition of Done (DoD):**
  - [ ] `POST /api/budgets` calcula, persiste o snapshot no PostgreSQL, emite o protocolo e aciona o renderizador de PDF.
  - [ ] `GET /api/budgets` suporta paginação e filtros por cliente e período.
  - [ ] `GET /api/budgets/{id}/pdf` retorna o stream binário com cabeçalho de download (`Content-Disposition: attachment`).
  - [ ] Retorno de status HTTP 404 padronizado caso o ID do orçamento não exista.

---

### CARD 06
* **Título:** `[Frontend] Construir formulário integrado de Projetos e Comercial com Zod`
* **Prioridade:** Must Have
* **Estimativa:** M (5 pts)
* **Requisito Associado:** RF01, RF02, RF03
* **Descrição:** Construir a interface de formulário reativo com abas/seções separando a entrada técnica da equipe de Projetos (horas/sprints e contingência) e a entrada da equipe Comercial (custo/hora, despesas diretas e margem).
* **Definition of Done (DoD):**
  - [ ] Componentização baseada em Tailwind CSS e shadcn/ui.
  - [ ] Schema de validação Zod bloqueando submissão de horas $\le 0$ ou valores negativos.
  - [ ] Mascaramento de moeda nacional ($R\$$) e feedback visual de erros em tempo real.
  - [ ] Integração com `POST /api/budgets/calculate` atualizando o resumo do orçamento a cada alteração válida com debounce.

---

### CARD 07
* **Título:** `[Frontend] Criar card de resumo da memória de cálculo e emissão de proposta`
* **Prioridade:** Must Have
* **Estimativa:** P (3 pts)
* **Requisito Associado:** RF04, RF05, RF07
* **Descrição:** Desenvolver o componente visual de resumo que detalha a memória de cálculo da fórmula oficial e o botão de ação principal para consolidar o orçamento e gerar o PDF.
* **Definition of Done (DoD):**
  - [ ] Exibe claramente a decomposição: Mão de Obra, Despesas Diretas, Contingência, Margem e Preço Final.
  - [ ] Estado de carregamento (*loading spinner*) no botão de emissão durante a geração do PDF.
  - [ ] Abertura automática de modal com prévia do PDF renderizado e botão de download imediato ao concluir.

---

### CARD 08
* **Título:** `[Frontend] Construir tela de histórico gerencial e filtros de auditoria`
* **Prioridade:** Must Have
* **Estimativa:** M (5 pts)
* **Requisito Associado:** RF08, RF09, RF10
* **Descrição:** Criar a visualização tabular simples dos orçamentos já emitidos na plataforma, com campos de filtragem e ação de download direto da proposta.
* **Definition of Done (DoD):**
  - [ ] Tabela com paginação exibindo Protocolo, Data, Cliente, Projeto, Horas e Preço Final.
  - [ ] Inputs de filtro por texto (cliente/projeto) e seleção de intervalo de datas.
  - [ ] Botão de ação por linha que efetua o download do arquivo PDF (`GET /api/budgets/{id}/pdf`).
  - [ ] Tratamento de estado vazio (*empty state*) quando não houver registros.

---

### CARD 09
* **Título:** `[Frontend] Implementar modal de visualização e download de PDF`
* **Prioridade:** Should Have
* **Estimativa:** P (2 pts)
* **Requisito Associado:** RF06, RF07
* **Descrição:** Criar componente de modal reutilizável com um visualizador de PDF embutido (iframe/embed de Blob) para inspeção visual do documento antes ou após o download.
* **Definition of Done (DoD):**
  - [ ] Renderização via objeto Blob seguro no navegador (`URL.createObjectURL`).
  - [ ] Botões explícitos de "Baixar PDF" e "Fechar".
  - [ ] Tratamento de falha de carregamento com mensagem amigável e opção de download direto.

---

### CARD 10
* **Título:** `[DevOps] Orquestrar ambiente local e de deploy via Docker Compose`
* **Prioridade:** Must Have
* **Estimativa:** P (3 pts)
* **Requisito Associado:** RNF01, RNF04
* **Descrição:** Configurar arquivo `docker-compose.yml` para subir em um comando toda a infraestrutura standalone: banco PostgreSQL persistido, backend com dependências do Playwright e frontend servido via build estático.
* **Definition of Done (DoD):**
  - [ ] Comando `docker-compose up --build` sobe banco, backend e frontend sem erros.
  - [ ] Variáveis de ambiente configuradas via arquivo `.env.example`.
  - [ ] Volume persistente configurado para o banco de dados.