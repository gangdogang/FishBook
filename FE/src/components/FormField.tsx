import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  helper?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, error, helper, htmlFor, children }: FieldProps) {
  const LabelTag = htmlFor ? 'label' : 'span';

  return (
    <div className="block">
      <LabelTag htmlFor={htmlFor} className="mb-[5px] block text-xs font-bold text-ink-mute">
        {label}
      </LabelTag>
      {children}
      {helper ? <p className="m-0 mt-1 text-xs leading-snug text-ink-mute">{helper}</p> : null}
      {error ? <span className="mt-1 block text-13 font-medium leading-snug text-red-700 dark:text-red-400">{error}</span> : null}
    </div>
  );
}
