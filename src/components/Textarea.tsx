import { type JSX, splitProps } from 'solid-js';

type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <textarea
            classList={{
                'box-border block w-full resize-y rounded border border-slate-400 p-2 text-base dark:text-slate-400 dark:focus:text-slate-100':
                    true,
                [local.class ?? '']: !!local.class,
            }}
            {...others}
        />
    );
}
