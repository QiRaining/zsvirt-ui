import React from "react";
export type ILinkResource =
  | string
  | {
      path: string;
      microAppName: string;
    };
interface ILinkProps {
  to: ILinkResource;
  uuid: string;
  children: React.ReactNode;
}
declare const Link: React.FC<ILinkProps>;
export { Link };
