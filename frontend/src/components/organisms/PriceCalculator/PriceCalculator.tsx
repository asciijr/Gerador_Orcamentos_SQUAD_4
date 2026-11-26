import { useMemo, useState } from 'react';
import Decimal from 'decimal.js';

interface PricePreviewProps {
  baseRate?: string;
}

export function PriceCalculator({ baseRate = '100.00' }: PricePreviewProps) {
  const [hours, setHours] = useState<string>('10');
  const [discountPercent, setDiscountPercent] = useState<string>('0');

  const preview = useMemo(() => {
    const rate = new Decimal(baseRate || '0');
    const parsedHours = new Decimal(hours || '0');
    const discount = new Decimal(discountPercent || '0');

    const safeHours = parsedHours.isNegative() ? new Decimal(0) : parsedHours;
    const subtotal = rate.times(safeHours);

    const clampedDiscount = Decimal.max(0, Decimal.min(100, discount));
    const discountAmount = subtotal.times(clampedDiscount).div(100);
    const total = Decimal.max(0, subtotal.minus(discountAmount));

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      total: total.toFixed(2),
    };
  }, [baseRate, hours, discountPercent]);

  return (
    <section aria-label="Calculadora com prévia de preço">
      <h2>Prévia de Orçamento</h2>

      <div>
        <label htmlFor="calc-hours">Horas estimadas</label>
        <input
          id="calc-hours"
          type="number"
          min="0"
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="calc-discount">Desconto (%)</label>
        <input
          id="calc-discount"
          type="number"
          min="0"
          max="100"
          step="1"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
        />
      </div>

      <div>
        <p>Subtotal: R$ {preview.subtotal}</p>
        <p>Desconto: R$ {preview.discountAmount}</p>
        <strong>Total estimado: R$ {preview.total}</strong>
      </div>
    </section>
  );
}
