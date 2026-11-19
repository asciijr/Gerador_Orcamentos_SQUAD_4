import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  disabled?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} type={type} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
