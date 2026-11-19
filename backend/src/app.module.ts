import { Module } from '@nestjs/common';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './shared/health/health.module';

@Module({
  imports: [DatabaseModule, HealthModule, BudgetsModule],
})
export class AppModule {}
