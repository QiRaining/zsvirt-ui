declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.svg?react" {
  import * as React from "react";

  const ReactComponent: React.ForwardRefExoticComponent<
    React.ComponentProps<"svg"> & {
      title?: string;
      titleId?: string;
      desc?: string;
      descId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  export default ReactComponent;
}
