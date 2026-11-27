export interface CalculateBudgetInput {
  client: string;
  project: string;
  hours: string;
  hourlyRate: string;
  extraExpenses: string;
  contingencyPercent: string;
  contributionPercent: string;
}

export interface BudgetCalculationResult {
  laborCost: string;
  extraExpenses: string;
  baseCost: string;
  contingencyValue: string;
  contributionValue: string;
  finalPrice: string;
}

export type BudgetFieldName =
  | 'client'
  | 'project'
  | 'hours'
  | 'hourlyRate'
  | 'extraExpenses'
  | 'contingencyPercent'
  | 'contributionPercent';

export class BudgetApiError extends Error {
  status: number;
  fieldErrors: Partial<Record<BudgetFieldName, string>>;

  constructor(
    message: string,
    status: number,
    fieldErrors: Partial<Record<BudgetFieldName, string>> = {},
  ) {
    super(message);
    this.name = 'BudgetApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const VALID_FIELDS: BudgetFieldName[] = [
  'client',
  'project',
  'hours',
  'hourlyRate',
  'extraExpenses',
  'contingencyPercent',
  'contributionPercent',
];

export async function calculateBudget(
  input: CalculateBudgetInput,
): Promise<BudgetCalculationResult> {
  const response = await fetch('/api/budgets/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const fieldErrors: Partial<Record<BudgetFieldName, string>> = {};

    if (data && typeof data === 'object') {
      if (typeof data.field === 'string' && VALID_FIELDS.includes(data.field as BudgetFieldName)) {
        fieldErrors[data.field as BudgetFieldName] =
          typeof data.message === 'string' ? data.message : 'Valor inválido';
      }

      if (data.fieldErrors && typeof data.fieldErrors === 'object') {
        for (const field of VALID_FIELDS) {
          const val = data.fieldErrors[field];
          if (typeof val === 'string' && val.trim()) {
            fieldErrors[field] = val;
          } else if (Array.isArray(val) && typeof val[0] === 'string') {
            fieldErrors[field] = val[0];
          }
        }
      }
    }

    const message =
      data && typeof data.message === 'string'
        ? data.message
        : 'Não foi possível calcular o orçamento.';

    throw new BudgetApiError(message, response.status, fieldErrors);
  }

  return data as BudgetCalculationResult;
}
