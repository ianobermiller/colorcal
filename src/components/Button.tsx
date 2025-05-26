import type { JSX } from 'solid-js';

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonClasses =
    'inline-flex h-8 cursor-pointer items-center gap-2 rounded px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';

export function Button(props: Props) {
    return <button {...props} classList={{ [buttonClasses]: true, [props.class ?? '']: true }} />;
}

export function ButtonLink(props: { children: JSX.Element; class?: string; href: string }) {
    // This is a pass-through component
    return <a {...props} classList={{ [buttonClasses]: true, [props.class ?? '']: true }} />;
}

export function IconButton(props: Props) {
    return (
        <button
            {...props}
            classList={{
                'inline-flex size-8 cursor-pointer items-center justify-center rounded bg-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600':
                    true,
                [props.class ?? '']: true,
            }}
        />
    );
}

export function LinkButton(props: Props) {
    return <button {...props} classList={{ 'cursor-pointer underline': true, [props.class ?? '']: true }} />;
}
