# 0004 — Persistência do orçamento em colunas e PDF com pdfmake

- **Data:** 18/11/2026
- **Status:** aceita pelo Tech Lead
- **Cards:** #1 (tabela), #7 (emissão), #9 e #10 (PDF)

## Contexto

O Documento de Escopo pede um histórico simples "para auditoria" e um PDF "confiável e
estético" com a identidade da ASCII. O MVP tem 3,5 semanas e um squad de estudantes.

## Decisão

1. **Tabela `budgets` com colunas tipadas.** Cada orçamento emitido guarda as entradas
   (horas, custo/hora, despesas extras, margem %) e o resultado (mão de obra, custo total,
   valor da margem, preço final) em colunas `DECIMAL`, mais um número sequencial único.
   Um orçamento emitido não é editado: se a regra de preço mudar, o histórico não muda.
2. **PDF gerado no backend com pdfmake** (MIT, JavaScript puro), a partir do registro
   salvo. Layout declarativo (cabeçalho com logo, tabela, rodapé com "Página X de Y").
   O renderizador genérico fica em `shared/pdf`; o layout da proposta fica no módulo `budgets`.

## Alternativas consideradas

- **Snapshot em JSONB:** mais flexível, mas mais difícil de consultar e validar; colunas bastam
  enquanto a fórmula tiver poucas parcelas.
- **Navegador headless (Playwright/Puppeteer):** fidelidade de HTML/CSS, mas imagem Docker
  de ~1,5 GB e alto consumo de memória.
- **PDF no navegador (impressão da página):** sem controle de layout e sem PDF para o histórico.

## Consequências

- Mudar a fórmula exige migration nova (coluna nova), registrada como decisão.
- O layout é escrito em objetos JavaScript, não em HTML; quem faz o layout precisa ler a documentação do pdfmake.
