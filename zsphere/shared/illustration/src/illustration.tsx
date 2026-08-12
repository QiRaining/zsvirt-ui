import cls from "classnames";
import * as React from "react";

import { Illustrations } from "./illustrations-mapping";

export type IllustrationName = keyof typeof Illustrations;

export { Illustrations };

interface IllustrationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  type: IllustrationName;
  width?: number | string;
  height?: number | string;
  size?: number | string;
}

export const Illustration: React.FC<IllustrationProps> = ({
  type,
  className,
  width,
  height,
  size,
  style,
  ...props
}) => {
  const illustrationSrc = Illustrations[type];
  if (!illustrationSrc) {
    console.warn(`Illustration type "${type}" not found`);
    return null;
  }

  const finalWidth = width ?? (size !== undefined ? size : "auto");
  const finalHeight = height ?? (size !== undefined ? size : "auto");

  const imageStyle: React.CSSProperties = {
    width: finalWidth,
    height: finalHeight,
    ...style,
  };

  return (
    <img
      src={illustrationSrc}
      alt={type}
      className={cls("illustration", className)}
      style={imageStyle}
      {...props}
    />
  );
};
