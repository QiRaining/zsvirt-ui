import { createElement, forwardRef } from "react";
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  colorNumber?: number;
};

export type IconComponent = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

type SvgIconComponent = ForwardRefExoticComponent<
  SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement>
>;

export const createIconComponent = (
  SvgIcon: SvgIconComponent,
): IconComponent => {
  const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ size, width, height, colorNumber: _colorNumber, ...svgProps }, ref) => {
      const resolvedWidth = width ?? size;
      const resolvedHeight = height ?? size;
      const nextProps: SVGProps<SVGSVGElement> & RefAttributes<SVGSVGElement> =
        {
          ...svgProps,
        };

      if (resolvedWidth !== undefined) {
        nextProps.width = resolvedWidth;
      }

      if (resolvedHeight !== undefined) {
        nextProps.height = resolvedHeight;
      }

      if (ref) {
        nextProps.ref = ref;
      }

      return createElement(SvgIcon, nextProps);
    },
  );

  Icon.displayName = SvgIcon.displayName ?? SvgIcon.name;

  return Icon;
};
