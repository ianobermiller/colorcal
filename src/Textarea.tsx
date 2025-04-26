import type { ComponentProps } from 'preact/compat';

import { forwardRef } from 'preact/compat';

type TextareaProps = ComponentProps<'textarea'>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  return <textarea ref={ref} {...props} />;
});
