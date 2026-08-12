import { Icon } from "@zstack/icon";
import { Auth } from "@zstack/zsphere-components";
import { DetailNavLayout } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import HostSettingModal from "./action/modify-host-setting";
import NetWorkSettingModal from "./action/modify-network-setting";
import ResourceConfigModal from "./action/modify-resource-config";
import VmSettingModal from "./action/modify-vm-setting";
import HostSetting from "./host-setting";
import NetWorkSetting from "./network-setting";
import ResourceConfig from "./resource-config";
import VmSetting from "./vm-setting";

import style from "./style.module.less";

export interface IProps {
  current: ICluster;
  refetch: Function;
}

const AdvancedSetting: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const [networkSettingVisible, setNetworkSettingVisible] =
    React.useState<boolean>(false);

  const [resourceConfigVisible, setResourceConfigVisible] =
    React.useState<boolean>(false);

  const [hostSettingVisible, setHostSettingVisible] =
    React.useState<boolean>(false);

  const [vmSettingVisible, setVmSettingVisible] =
    React.useState<boolean>(false);

  const memoizedSelectedList = useMemo(() => [current], [current]);

  const pageList = [
    {
      key: "virtualization.cluster.network",
      name: intl.formatMessage({
        id: "cluster.network",
        defaultMessage: "Cluster Network",
      }),
      showTitle: true,
      page: <NetWorkSetting current={current} />,
      actions: (
        <Auth type="action" authKey="modify.config" resource="cluster">
          <div
            className={style.edit}
            onClick={(e) => {
              e?.stopPropagation();

              setNetworkSettingVisible(true);
            }}
          >
            <div className="flex items-center gap-1">
              <Icon type="edit" />
              <span>
                {intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                })}
              </span>
            </div>
          </div>
        </Auth>
      ),
    },
    {
      key: "virtualization.cluster.exceedingAllocation",
      name: intl.formatMessage({
        id: "cluster.exceedingAllocation",
        defaultMessage: "Cluster Overcommit",
      }),
      showTitle: true,
      page: <ResourceConfig current={current} />,
      actions: (
        <Auth type="action" authKey="modify.config" resource="cluster">
          <div
            className={style.edit}
            onClick={(e) => {
              e?.stopPropagation();

              setResourceConfigVisible(true);
            }}
          >
            <div className="flex items-center gap-1">
              <Icon type="edit" />
              <span>
                {intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                })}
              </span>
            </div>
          </div>
        </Auth>
      ),
    },
    {
      key: "virtualization.cluster.host.setting",
      name: intl.formatMessage({
        id: "virtualization.cluster.host.setting",
        defaultMessage: "Host Settings",
      }),
      showTitle: true,
      page: <HostSetting current={current} />,
      actions: (
        <Auth type="action" authKey="modify.config" resource="cluster">
          <div
            className={style.edit}
            onClick={(e) => {
              e?.stopPropagation();

              setHostSettingVisible(true);
            }}
          >
            <div className="flex items-center gap-1">
              <Icon type="edit" />
              <span>
                {intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                })}
              </span>
            </div>
          </div>
        </Auth>
      ),
    },
    {
      key: "virtualization.cluster.vm.setting",
      name: intl.formatMessage({
        id: "virtualization.cluster.vm.setting",
        defaultMessage: "VM Settings",
      }),
      showTitle: true,
      page: <VmSetting current={current} />,
      actions: (
        <Auth type="action" authKey="modify.config" resource="cluster">
          <div
            className={style.edit}
            onClick={(e) => {
              e?.stopPropagation();

              setVmSettingVisible(true);
            }}
          >
            <div className="flex items-center gap-1">
              <Icon type="edit" />
              <span>
                {intl.formatMessage({
                  id: "change",
                  defaultMessage: "Edit",
                })}
              </span>
            </div>
          </div>
        </Auth>
      ),
    },
  ];

  return (
    <div className={style.layout}>
      <DetailNavLayout
        pageList={pageList}
        cacheConfig={{ contentId: "settings" }}
      />

      <NetWorkSettingModal
        view="main"
        position="header"
        width={600}
        title={`${intl.formatMessage({
          id: "change",
        })}${intl.formatMessage({
          id: "cluster.network",
          defaultMessage: "Cluster Network",
        })}`}
        visible={networkSettingVisible}
        setVisible={setNetworkSettingVisible}
        selectedList={memoizedSelectedList}
      />

      <ResourceConfigModal
        view="main"
        position="header"
        width={600}
        title={`${intl.formatMessage({
          id: "change",
        })}${intl.formatMessage({
          id: "cluster.exceedingAllocation",
          defaultMessage: "Cluster Overcommit",
        })}`}
        visible={resourceConfigVisible}
        setVisible={setResourceConfigVisible}
        selectedList={memoizedSelectedList}
      />

      <HostSettingModal
        view="main"
        position="header"
        width={600}
        title={`${intl.formatMessage({
          id: "change",
        })}${intl.formatMessage({
          id: "virtualization.cluster.host.setting",
          defaultMessage: "Host Settings",
        })}`}
        visible={hostSettingVisible}
        setVisible={setHostSettingVisible}
        selectedList={memoizedSelectedList}
      />

      <VmSettingModal
        view="main"
        position="header"
        width={600}
        title={`${intl.formatMessage({
          id: "change",
        })}${intl.formatMessage({
          id: "virtualization.cluster.vm.setting",
          defaultMessage: "VM Settings",
        })}`}
        visible={vmSettingVisible}
        setVisible={setVmSettingVisible}
        selectedList={memoizedSelectedList}
      />
    </div>
  );
};

export default AdvancedSetting;
