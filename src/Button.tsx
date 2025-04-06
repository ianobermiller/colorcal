import clsx from 'clsx';
import { ComponentChildren } from 'preact';

type Props = JSX.HTMLAttributes<HTMLButtonElement>;

const buttonClasses = clsx(
  'flex h-8 cursor-pointer items-center gap-2 rounded-lg border-2 border-black px-3 hover:bg-slate-100',
);

export function Button({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} className={clsx(buttonClasses, className)} />;
}

export function ButtonLink(props: { children: ComponentChildren; href: string }) {
  // This is a pass-through component
  return <a {...props} className={buttonClasses} />;
}

export function IconButton({ class: className, ...otherProps }: Props) {
  return (
    <button
      {...otherProps}
      className={clsx(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100',
        className,
      )}
    />
  );
}

export function LinkButton({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} className={clsx('cursor-pointer underline', className)} />;
}
