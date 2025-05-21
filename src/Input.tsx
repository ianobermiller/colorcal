import type { JSX } from 'solid-js';

import clsx from 'clsx';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
    return (
        <input
            class={clsx(
                'box-border rounded border border-slate-400 text-base dark:text-slate-400 dark:focus:text-slate-100',
                props.type !== 'checkbox' && 'inline-block h-8 px-3 leading-8',
                props.class,
            )}
            type={props.type}
            {...props}
        />
    );
}
