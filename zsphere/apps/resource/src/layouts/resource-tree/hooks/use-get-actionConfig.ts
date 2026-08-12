import { useActionConfig as useBackupStorageActionConfig } from "@zstack/virtualization-resource/src/pages/backup-storage/config";
import { useActionConfig as useClusterActionConfig } from "@zstack/virtualization-resource/src/pages/cluster/config";
import { useActionConfig as useDirectoryActionConfig } from "@zstack/virtualization-resource/src/pages/directory/config";
import { useActionConfig as useHostActionConfig } from "@zstack/virtualization-resource/src/pages/host/config";
import { useActionConfig as useImageActionConfig } from "@zstack/virtualization-resource/src/pages/image/config";
import { useActionConfig as useL2NetworkActionConfig } from "@zstack/virtualization-resource/src/pages/l2-network/config";
import { useActionConfig as useL3NetworkActionConfig } from "@zstack/virtualization-resource/src/pages/l3-network/config";
import { useActionConfig as usePrimaryStorageActionConfig } from "@zstack/virtualization-resource/src/pages/primary-storage/config";
import { useActionConfig as useRootNodeActionConfig } from "@zstack/virtualization-resource/src/pages/root-node/config";
import { useActionConfig as useVMTemplateActionConfig } from "@zstack/virtualization-resource/src/pages/vm-template/config";
import { useActionConfig as useVmActionConfig } from "@zstack/virtualization-resource/src/pages/vm/config";
import { useActionConfig as useZoneActionConfig } from "@zstack/virtualization-resource/src/pages/zone/mf-index";
import { VmQueryType } from "@zstack/zsphere-types";
import qs from "qs";
import { useCallback, useMemo } from "react";
import { useLocation } from "react-router";

import type { NavigationType } from "../../constant";
import {
  DEFAULT_LEFT_NAV_KEY,
  DEFAULT_NAV_VIEW,
  LeftNavType,
} from "../../constant";

export const useResourceActionConfig = () => {
  const location = useLocation();
  //树的大类
  const activeMenuKey: NavigationType = useMemo(() => {
    return (
      (qs.parse(window.location.search, { ignoreQueryPrefix: true })?.[
        DEFAULT_LEFT_NAV_KEY
      ] as NavigationType) ?? ("virtualization.cluster.host" as NavigationType)
    );
  }, [location.search]);

  const view = useCallback(() => {
    //不同视角，不同操作
    if (activeMenuKey === LeftNavType.Network) {
      return "virtualization.dir.network.resource";
    }
    if (
      activeMenuKey === LeftNavType.TemplateVm &&
      qs.parse(window.location.search, { ignoreQueryPrefix: true })?.[
        DEFAULT_NAV_VIEW
      ] === "template"
    ) {
      return "virtualization.dir";
    }
    if (activeMenuKey === LeftNavType.TemplateVm) {
      return "virtualization.dir.template.image";
    }
    return "virtualization.dir";
  }, [activeMenuKey]);

  const actionConfigs = {
    "root-node": useRootNodeActionConfig(),
    directory: useDirectoryActionConfig(),
    zone: useZoneActionConfig(),
    cluster: useClusterActionConfig(),
    host: useHostActionConfig(),
    vm: useVmActionConfig(),
    "l2-network": useL2NetworkActionConfig(),
    "l3-network": useL3NetworkActionConfig(),
    //镜像模板
    "backup-storage": useBackupStorageActionConfig(),

    image: useImageActionConfig(),
    "vm-template": useVMTemplateActionConfig(),

    //数据存储
    "primary-storage": usePrimaryStorageActionConfig(),

    "baremetal-chassis": [],
    "baremetal-cluster": [],
    "baremetal-instance": [],
  };

  const defaultQuery = {
    "root-node": {},
    directory: {},
    zone: {},
    cluster: {},
    host: {},
    vm: {},
    "l2-network": {},
    "l3-network": {},
    //镜像模板
    "backup-storage": {},

    image: {},
    "vm-template": {
      type: VmQueryType.GetVmInstanceTemplate,
    },

    //数据存储
    "primary-storage": {},

    //裸金属
    "baremetal-chassis": {},
    "baremetal-cluster": {},
    "baremetal-instance": {},
  };

  return {
    view,
    actionConfigs,
    defaultQuery,
  };
};
