import clsx from 'clsx';
import { ComponentChildren } from 'preact';

type Props = JSX.HTMLAttributes<HTMLButtonElement>;

const buttonClasses = clsx(
  'flex h-8 cursor-pointer items-center gap-2 rounded-lg border-2 border-black px-3 hover:bg-slate-100',
);

export function Button({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} class={clsx(buttonClasses, className)} />;
}

export function ButtonLink(props: { children: ComponentChildren; href: string }) {
  // This is a pass-through component
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...props} class={buttonClasses} />;
}

export function IconButton({ class: className, ...otherProps }: Props) {
  return (
    <button
      {...otherProps}
      class={clsx(
        'inline-flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100',
        className,
      )}
    />
  );
}

export function LinkButton({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} class={clsx('cursor-pointer underline', className)} />;
}
