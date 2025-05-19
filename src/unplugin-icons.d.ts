declare module '~icons/*' {
  import type { JSX } from 'solid-js';
  const IconComponent: (props: JSX.SvgSVGAttributes<SVGSVGElement>) => JSX.Element;
  export default IconComponent;
}
