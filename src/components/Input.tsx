import type { JSX } from 'solid-js';

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
    return (
        <input
            class={props.class}
            classList={{
                'box-border rounded border border-slate-400 text-base dark:text-slate-400 dark:focus:text-slate-100':
                    true,
                'inline-block h-8 px-3 leading-8': props.type !== 'checkbox',
            }}
            type={props.type}
            {...props}
        />
    );
}
