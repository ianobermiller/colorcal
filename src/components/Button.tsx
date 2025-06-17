import { type JSX, splitProps } from 'solid-js';

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

const commonClasses = 'cursor-pointer disabled:opacity-50';
const commonButtonClasses =
    'inline-flex items-center rounded bg-slate-200 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600';
const buttonClasses = 'h-8 gap-2 px-3';

export function Button(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <button
            classList={{
                [buttonClasses]: true,
                [commonButtonClasses]: true,
                [commonClasses]: true,
                [local.class ?? '']: !!local.class,
            }}
            {...others}
        />
    );
}

export function ButtonLink(props: { children: JSX.Element; class?: string; href: string }) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <a
            classList={{
                [buttonClasses]: true,
                [commonButtonClasses]: true,
                [commonClasses]: true,
                [local.class ?? '']: !!local.class,
            }}
            {...others}
        />
    );
}

export function IconButton(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <button
            classList={{
                [commonButtonClasses]: true,
                [commonClasses]: true,
                [local.class ?? '']: !!local.class,
                'size-8 justify-center': true,
            }}
            {...others}
        />
    );
}

export function LinkButton(props: Props) {
    const [local, others] = splitProps(props, ['class']);
    return (
        <button
            classList={{
                [commonClasses]: true,
                [local.class ?? '']: !!local.class,
                underline: true,
            }}
            {...others}
        />
    );
}
