import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculateBudgetDto } from './dto/calculate-budget.dto';
import {
  calculatePrice,
  InvalidPricingInputError,
  type PricingInput,
  type PricingResult,
} from './pricing-engine';

const NUMERIC_FIELDS: (keyof PricingInput)[] = [
  'hours',
  'hourlyRate',
  'extraExpenses',
  'marginPercent',
];

function invalidFieldException(
  field: string,
  message: string,
): BadRequestException {
  return new BadRequestException({
    statusCode: 400,
    field,
    message,
    fieldErrors: { [field]: message },
  });
}

@Injectable()
export class BudgetsService {
  calculate(dto: CalculateBudgetDto): PricingResult {
    for (const field of NUMERIC_FIELDS) {
      const value = dto[field];
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw invalidFieldException(
          field,
          `Valor inválido para o campo "${field}"`,
        );
      }
    }

    try {
      return calculatePrice({
        hours: dto.hours,
        hourlyRate: dto.hourlyRate,
        extraExpenses: dto.extraExpenses,
        marginPercent: dto.marginPercent,
      });
    } catch (error: any) {
      if (error instanceof InvalidPricingInputError) {
        throw invalidFieldException(error.field, error.message);
      }
      throw error;
    }
  }
}
