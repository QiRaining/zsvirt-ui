import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import React from "react";
import { useIntl } from "react-intl";

import type { ITabsConfigProps } from "../../components";
import { Title, TabsConfig } from "../../components";
import HostSetting from "./host-setting";
import NetworkSetting from "./network-setting";
import ResourceConfig from "./resource-config";
import VmSetting from "./vm-setting";

import style from "./style.module.less";

export interface IProps {
  form: FormInstance;
  selectedList?: IZone[];
  isCreate?: boolean;
}

const AdvancedConfig: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();

  const items = React.useMemo<ITabsConfigProps["items"]>(
    () => [
      {
        key: "virtualization.cluster.network",
        closable: false,
        label: intl.formatMessage({
          id: "cluster.network",
          defaultMessage: "Cluster Network",
        }),
        children: <NetworkSetting form={form} />,
      },
      {
        key: "virtualization.cluster.exceedingAllocation",
        closable: false,
        label: intl.formatMessage({
          id: "cluster.exceedingAllocation",
          defaultMessage: "Cluster Overcommit",
        }),
        children: <ResourceConfig />,
      },
      {
        key: "virtualization.cluster.host.setting",
        closable: false,
        label: intl.formatMessage({
          id: "virtualization.cluster.host.setting",
          defaultMessage: "Host Settings",
        }),
        children: <HostSetting form={form} isCreate={isCreate} />,
      },
      {
        key: "virtualization.cluster.vm.setting",
        closable: false,
        label: intl.formatMessage({
          id: "virtualization.cluster.vm.setting",
          defaultMessage: "VM Settings",
        }),
        children: <VmSetting form={form} isCreate={isCreate} />,
      },
    ],
    [intl, form, isCreate],
  );

  const [activeKey, setActiveKey] = React.useState(items[0].key);

  return (
    <>
      <div className={style.card}>
        <Title
          title={intl.formatMessage({
            id: "advance.settings",
            defaultMessage: "Advanced Settings",
          })}
        />
      </div>
      <TabsConfig activeKey={activeKey} onChange={setActiveKey} items={items} />
    </>
  );
};

export default AdvancedConfig;
