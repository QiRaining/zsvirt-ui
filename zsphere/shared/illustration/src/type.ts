import React from "react";

import { Illustrations } from "./illustrations-mapping";

export type IllustrationTypes = keyof typeof Illustrations;

export interface IIllustrationProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  type: IllustrationTypes;
  width?: number | string;
  height?: number | string;
  size?: number | string;
}
