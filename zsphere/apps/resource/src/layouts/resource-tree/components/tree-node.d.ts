import { DocumentNode } from "@apollo/client";
import React from "react";

import { TreeResourceType } from "../../utils";
interface IProps {
  title: string;
  titleNode?: React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: TreeResourceType;
  state?: string;
  iconType?: string;
  extra?: React.ReactNode;
}
declare const TreeNodeTitle: React.FC<IProps>;
export default TreeNodeTitle;
interface IResourceTreeNodeTitle extends IProps {
  transform: (data: unknown) => string | undefined;
  query: DocumentNode;
}
export declare function ResourceTreeNodeTitle({
  transform,
  query,
  ...props
}: IResourceTreeNodeTitle): import("react/jsx-runtime").JSX.Element;
