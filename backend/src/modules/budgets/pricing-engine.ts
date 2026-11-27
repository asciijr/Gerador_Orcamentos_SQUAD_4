/**
 * Motor de cálculo de preço do módulo budgets (arquivo interno do módulo).
 * Cards #4 e #22 — contrato fixado pela suíte pricing-engine.spec.ts.
 * Especificação: openspec/specs/budget-pricing/spec.md
 *
 * O cálculo tem três etapas independentes:
 *   1. parseInput: valida e converte as entradas para Decimal;
 *   2. applyPricingFormula: aplica a fórmula comercial (custo-base + contingência + contribuição);
 *   3. formatResult: serializa cada valor com exatamente duas casas.
 *
 * Valores monetários nunca passam por `number`: tudo é feito com decimal.js.
 */
import Decimal from 'decimal.js';

export type PricingInput = {
  hours: string | number;
  hourlyRate: string | number;
  extraExpenses: string | number;
  contingencyPercent: string | number;
  contributionPercent: string | number;
};

export type PricingResult = {
  laborCost: string;
  extraExpenses: string;
  baseCost: string;
  contingencyValue: string;
  contributionValue: string;
  finalPrice: string;
};

export class InvalidPricingInputError extends Error {
  constructor(public readonly field: keyof PricingInput) {
    super(`Valor inválido para o campo "${field}"`);
    this.name = 'InvalidPricingInputError';
  }
}

type PricingField = keyof PricingInput;
type ParsedInput = Record<PricingField, Decimal>;
type PricingValues = Record<keyof PricingResult, Decimal>;

/**
 * Construtor de Decimal exclusivo do motor. Isola o cálculo da configuração
 * global do decimal.js e garante precisão de sobra para os maiores valores
 * aceitos pelas colunas DECIMAL da tabela budgets (até 14 dígitos).
 */
const PricingDecimal = Decimal.clone({
  precision: 40,
  rounding: Decimal.ROUND_HALF_UP,
});

/** Casas decimais aceitas nas entradas e devolvidas no resultado (colunas DECIMAL(…, 2)). */
const DECIMAL_PLACES = 2;

/** Texto numérico aceito: sinal opcional, ponto como separador, sem notação científica. */
const NUMERIC_TEXT = /^-?\d+(\.\d+)?$/;

/** Horas e custo/hora precisam ser maiores que zero; despesas e margem podem ser zero. */
const MUST_BE_POSITIVE: Record<PricingField, boolean> = {
  hours: true,
  hourlyRate: true,
  extraExpenses: false,
  contingencyPercent: false,
  contributionPercent: false,
};

/** Arredonda para duas casas com ROUND_HALF_UP (equivale ao ARRED das planilhas). */
function roundMoney(value: Decimal): Decimal {
  return value.toDecimalPlaces(DECIMAL_PLACES, Decimal.ROUND_HALF_UP);
}

/** Converte a entrada para Decimal, ou devolve null se ela não for um número finito. */
function toDecimal(value: string | number): Decimal | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? new PricingDecimal(value) : null;
  }
  return NUMERIC_TEXT.test(value) ? new PricingDecimal(value) : null;
}

function parseField(input: PricingInput, field: PricingField): Decimal {
  const value = toDecimal(input[field]);
  const isValid =
    value !== null &&
    value.decimalPlaces() <= DECIMAL_PLACES &&
    (MUST_BE_POSITIVE[field]
      ? value.greaterThan(0)
      : value.greaterThanOrEqualTo(0));

  if (!isValid) {
    throw new InvalidPricingInputError(field);
  }
  return value.abs();
}

function parseInput(input: PricingInput): ParsedInput {
  return {
    hours: parseField(input, 'hours'),
    hourlyRate: parseField(input, 'hourlyRate'),
    extraExpenses: parseField(input, 'extraExpenses'),
    contingencyPercent: parseField(input, 'contingencyPercent'),
    contributionPercent: parseField(input, 'contributionPercent'),
  };
}

/**
 * Fórmula comercial aprovada (card #22):
 *   mão de obra  = ARRED(horas × custo/hora; 2)
 *   custo-base   = mão de obra + despesas extras
 *   contingência = ARRED(custo-base × contingencyPercent / 100; 2)
 *   contribuição = ARRED(custo-base × contributionPercent / 100; 2)
 *   preço final  = custo-base + contingência + contribuição
 */
function applyPricingFormula({
  hours,
  hourlyRate,
  extraExpenses,
  contingencyPercent,
  contributionPercent,
}: ParsedInput): PricingValues {
  const laborCost = roundMoney(hours.times(hourlyRate));
  const baseCost = roundMoney(laborCost.plus(extraExpenses));
  const contingencyValue = roundMoney(
    baseCost.times(contingencyPercent).dividedBy(100),
  );
  const contributionValue = roundMoney(
    baseCost.times(contributionPercent).dividedBy(100),
  );
  const finalPrice = roundMoney(
    baseCost.plus(contingencyValue).plus(contributionValue),
  );

  return {
    laborCost,
    extraExpenses,
    baseCost,
    contingencyValue,
    contributionValue,
    finalPrice,
  };
}

function formatResult(values: PricingValues): PricingResult {
  return {
    laborCost: values.laborCost.toFixed(DECIMAL_PLACES),
    extraExpenses: values.extraExpenses.toFixed(DECIMAL_PLACES),
    baseCost: values.baseCost.toFixed(DECIMAL_PLACES),
    contingencyValue: values.contingencyValue.toFixed(DECIMAL_PLACES),
    contributionValue: values.contributionValue.toFixed(DECIMAL_PLACES),
    finalPrice: values.finalPrice.toFixed(DECIMAL_PLACES),
  };
}

/**
 * Calcula o preço de um orçamento.
 * Função pura: sem banco, sem HTTP. Lança InvalidPricingInputError (com o
 * campo inválido) quando alguma entrada não respeita o spec; o endpoint do
 * card #5 traduz esse erro em HTTP 400.
 */
export function calculatePrice(input: PricingInput): PricingResult {
  return formatResult(applyPricingFormula(parseInput(input)));
}
