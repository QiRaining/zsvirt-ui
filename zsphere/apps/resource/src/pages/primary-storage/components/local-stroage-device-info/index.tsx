import type { FormProps } from "antd/lib/form";
import React, { useContext } from "react";

import { SharedResourceDataContext } from "../../create/contexts/storageContexts";
import type { ISharedResourceDataContext } from "../../create/type";
import LocalStorageFreediskInfo from "../freedisk-info";
import MountPath from "../mountPath";

interface IProps {
  form: FormProps["form"];
}

const LocalStorageDeviceInfo: React.FC<IProps> = ({ form }) => {
  const { hostDataInTable, diskInfo, setDiskInfo } = useContext(
    SharedResourceDataContext,
  ) as ISharedResourceDataContext;
  return (
    <>
      <MountPath form={form} />
      <LocalStorageFreediskInfo
        hostDataInTable={hostDataInTable}
        diskInfo={diskInfo}
        setDiskInfo={setDiskInfo}
        form={form}
        freeDiskSelectorType="multiple"
      />
    </>
  );
};

export default LocalStorageDeviceInfo;
