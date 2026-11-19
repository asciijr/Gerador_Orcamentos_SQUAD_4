/**
 * Motor de cálculo de preço do módulo budgets (arquivo interno do módulo).
 * Card #4 — contrato fixado pela suíte pricing-engine.spec.ts.
 * Especificação: openspec/changes/add-pricing-engine/specs/budget-pricing/spec.md
 *
 * Os tipos e o erro abaixo são o contrato definido pelo Tech Lead.
 * O corpo de calculatePrice é a tarefa do card.
 */

export type PricingInput = {
  hours: string | number;
  hourlyRate: string | number;
  extraExpenses: string | number;
  marginPercent: string | number;
};

export type PricingResult = {
  laborCost: string;
  extraExpenses: string;
  totalCost: string;
  marginValue: string;
  finalPrice: string;
};

export class InvalidPricingInputError extends Error {
  constructor(public readonly field: keyof PricingInput) {
    super(`Valor inválido para o campo "${field}"`);
    this.name = 'InvalidPricingInputError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- esqueleto do TDD: o parâmetro passa a ser usado na implementação do card #4
export function calculatePrice(input: PricingInput): PricingResult {
  throw new Error('calculatePrice ainda não foi implementado (card #4)');
}
