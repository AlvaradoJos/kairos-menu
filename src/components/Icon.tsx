interface Props {
  name: 'plus' | 'minus' | 'close';
}

const PATHS: Record<Props['name'], string> = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
};

/** Íconos de un solo trazo; el botón que los contiene lleva el nombre accesible. */
export function Icon({ name }: Props) {
  return (
    <svg className="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" />
    </svg>
  );
}
