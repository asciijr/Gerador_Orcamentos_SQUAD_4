import type { ChangeEvent } from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  name: string;
  type?: 'text' | 'number';
  value: string;
  error?: string;
  step?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FormField({
  id,
  label,
  name,
  type = 'text',
  value,
  error,
  step,
  onChange,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        step={step}
        onChange={onChange}
        aria-invalid={Boolean(error)}
      />
      {error ? (
        <span role="alert" className="field-error">
          {error}
        </span>
      ) : null}
    </div>
  );
}
