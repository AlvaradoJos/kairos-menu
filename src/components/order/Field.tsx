// Campo de formulario con su etiqueta y su mensaje de error. Lo usan OrderFormFields.
// Une la etiqueta, el control y el error con ids para que el lector de pantalla los lea juntos.

import { useId, type ReactNode } from 'react';

interface Props {
  label: string;
  /** Texto del error ya traducido; sin error, no se muestra nada. */
  error?: string;
  /**
   * Dibuja el control (input o textarea). Recibe el id que va en el control, para que la etiqueta
   * lo nombre, y el id del error para aria-describedby (undefined si no hay error).
   */
  children(id: string, describedBy: string | undefined): ReactNode;
}

/** Etiqueta + control + error, conectados por id. */
export function Field({ label, error, children }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id, error ? errorId : undefined)}
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
