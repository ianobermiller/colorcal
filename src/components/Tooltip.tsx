import type { JSX } from 'solid-js';

import { createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

interface Props {
    children: JSX.Element;
    class?: string;
    content?: string;
    delay?: number;
}

export function Tooltip(props: Props) {
    const [isVisible, setIsVisible] = createSignal(false);
    let timeout: number | undefined;
    let parentRef: HTMLDivElement | undefined;

    const showTooltip = () => {
        timeout = window.setTimeout(() => {
            setIsVisible(true);
        }, props.delay ?? 200);
    };

    const hideTooltip = () => {
        clearTimeout(timeout);
        setIsVisible(false);
    };

    onCleanup(() => {
        clearTimeout(timeout);
    });

    const positionTooltip = (tooltipEl: HTMLDivElement, spanEl: HTMLSpanElement) => {
        if (!parentRef) return;

        const rect = parentRef.getBoundingClientRect();
        const EDGE_THRESHOLD = 100; // px from screen edge to trigger alignment change

        // Position centered by default
        tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
        tooltipEl.style.top = `${rect.top - 8}px`;

        // Check if too close to screen edges
        if (rect.left < EDGE_THRESHOLD) {
            // Too close to left edge
            spanEl.classList.remove('-translate-x-1/2');
            spanEl.classList.add('left-0');
        } else if (window.innerWidth - (rect.left + rect.width) < EDGE_THRESHOLD) {
            // Too close to right edge
            spanEl.classList.remove('-translate-x-1/2');
            spanEl.classList.add('right-0');
        }
    };

    return (
        <div class={props.class} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} ref={parentRef}>
            {props.children}
            <Show when={isVisible() && props.content}>
                <Portal>
                    <div
                        class="fixed"
                        ref={(tooltipEl) => {
                            const spanEl = tooltipEl.querySelector('span');
                            if (spanEl instanceof HTMLSpanElement) {
                                requestAnimationFrame(() => positionTooltip(tooltipEl, spanEl));
                            }
                        }}
                    >
                        <span class="absolute bottom-full left-1/2 mb-2 w-50 -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-center text-sm break-words text-white">
                            {props.content}
                        </span>
                    </div>
                </Portal>
            </Show>
        </div>
    );
}
