import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';

/**
 * Módulo de domínio "budgets" (orçamentos).
 * Interface pública: BudgetsService (exportado aqui).
 * Arquivos internos (pricing-engine, repository, entities) não podem ser
 * importados por outros módulos — ver Guia de Engenharia, seção 7.
 */
@Module({
  controllers: [BudgetsController],
  providers: [BudgetsService],
  exports: [BudgetsService],
})
export class BudgetsModule {}
