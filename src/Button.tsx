import type { JSX } from 'solid-js';

import clsx from 'clsx';

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonClasses = clsx(
    'inline-flex h-8 cursor-pointer items-center gap-2 rounded px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600',
);

export function Button(props: Props) {
    return <button {...props} class={clsx(buttonClasses, props.class)} />;
}

export function ButtonLink(props: { children: JSX.Element; href: string }) {
    // This is a pass-through component
    return <a {...props} class={buttonClasses} />;
}

export function IconButton(props: Props) {
    return (
        <button
            {...props}
            class={clsx(
                'inline-flex size-8 cursor-pointer items-center justify-center rounded bg-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600',
                props.class,
            )}
        />
    );
}

export function LinkButton(props: Props) {
    return <button {...props} class={clsx('cursor-pointer underline', props.class)} />;
}
