import type { ComponentProps } from 'preact/compat';

import { clsx } from 'clsx';
import { forwardRef } from 'preact/compat';

type TextareaProps = ComponentProps<'textarea'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={clsx(
        'box-border block w-full resize-y rounded-lg border-2 border-black p-3 text-base dark:border-white',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
