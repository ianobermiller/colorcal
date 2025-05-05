import type { ComponentProps } from 'preact/compat';

import { clsx } from 'clsx';
import { forwardRef } from 'preact/compat';

type TextareaProps = ComponentProps<'textarea'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={clsx(
        'box-border block w-full resize-y rounded border border-slate-400 text-base dark:text-slate-400 dark:focus:text-slate-100',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
