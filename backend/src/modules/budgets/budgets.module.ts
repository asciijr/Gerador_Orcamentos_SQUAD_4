import { Module } from '@nestjs/common';

/**
 * Módulo de domínio "budgets" (orçamentos).
 * Interface pública: BudgetsService (exportado aqui quando for criado).
 * Arquivos internos (pricing-engine, repository, entities) não podem ser
 * importados por outros módulos — ver Guia de Engenharia, seção 7.
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class BudgetsModule {}
