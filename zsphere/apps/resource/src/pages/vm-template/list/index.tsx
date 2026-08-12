import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { VmTemplate as IVMTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";
import { VMTemplatePlainList } from "zsv_resource_shared/vm-template/mf-index";

import { useActionConfig } from "../config";

const VMTemplateList: React.FC<
  IListProps<IVMTemplate> &
    Partial<Pick<ITableListProps<IVMTemplate>, "rowSelection" | "customView">>
> = ({ ...props }) => {
  const actionConfig = useActionConfig();

  return <VMTemplatePlainList actionConfig={actionConfig} {...props} />;
};

export default React.memo(VMTemplateList);
