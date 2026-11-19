## O que foi feito
<!-- Descreva a mudança em 1 a 3 frases. -->

## Card relacionado
<!-- Link do card no board ou "Closes #numero" se for issue do GitHub. -->

## Tipo de mudança
- [ ] feat: nova funcionalidade
- [ ] fix: correção de bug
- [ ] refactor: refatoração sem mudança de comportamento
- [ ] docs / test / chore / build / ci

## Como testar
1. `docker compose up --build`
2. Acesse ...
3. Resultado esperado: ...

## Evidências
<!-- Prints, GIFs ou logs. Obrigatório para mudanças visuais. -->

## Checklist do autor
- [ ] O título do PR segue Conventional Commits
- [ ] A branch segue o padrão `tipo/numero-descricao`
- [ ] O projeto sobe com `docker compose up` sem passos extras
- [ ] Lint, typecheck e testes passam localmente, executados dentro do container
- [ ] Não alterei, simplifiquei nem comentei os testes definidos para o card
- [ ] Nenhuma dependência nova foi adicionada sem verificação e aval do Tech Lead
- [ ] Li e entendo cada linha do código, inclusive o que foi gerado por IA
- [ ] Respeita o Monolito Modular (não importa arquivos internos de outro módulo)
- [ ] Respeita o Atomic Design (componente no nível correto)
- [ ] Sem segredos, logs de debug ou código comentado
- [ ] `.env.example` atualizado se criei nova variável de ambiente
- [ ] Migration criada se alterei o banco de dados

## Observações para o revisor
<!-- Dúvidas, decisões tomadas, pontos de atenção. -->
