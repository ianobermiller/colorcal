import type { JSX } from 'solid-js';

import XIcon from '~icons/feather/x';

import { IconButton } from './Button';

interface Props {
    children: JSX.Element;
    onClose(): void;
    title: string;
}

export function Modal(props: Props) {
    const handleScrimClick = (e: MouseEvent) => {
        if (e.target !== e.currentTarget) {
            return;
        }

        props.onClose();
    };

    return (
        <div class="fixed inset-0 flex items-start justify-center bg-black/50 px-4 pt-12" onClick={handleScrimClick}>
            <div class="flex w-full flex-col gap-4 rounded border-slate-300 bg-white px-6 py-2 shadow-lg md:max-w-lg dark:bg-slate-800">
                <header class="flex items-center justify-between border-b border-slate-400 py-3">
                    <h2 class="text-lg font-bold">{props.title}</h2>
                    <IconButton onClick={props.onClose}>
                        <XIcon height="16" width="16" />
                    </IconButton>
                </header>
                {props.children}
            </div>
        </div>
    );
}
