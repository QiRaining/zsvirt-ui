import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React from "react";

import GlobalConfigList from "../../../system-parameter/list/global-config-list";
import { useGlobalConfigList } from "./hook";

export interface IProps {
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
  readOnly?: boolean;
}

const LoginPolicyConfig: React.FC<IProps> = ({ ok, readOnly }) => {
  const { allGlobalConfig, globalConfigValueMap } = useGlobalConfigList();

  return (
    <GlobalConfigList
      globalConfigList={allGlobalConfig}
      globalConfigValueMap={globalConfigValueMap}
      ok={ok}
      readOnly={readOnly}
      layout={(pageList: { page: any }[]) => pageList?.[0]?.page}
    />
  );
};

export default React.memo(LoginPolicyConfig);
