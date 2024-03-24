import clsx from 'clsx';
import styles from './Button.module.css';

type Props = JSX.HTMLAttributes<HTMLButtonElement>;

export function Button({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} class={clsx(styles.button, className)} />;
}

export function ButtonLink({ class: className, ...otherProps }: JSX.HTMLAttributes<HTMLAnchorElement>) {
  // This is a pass-through component
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...otherProps} class={clsx(styles.button, className)} />;
}

export function IconButton({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} class={clsx(styles.iconButton, className)} />;
}

export function LinkButton({ class: className, ...otherProps }: Props) {
  return <button {...otherProps} class={clsx(styles.linkButton, className)} />;
}
