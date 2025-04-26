import type { ComponentProps } from 'preact/compat';

import { forwardRef } from 'preact/compat';

type InputProps = ComponentProps<'input'>;

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
