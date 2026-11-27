import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PriceCalculator } from './PriceCalculator';
import { BudgetApiError, calculateBudget } from '../../../services/budgets';

vi.mock('../../../services/budgets', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/budgets')>();
  return {
    ...actual,
    calculateBudget: vi.fn(),
  };
});

describe('PriceCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza os 7 campos do formulário com margens padrão sugeridas', () => {
    render(<PriceCalculator />);

    expect(screen.getByLabelText('Cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Projeto')).toBeInTheDocument();
    expect(screen.getByLabelText('Horas')).toBeInTheDocument();
    expect(screen.getByLabelText('Custo/hora')).toBeInTheDocument();
    expect(screen.getByLabelText('Despesas extras')).toBeInTheDocument();
    expect(screen.getByLabelText('Margem de contingência %')).toHaveValue(30);
    expect(screen.getByLabelText('Margem de contribuição %')).toHaveValue(20);
  });

  it('chama calculateBudget ao clicar em Calcular e exibe as parcelas em R$', async () => {
    vi.mocked(calculateBudget).mockResolvedValueOnce({
      laborCost: '800.00',
      extraExpenses: '200.00',
      baseCost: '1000.00',
      contingencyValue: '300.00',
      contributionValue: '200.00',
      finalPrice: '1500.00',
    });

    render(<PriceCalculator />);

    fireEvent.change(screen.getByLabelText('Cliente'), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByLabelText('Projeto'), { target: { value: 'Portal' } });
    fireEvent.change(screen.getByLabelText('Horas'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Custo/hora'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText('Despesas extras'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Margem de contingência %'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('Margem de contribuição %'), {
      target: { value: '20' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    await waitFor(() => {
      expect(calculateBudget).toHaveBeenCalledWith({
        client: 'Acme',
        project: 'Portal',
        hours: '10',
        hourlyRate: '80',
        extraExpenses: '200',
        contingencyPercent: '30',
        contributionPercent: '20',
      });
    });

    expect(await screen.findByText(/Preço final:\s*R\$\s*1\.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/Mão de obra:\s*R\$\s*800,00/)).toBeInTheDocument();
    expect(screen.getByText(/Despesas extras:\s*R\$\s*200,00/)).toBeInTheDocument();
    expect(screen.getByText(/Custo-base:\s*R\$\s*1\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/Margem de contingência:\s*R\$\s*300,00/)).toBeInTheDocument();
    expect(screen.getByText(/Margem de contribuição:\s*R\$\s*200,00/)).toBeInTheDocument();
  });

  it('exibe a mensagem de erro no campo correto quando a API responde 400', async () => {
    vi.mocked(calculateBudget).mockRejectedValueOnce(
      new BudgetApiError('Dados inválidos', 400, {
        hours: 'Horas deve ser maior que zero',
      }),
    );

    render(<PriceCalculator />);

    fireEvent.change(screen.getByLabelText('Horas'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Horas deve ser maior que zero');
    expect(screen.getByLabelText('Horas')).toHaveAttribute('aria-invalid', 'true');
  });
});
