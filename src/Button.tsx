import type { ComponentChildren } from 'preact';

import clsx from 'clsx';

type Props = JSX.ButtonHTMLAttributes;

const buttonClasses = clsx(
  'inline-flex h-8 cursor-pointer items-center gap-2 rounded px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600',
);

export function Button({ className, ...otherProps }: Props) {
  return <button {...otherProps} className={clsx(buttonClasses, className)} />;
}

export function ButtonLink(props: { children: ComponentChildren; href: string }) {
  // This is a pass-through component
  return <a {...props} className={buttonClasses} />;
}

export function IconButton({ className, ...otherProps }: Props) {
  return (
    <button
      {...otherProps}
      className={clsx(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded bg-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600',
        className,
      )}
    />
  );
}

export function LinkButton({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} className={clsx('cursor-pointer underline', className)} />;
}
