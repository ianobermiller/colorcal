import { type JSX, splitProps } from 'solid-js';

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const buttonClasses =
    'inline-flex h-8 cursor-pointer items-center gap-2 rounded px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600';

export function Button(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return <button classList={{ [buttonClasses]: true, [local.class ?? '']: !!local.class }} {...others} />;
}

export function ButtonLink(props: { children: JSX.Element; class?: string; href: string }) {
    const [local, others] = splitProps(props, ['class']);
    // This is a pass-through component
    return <a classList={{ [buttonClasses]: true, [local.class ?? '']: !!local.class }} {...others} />;
}

export function IconButton(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <button
            classList={{
                'inline-flex size-8 cursor-pointer items-center justify-center rounded bg-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600':
                    true,
                [local.class ?? '']: !!local.class,
            }}
            {...others}
        />
    );
}

export function LinkButton(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return <button classList={{ 'cursor-pointer underline': true, [local.class ?? '']: !!local.class }} {...others} />;
}
