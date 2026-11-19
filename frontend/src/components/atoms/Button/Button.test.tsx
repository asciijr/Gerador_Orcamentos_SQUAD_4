import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('exibe o rótulo e dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button label="Calcular" onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn();
    render(<Button label="Calcular" onClick={onClick} disabled />);

    await userEvent.click(screen.getByRole('button', { name: 'Calcular' }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
