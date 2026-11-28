import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CalculateBudgetDto } from './dto/calculate-budget.dto';
import { type PricingResult } from './pricing-engine';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  calculate(@Body() body: CalculateBudgetDto): PricingResult {
    return this.budgetsService.calculate(body);
  }
}
