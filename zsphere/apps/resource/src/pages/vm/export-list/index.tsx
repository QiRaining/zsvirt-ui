import { ovfExportList } from "@zstack/virtualization-resource/src/gql/vm.gql";
import type { ITableListProps } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import { useActionConfig } from "../config";

const toolbar: ITableListProps<IVM>["toolbar"] = [
  "refresh",
  "operation",
  "search",
  "setting",
  "export",
];

const ExportList: React.FC<Partial<ITableListProps<IVM>>> = ({ ...props }) => {
  const defaultActionConfig = useActionConfig();

  let _toolbar = toolbar;

  if (props?.view?.startsWith("sub")) {
    _toolbar = toolbar.filter((it) => it !== "export");
  }

  return (
    <VmPlainList
      actionConfig={props.actionConfig || defaultActionConfig}
      toolbar={_toolbar}
      gql={ovfExportList}
      {...props}
    />
  );
};

export default ExportList;
