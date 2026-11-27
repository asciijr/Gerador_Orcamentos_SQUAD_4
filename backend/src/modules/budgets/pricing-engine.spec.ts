/**
 * Suíte de testes do card #22 — correção no cálculo do orçamento.
 * Especificação: openspec/changes/update-budget-pricing-formula/specs/budget-pricing/spec.md
 *
 * Define a fórmula comercial aprovada com margem de contingência e margem de contribuição.
 */
import {
  calculatePrice,
  InvalidPricingInputError,
  type PricingInput,
} from './pricing-engine';

const baseInput: PricingInput = {
  hours: '160',
  hourlyRate: '125.00',
  extraExpenses: '4500.00',
  contingencyPercent: '30',
  contributionPercent: '20',
};

function expectInvalid(input: PricingInput, field: keyof PricingInput) {
  let caught: unknown;
  try {
    calculatePrice(input);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(InvalidPricingInputError);
  expect(caught).toBeInstanceOf(Error);
  expect((caught as InvalidPricingInputError).field).toBe(field);
}

describe('calculatePrice — fórmula', () => {
  it('calcula o orçamento de referência', () => {
    expect(calculatePrice(baseInput)).toEqual({
      laborCost: '20000.00',
      extraExpenses: '4500.00',
      baseCost: '24500.00',
      contingencyValue: '7350.00',
      contributionValue: '4900.00',
      finalPrice: '36750.00',
    });
  });

  it('aceita despesas e margens zeradas', () => {
    expect(
      calculatePrice({
        hours: 10,
        hourlyRate: 50,
        extraExpenses: 0,
        contingencyPercent: 0,
        contributionPercent: 0,
      }),
    ).toEqual({
      laborCost: '500.00',
      extraExpenses: '0.00',
      baseCost: '500.00',
      contingencyValue: '0.00',
      contributionValue: '0.00',
      finalPrice: '500.00',
    });
  });

  it('aceita números e textos numéricos como entrada', () => {
    const fromNumbers = calculatePrice({
      hours: 160,
      hourlyRate: 125,
      extraExpenses: 4500,
      contingencyPercent: 30,
      contributionPercent: 20,
    });
    expect(fromNumbers).toEqual(calculatePrice(baseInput));
  });

  it('aceita horas e margens com casas decimais', () => {
    const result = calculatePrice({
      hours: '7.5',
      hourlyRate: '80.00',
      extraExpenses: '400',
      contingencyPercent: '12.5',
      contributionPercent: '7.5',
    });
    expect(result).toEqual({
      laborCost: '600.00',
      extraExpenses: '400.00',
      baseCost: '1000.00',
      contingencyValue: '125.00',
      contributionValue: '75.00',
      finalPrice: '1200.00',
    });
  });

  it('valida o exemplo comercial da planilha', () => {
    expect(
      calculatePrice({
        hours: '5',
        hourlyRate: '5.20',
        extraExpenses: '0',
        contingencyPercent: '30',
        contributionPercent: '20',
      }),
    ).toEqual({
      laborCost: '26.00',
      extraExpenses: '0.00',
      baseCost: '26.00',
      contingencyValue: '7.80',
      contributionValue: '5.20',
      finalPrice: '39.00',
    });
  });
});

describe('calculatePrice — precisão decimal', () => {
  it('não sofre erro de ponto flutuante', () => {
    expect(
      calculatePrice({
        hours: 3,
        hourlyRate: 0.1,
        extraExpenses: 0.2,
        contingencyPercent: 30,
        contributionPercent: 20,
      }),
    ).toEqual({
      laborCost: '0.30',
      extraExpenses: '0.20',
      baseCost: '0.50',
      contingencyValue: '0.15',
      contributionValue: '0.10',
      finalPrice: '0.75',
    });
  });

  it('suporta valores altos sem perda de precisão', () => {
    const result = calculatePrice({
      hours: '100000',
      hourlyRate: '999999.99',
      extraExpenses: '0',
      contingencyPercent: '0',
      contributionPercent: '0',
    });
    expect(result.finalPrice).toBe('99999999000.00');
  });

  it('devolve sempre duas casas decimais', () => {
    const result = calculatePrice({ ...baseInput, extraExpenses: '12.5' });
    expect(result.extraExpenses).toBe('12.50');
    for (const value of Object.values(result)) {
      expect(value).toMatch(/^\d+\.\d{2}$/);
    }
  });
});

describe('calculatePrice — arredondamento ROUND_HALF_UP', () => {
  it('arredonda meio centavo da mão de obra para cima', () => {
    const result = calculatePrice({
      ...baseInput,
      hours: '0.5',
      hourlyRate: '0.05',
    });
    expect(result.laborCost).toBe('0.03');
  });

  it('arredonda ambas as margens para cima no meio centavo', () => {
    const result = calculatePrice({
      hours: '1',
      hourlyRate: '10.50',
      extraExpenses: '0',
      contingencyPercent: '15',
      contributionPercent: '5',
    });
    expect(result.contingencyValue).toBe('1.58');
    expect(result.contributionValue).toBe('0.53');
    expect(result.finalPrice).toBe('12.61');
  });

  it('arredonda cada margem separadamente sobre o custo-base', () => {
    expect(
      calculatePrice({
        hours: '0.5',
        hourlyRate: '0.15',
        extraExpenses: '0.02',
        contingencyPercent: '30',
        contributionPercent: '20',
      }),
    ).toEqual({
      laborCost: '0.08',
      extraExpenses: '0.02',
      baseCost: '0.10',
      contingencyValue: '0.03',
      contributionValue: '0.02',
      finalPrice: '0.15',
    });
  });
});

describe('calculatePrice — validação das entradas', () => {
  it.each([0, '0', -1, '-0.5'])('rejeita horas = %p', (hours) => {
    expectInvalid({ ...baseInput, hours }, 'hours');
  });

  it.each([0, -1, '-125'])('rejeita custo por hora = %p', (hourlyRate) => {
    expectInvalid({ ...baseInput, hourlyRate }, 'hourlyRate');
  });

  it.each([
    'extraExpenses',
    'contingencyPercent',
    'contributionPercent',
  ] as const)('rejeita %s negativo', (field) => {
    expectInvalid({ ...baseInput, [field]: '-0.01' }, field);
  });

  it.each([
    ['hours', '1.005'],
    ['hourlyRate', '10.123'],
    ['extraExpenses', '0.001'],
    ['contingencyPercent', '30.123'],
    ['contributionPercent', '20.123'],
  ] as const)(
    'rejeita %s com mais de duas casas decimais (%p)',
    (field, value) => {
      expectInvalid({ ...baseInput, [field]: value }, field);
    },
  );

  it.each(['contingencyPercent', 'contributionPercent'] as const)(
    'rejeita %s com valores não numéricos',
    (field) => {
      for (const value of [
        'abc',
        '',
        '   ',
        Number.NaN,
        Number.POSITIVE_INFINITY,
        '1e',
        '10,50',
      ]) {
        expectInvalid({ ...baseInput, [field]: value }, field);
      }
    },
  );

  it('informa o campo inválido na mensagem do erro', () => {
    expect(() => calculatePrice({ ...baseInput, hours: 0 })).toThrow(/hours/);
  });
});
