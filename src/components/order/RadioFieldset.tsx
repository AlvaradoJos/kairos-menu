// Grupo de botones de opción (radio) con título y error. Lo usa OrderFormFields para
// "Tipo de pedido" y "Método de pago".

import { useId } from 'react';

export interface RadioOption {
  key: string;
  label: string;
  checked: boolean;
  onSelect(): void;
}

interface Props {
  legend: string;
  /** Nombre del grupo: los radios con el mismo name se excluyen entre sí. */
  name: string;
  options: RadioOption[];
  /** Texto del error ya traducido. */
  error?: string;
}

/** Fieldset con una fila de opciones. Si hay error, el grupo se marca inválido y apunta al mensaje. */
export function RadioFieldset({ legend, name, options, error }: Props) {
  const errorId = useId();
  return (
    <fieldset className="option-group" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined}>
      <legend>{legend}</legend>
      <div className="choice-row">
        {options.map((option) => (
          <label key={option.key} className="option">
            <input type="radio" name={name} checked={option.checked} onChange={option.onSelect} />
            <span className="option__label">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
