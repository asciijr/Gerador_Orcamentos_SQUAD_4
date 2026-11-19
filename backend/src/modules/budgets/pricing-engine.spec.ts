/**
 * Suíte de testes do card #4 — [Budgets] Implementar motor de cálculo de preço.
 * Definida pelo Tech Lead ANTES da implementação (Guia de Engenharia, seção 9).
 * Especificação: openspec/changes/add-pricing-engine/specs/budget-pricing/spec.md
 *
 * É proibido alterar, simplificar ou comentar este arquivo para fazê-lo passar.
 * Se algum caso parecer errado, sinalize no card para o Tech Lead.
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
  marginPercent: '20',
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
      totalCost: '24500.00',
      marginValue: '4900.00',
      finalPrice: '29400.00',
    });
  });

  it('aceita despesas extras e margem zeradas', () => {
    expect(
      calculatePrice({
        hours: 10,
        hourlyRate: 50,
        extraExpenses: 0,
        marginPercent: 0,
      }),
    ).toEqual({
      laborCost: '500.00',
      extraExpenses: '0.00',
      totalCost: '500.00',
      marginValue: '0.00',
      finalPrice: '500.00',
    });
  });

  it('aceita números e textos numéricos como entrada', () => {
    const fromNumbers = calculatePrice({
      hours: 160,
      hourlyRate: 125,
      extraExpenses: 4500,
      marginPercent: 20,
    });
    expect(fromNumbers).toEqual(calculatePrice(baseInput));
  });

  it('aceita horas e margem com casas decimais', () => {
    const result = calculatePrice({
      hours: '7.5',
      hourlyRate: '80.00',
      extraExpenses: '400',
      marginPercent: '12.5',
    });
    expect(result.laborCost).toBe('600.00');
    expect(result.totalCost).toBe('1000.00');
    expect(result.marginValue).toBe('125.00');
    expect(result.finalPrice).toBe('1125.00');
  });
});

describe('calculatePrice — precisão decimal', () => {
  it('não sofre erro de ponto flutuante', () => {
    const result = calculatePrice({
      hours: 3,
      hourlyRate: 0.1,
      extraExpenses: 0.2,
      marginPercent: 10,
    });
    expect(result.laborCost).toBe('0.30');
    expect(result.totalCost).toBe('0.50');
    expect(result.marginValue).toBe('0.05');
    expect(result.finalPrice).toBe('0.55');
  });

  it('suporta valores altos sem perda de precisão', () => {
    const result = calculatePrice({
      hours: '100000',
      hourlyRate: '999999.99',
      extraExpenses: '0',
      marginPercent: '0',
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

  it('arredonda o valor da margem para cima no meio centavo', () => {
    const result = calculatePrice({
      hours: '1',
      hourlyRate: '10.05',
      extraExpenses: '0',
      marginPercent: '15',
    });
    expect(result.marginValue).toBe('1.51');
    expect(result.finalPrice).toBe('11.56');
  });

  it('calcula a margem sobre o custo total já arredondado', () => {
    expect(
      calculatePrice({
        hours: '0.5',
        hourlyRate: '0.15',
        extraExpenses: '0.02',
        marginPercent: '5',
      }),
    ).toEqual({
      laborCost: '0.08',
      extraExpenses: '0.02',
      totalCost: '0.10',
      marginValue: '0.01',
      finalPrice: '0.11',
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

  it.each(['extraExpenses', 'marginPercent'] as const)(
    'rejeita %s negativo',
    (field) => {
      expectInvalid({ ...baseInput, [field]: '-0.01' }, field);
    },
  );

  it.each([
    ['hours', '1.005'],
    ['hourlyRate', '10.123'],
    ['extraExpenses', '0.001'],
    ['marginPercent', '12.345'],
  ] as const)(
    'rejeita %s com mais de duas casas decimais (%p)',
    (field, value) => {
      expectInvalid({ ...baseInput, [field]: value }, field);
    },
  );

  it.each([
    'abc',
    '',
    '   ',
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '1e',
    '10,50',
  ])('rejeita valor não numérico %p', (value) => {
    expectInvalid({ ...baseInput, marginPercent: value }, 'marginPercent');
  });

  it('informa o campo inválido na mensagem do erro', () => {
    expect(() => calculatePrice({ ...baseInput, hours: 0 })).toThrow(/hours/);
  });
});
