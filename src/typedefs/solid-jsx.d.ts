// Type definitions for SolidJS JSX
import 'solid-js';

declare module 'solid-js' {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface HTMLAttributes<T> {
            // Allow 'class' attribute in SolidJS components
            class?: string;
            className?: never;
        }
    }
}
