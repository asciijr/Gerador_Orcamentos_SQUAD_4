import { useState, type FormEvent } from 'react';
import { Button } from '../../atoms/Button';
import { FormField } from '../../molecules/FormField';
import {
  BudgetApiError,
  calculateBudget,
  type BudgetCalculationResult,
  type BudgetFieldName,
} from '../../../services/budgets';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function formatBrl(value: string): string {
  return currencyFormatter.format(Number(value));
}

export function PriceCalculator() {
  const [client, setClient] = useState('');
  const [project, setProject] = useState('');
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [extraExpenses, setExtraExpenses] = useState('');
  const [marginPercent, setMarginPercent] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<BudgetFieldName, string>>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [result, setResult] = useState<BudgetCalculationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const response = await calculateBudget({
        client: client.trim(),
        project: project.trim(),
        hours: hours.trim(),
        hourlyRate: hourlyRate.trim(),
        extraExpenses: extraExpenses.trim(),
        marginPercent: marginPercent.trim(),
      });
      setResult(response);
    } catch (error: unknown) {
      setResult(null);
      if (error instanceof BudgetApiError) {
        setFieldErrors(error.fieldErrors);
        if (Object.keys(error.fieldErrors).length === 0) {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('Erro inesperado ao calcular o orçamento.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section aria-label="Calculadora de orçamento">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Projetos</legend>
          <FormField
            id="budget-client"
            label="Cliente"
            name="client"
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
          <FormField
            id="budget-project"
            label="Projeto"
            name="project"
            type="text"
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
          <FormField
            id="budget-hours"
            label="Horas"
            name="hours"
            type="number"
            step="any"
            value={hours}
            error={fieldErrors.hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </fieldset>

        <fieldset>
          <legend>Comercial</legend>
          <FormField
            id="budget-hourly-rate"
            label="Custo/hora"
            name="hourlyRate"
            type="number"
            step="any"
            value={hourlyRate}
            error={fieldErrors.hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
          <FormField
            id="budget-extra-expenses"
            label="Despesas extras"
            name="extraExpenses"
            type="number"
            step="any"
            value={extraExpenses}
            error={fieldErrors.extraExpenses}
            onChange={(e) => setExtraExpenses(e.target.value)}
          />
          <FormField
            id="budget-margin-percent"
            label="Margem %"
            name="marginPercent"
            type="number"
            step="any"
            value={marginPercent}
            error={fieldErrors.marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
          />
        </fieldset>

        {generalError ? <p role="alert">{generalError}</p> : null}

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          label={isSubmitting ? 'Calculando...' : 'Calcular'}
        />
      </form>

      {result ? (
        <div aria-label="Resultado do orçamento">
          <p>Mão de obra: {formatBrl(result.laborCost)}</p>
          <p>Despesas extras: {formatBrl(result.extraExpenses)}</p>
          <p>Custo total: {formatBrl(result.totalCost)}</p>
          <p>Margem: {formatBrl(result.marginValue)}</p>
          <p>Preço final: {formatBrl(result.finalPrice)}</p>
        </div>
      ) : null}
    </section>
  );
}
