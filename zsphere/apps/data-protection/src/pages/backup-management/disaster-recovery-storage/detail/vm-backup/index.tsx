import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useState } from "react";
import { ProtectedResourceContext } from "zsv_data_protection_shared/backup-management/protected-resource/vm/mf-index";

import VmContainer from "../../../protected-resource/components/vmContainer";

interface IProps {
  current: IZSVBackupStorage;
}

const VmBackup: FC<IProps> = ({ current }) => {
  const [store, setStore] = useState({});
  return (
    <ProtectedResourceContext.Provider value={{ store, setStore }}>
      <VmContainer source={current} store={store} setStore={setStore} />
    </ProtectedResourceContext.Provider>
  );
};

export default VmBackup;
