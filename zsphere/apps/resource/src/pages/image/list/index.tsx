import type { DocumentNode } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { ImagePlainList } from "zsv_resource_shared/image/mf-index";

import { useActionConfig } from "../config";

interface IProps {
  gql?: DocumentNode;
}

const ImageList: React.FC<
  IProps &
    IListProps<IImage> &
    Partial<Pick<ITableListProps<IImage>, "rowSelection" | "customView">>
> = ({ source, ...props }) => {
  const actionConfig = useActionConfig({ source });

  return (
    <ImagePlainList actionConfig={actionConfig} source={source} {...props} />
  );
};

export default React.memo(ImageList);
