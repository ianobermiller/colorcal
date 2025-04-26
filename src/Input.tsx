import type { ComponentProps } from 'preact/compat';

import { clsx } from 'clsx';
import { forwardRef } from 'preact/compat';

type InputProps = ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      className={clsx(
        'box-border rounded-lg border-2 border-black text-base dark:border-white',
        type !== 'checkbox' && 'inline-block h-8 px-3 leading-8',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});
