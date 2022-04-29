import clsx from "clsx";
import styles from "./Button.module.css";

export function Button({
  class: className,
  ...otherProps
}: JSX.HTMLAttributes<HTMLButtonElement>) {
  return <button {...otherProps} class={clsx(styles.button, className)} />;
}

export function IconButton({
  class: className,
  ...otherProps
}: JSX.HTMLAttributes<HTMLButtonElement>) {
  return <button {...otherProps} class={clsx(styles.iconButton, className)} />;
}
