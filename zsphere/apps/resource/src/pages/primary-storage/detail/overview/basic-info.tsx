import { useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { getBlockDeviceInfo } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import ModifyCephx from "@zstack/virtualization-resource/src/pages/primary-storage/action/modify-cephx-modal";
import ModifyProvision from "@zstack/virtualization-resource/src/pages/primary-storage/action/modify-provision-modal";
import ModifyStorageNetworkCidr from "@zstack/virtualization-resource/src/pages/primary-storage/action/modify-storage-network-cidr-modal";
import PrimaryStorageState from "@zstack/virtualization-resource/src/pages/primary-storage/components/state";
import PrimaryStorageStatus from "@zstack/virtualization-resource/src/pages/primary-storage/components/status";
import {
  Auth,
  AuthHander,
  DraggableCard,
  useAuth,
} from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Switch } from "@zstack/zsphere-components";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { isZbsStorage } from "@zstack/zsphere-utils";
import { includes, concat } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { renderPrimaryStorageType } from "../../config/useColumnConfig";

import style from "./style.module.less";

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  detail: IPrimaryStorage;
  refetch?: Function;
}

const BasicInfo: React.FC<IProps> = ({
  onCollapseChange,
  collapsed = false,
  detail,
  refetch,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [storageNetworkCidrVisible, setStorageNetworkCidrVisible] =
    useState<boolean>(false);
  const [provisionVisible, setProvisionVisible] = useState<boolean>(false);
  const [cephxVisible, setCephxVisible] = useState<boolean>(false);
  const { getServerTime } = useTime();

  const cephxAuth = {
    type: "action" as const,
    resource: "primary.storage",
    authKey: "set.cephx",
  };

  const [getBlockDevice, { data }] = useLazyQuery(getBlockDeviceInfo, {
    variables: {
      uuid: detail?.uuid,
    },
  });
  const { ip, port } = data?.getBlockDeviceInfo || {};

  useEffect(() => {
    if (detail?.type === "BlockStorage" && !!detail?.uuid) {
      getBlockDevice();
    }
  }, [getBlockDevice, detail?.type, detail?.uuid]);

  const list: ListItem[] = useMemo(() => {
    const _list: ListItem[] = [
      {
        label: intl.formatMessage({ id: "state", defaultMessage: "State" }),
        value: <PrimaryStorageState state={detail?.state ?? -1} />,
      },
      {
        label: intl.formatMessage({ id: "status", defaultMessage: "Status" }),
        value: <PrimaryStorageStatus status={detail?.status ?? -1} />,
      },
      {
        label: intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        }),
        value: renderPrimaryStorageType(detail),
      },
    ];

    if (isZbsStorage(detail)) {
      _list.push({
        label: intl.formatMessage({
          id: "mds.count",
          defaultMessage: "MDS Node",
        }),
        value: detail?.cbdMdsCount,
      });
    }

    if (!includes(["Ceph"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "url",
          defaultMessage: "URL",
        }),
        value: detail?.url,
      });
    }

    if (includes(["NFS"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "mountParameters",
          defaultMessage: "Parameter Mounting",
        }),
        value: detail?.systemTag?.nfsMountOptions ? (
          <Text>{detail?.systemTag?.nfsMountOptions}</Text>
        ) : (
          intl.formatMessage({
            id: "none",
            defaultMessage: "None",
          })
        ),
      });
    }

    if (
      includes(["NFS", "SharedMountPoint", "SharedBlock", "Ceph"], detail?.type)
    ) {
      _list.push({
        label: intl.formatMessage({
          id: "storageNetwork",
          defaultMessage: "Storage Network",
        }),
        value: (
          <div className="flex">
            <div className="w-1/2">{detail?.systemTag?.gatewayCidr}</div>
            <Auth
              type="action"
              authKey="modify.storage.network"
              resource="primary.storage"
            >
              <div
                className={`w-1/2 ${style["action-link"]}`}
                onClick={() => setStorageNetworkCidrVisible(true)}
              >
                {intl.formatMessage({ id: "modify", defaultMessage: "Edit" })}
              </div>
            </Auth>
          </div>
        ),
      });
    }

    if (includes(["Ceph"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "cephx",
          defaultMessage: "Cephx",
        }),
        value: (
          <AuthHander {...cephxAuth}>
            <Switch
              disabled={!hasAuth(cephxAuth)}
              checked={detail?.systemTag?.nocephx !== true}
              onClick={() => setCephxVisible(true)}
            />
          </AuthHander>
        ),
      });
    }

    if (includes(["SharedBlock", "BlockStorage"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "virtualization.default.provisioning.type",
          defaultMessage: "Default Provisioning Method of Storage Space",
        }),
        value: (
          <div className="flex">
            <div className="w-1/2">
              {(detail?.systemTag?.thinProvision as boolean)
                ? intl.formatMessage({
                    id: "thinProvision",
                    defaultMessage: "Thin Provision",
                  })
                : intl.formatMessage({
                    id: "thickProvision",
                    defaultMessage: "Thick Provision",
                  })}
            </div>
            <Auth
              type="action"
              authKey="modify.storage.provisionMode"
              resource="primary.storage"
            >
              <div
                className={`w-1/2 ${style["action-link"]}`}
                onClick={() => setProvisionVisible(true)}
              >
                {intl.formatMessage({ id: "modify", defaultMessage: "Edit" })}
              </div>
            </Auth>
          </div>
        ),
      });
    }

    if (includes(["BlockStorage"], detail?.type)) {
      _list.push({
        label: intl.formatMessage({
          id: "RESTful.IP",
          defaultMessage: "RESTful IP",
        }),
        value: `${ip}:${port}`,
      });
    }

    return concat(_list, [
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={detail?.description || undefined} canModify />,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{detail?.uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: getServerTime(detail?.createDate ?? -1).format(
          "YYYY-MM-DD HH:mm:ss",
        ),
      },
      //  去除所有最后操作时间
      // {
      //   label: intl.formatMessage({ id: 'last.op.date', defaultMessage: '最后操作时间' }),
      //   value: getServerTime(detail?.lastOpDate ?? -1).format('YYYY-MM-DD HH:mm:ss')
      // }
    ]);
  }, [detail, intl, getServerTime]);

  const memoizedSelectedList = useMemo(() => [detail], [detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "basic.info",
          defaultMessage: "Basic Info",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <ModifyStorageNetworkCidr
        visible={storageNetworkCidrVisible}
        selectedList={memoizedSelectedList}
        setVisible={setStorageNetworkCidrVisible}
        refetch={refetch}
        view="sub"
        position="header"
      />
      <ModifyProvision
        visible={provisionVisible}
        selectedList={memoizedSelectedList}
        setVisible={setProvisionVisible}
        refetch={refetch}
        view="sub"
        position="header"
      />
      <ModifyCephx
        visible={cephxVisible}
        selectedList={memoizedSelectedList}
        setVisible={setCephxVisible}
        refetch={refetch}
        view="sub"
        position="header"
      />
    </>
  );
};

export default BasicInfo;
