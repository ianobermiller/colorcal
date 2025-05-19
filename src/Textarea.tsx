import type { JSX } from 'solid-js';

import clsx from 'clsx';

type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      class={clsx(
        'box-border block w-full resize-y rounded border border-slate-400 text-base dark:text-slate-400 dark:focus:text-slate-100',
        props.class
      )}
      {...props}
    />
  );
}
