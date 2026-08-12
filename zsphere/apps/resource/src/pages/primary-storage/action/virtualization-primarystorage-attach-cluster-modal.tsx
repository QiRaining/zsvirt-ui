import React, { useState, useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

const buttonMarginRightStyle = { marginRight: 8 } as const;
import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { ModalSelect } from "@zstack/zsphere-components";
import type { IResource } from "@zstack/zsphere-components/es/modal/action";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Condition } from "@zstack/zsphere-types";
import { Op, ClusterQueryType } from "@zstack/zsphere-types";
import type {
  AttachPrimaryStorageToClusterPayload,
  Cluster as ICluster,
  IscsiServer,
  IscsiServerClusterRefInventory,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import { compact, includes, uniqBy } from "lodash-es";

import VirtualizationClusterList from "../components/cluster-select";

const attachPrimaryStorageToCluster = gql`
  mutation attachPrimaryStorageToCluster(
    $input: AttachPrimaryStorageToClusterInput!
  ) {
    attachPrimaryStorageToCluster(input: $input) {
      actionId
    }
  }
`;

interface IClusterAttachIscsis {
  clusterUuid?: string;
  iscsiServerUuids?: string[];
}

interface IPsAttachIscsis {
  name?: string;
  iscsiUuid?: string;
}

const iscsiServerList = gql`
  query iscsiServerList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    iscsiServerList(
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
    ) {
      total
      list {
        uuid
        name
        iscsiClusterRefs {
          id
          iscsiServerUuid
          clusterUuid
        }
      }
    }
  }
`;
const AttachClusterList: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  source,
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const tableSelectRef = useRef<any>();

  const [iscsiShow, setIscsiShow] = useState<boolean>(false);

  const [
    _iscsiServerList,
    { data: { iscsiServerList: iscsiServerListData = {} } = {} },
  ] = useLazyQuery(iscsiServerList, {
    onCompleted() {
      if (clusterWillAttachISCSI?.nendAttachISCSIList?.length > 0) {
        setIscsiShow(true);
      } else {
        onOk(tableSelectRef.current?.selectedList);
      }
    },
  });

  /*
  整合集群将要绑定的对应所有ISCSI
    1.获取所有Ps绑定iscsi
    2.获取集群已经绑定的iscsi
    3.由1，2，可整合出集群将要绑定的iscsi
  */
  const clusterWillAttachISCSI = useMemo(() => {
    const iscsiServerClusterRefs: IscsiServerClusterRefInventory[] = []; //所有ps绑定的iscsi服务的iscsiClusterRefs
    const clusterAttachIscsis: IClusterAttachIscsis[] = []; //获取cluter所有已经绑定的iscsi
    const clusterWillAttachISCSIList: IClusterAttachIscsis[] = []; //每一个集群对应的将要绑定的iscsi
    const clusterList: ICluster[] = tableSelectRef.current?.selectedList || [];
    let nendAttachISCSIList: IResource[] = []; //弹窗展示资源信息 <==>  所选所有集群将要绑定iscsi
    const psAttachIscsis: IPsAttachIscsis[] = []; //ps已经绑定的iscsi服务的基本信息列表

    iscsiServerListData?.list?.forEach((iscsiServer: IscsiServer) => {
      iscsiServer?.iscsiClusterRefs?.forEach((it) =>
        iscsiServerClusterRefs.push(it),
      );
      psAttachIscsis.push({
        name: iscsiServer?.name,
        iscsiUuid: iscsiServer?.uuid,
      });
    });

    clusterList.forEach((cluster: ICluster) => {
      clusterAttachIscsis.push({
        clusterUuid: cluster.uuid,
        iscsiServerUuids:
          compact(
            iscsiServerClusterRefs.map((it) => {
              if (cluster.uuid === it.clusterUuid) {
                return it.iscsiServerUuid;
              }
            }) || [],
          ) || [],
      });
    });

    clusterAttachIscsis?.forEach((it) => {
      const iscsiUuids: string[] = []; //获取单个集群将要绑定的iscsi
      psAttachIscsis?.forEach((PsAttachIscsiData: IPsAttachIscsis) => {
        if (!includes(it?.iscsiServerUuids, PsAttachIscsiData?.iscsiUuid)) {
          //弹窗列表展示
          nendAttachISCSIList.push({
            uuid: PsAttachIscsiData?.iscsiUuid ?? -1,
            name: PsAttachIscsiData?.name,
          });
          //cluster将要绑定的iscsiUuid
          iscsiUuids.push(PsAttachIscsiData?.iscsiUuid ?? -1);
        }
      });

      clusterWillAttachISCSIList.push({
        clusterUuid: it?.clusterUuid,
        iscsiServerUuids: iscsiUuids,
      });
    });

    nendAttachISCSIList = uniqBy(nendAttachISCSIList, "uuid");

    return {
      nendAttachISCSIList,
      clusterWillAttachISCSIList,
    };
  }, [iscsiServerListData]);

  const ps: any = useMemo(() => {
    if (source?.__typename === "Zone" || source?.__typename === "Cluster") {
      return selectedList?.[0];
    }
    return source || selectedList?.[0];
  }, [selectedList?.[0], source]);

  const onOk = (values: ICluster[]) => {
    const clusterList: ICluster[] = values || [];

    const payload: AttachPrimaryStorageToClusterPayload[] = clusterList?.map(
      (it: ICluster) => {
        return {
          clusterUuid: it.uuid,
          primaryStorageUuid: ps?.uuid,
        };
      },
    );

    if (clusterWillAttachISCSI?.nendAttachISCSIList?.length > 0) {
      payload.forEach((it) => {
        clusterWillAttachISCSI?.clusterWillAttachISCSIList?.forEach((item) => {
          if (item.clusterUuid === it.clusterUuid) {
            it.iscsiServerUuids = item.iscsiServerUuids;
          }
        });
      });
    }

    doAction({
      mutation: attachPrimaryStorageToCluster,
      payload,
      name: intl.formatMessage({
        id: "attach.cluster",
        defaultMessage: "Attach Cluster",
      }),
      total: clusterList?.length || 1,
      type: "PrimaryStorageVO",
      onFinish: () => {
        refetch?.();
      },
    });
    tableSelectRef.current?.setSelectedList?.([]);
    setSelectedList?.([]);
    setIscsiShow(false);
    setVisible(false);
  };

  useEffect(() => {
    tableSelectRef.current?.setSelectedList?.([]);
  }, [visible]);

  const defaultQuery = useMemo(() => {
    const conditions: Condition[] = [];

    const extraConditions: Condition[] = [
      { key: "type", op: Op.eq, value: ps?.type },
      { key: "__PrimaryStorageUuids__", op: Op.in, values: [ps?.uuid] },
      {
        key: "cephToken",
        op: Op.eq,
        value: ps?.systemTag?.cephToken ?? "",
      },
      {
        key: "isOpensource",
        op: Op.eq,
        value: "true",
      },
    ];

    if (ps?.zoneUuid) {
      conditions.push({
        key: "zoneUuid",
        op: Op.eq,
        value: ps?.zoneUuid,
      });
    }

    if (
      ps?.type === "SharedBlock" ||
      ps?.type === "Ceph" ||
      ps?.type === "Addon"
    ) {
      conditions.push({
        key: "hypervisorType",
        op: Op.notIn,
        values: ["ESX", "baremetal"],
      });
    } else {
      conditions.push({
        key: "hypervisorType",
        op: Op.notIn,
        values: ["ESX", "baremetal", "baremetal2"],
      });
    }
    if (ps?.type === "Addon") {
      extraConditions.push({
        key: "defaultProtocol",
        op: Op.eq,
        value: ps?.defaultProtocol,
      });
    }

    return {
      type: ClusterQueryType.PsAttachableCluster,
      conditions,
      extraConditions,
    };
  }, [ps?.type, ps?.uuid, ps?.defaultProtocol]);

  const confirm = (values: ICluster[]) => {
    //只有SharedBlock需要查询绑定的iscsi
    if (ps?.type === "SharedBlock") {
      _iscsiServerList({
        variables: {
          conditions: [
            {
              key: "__SharedBlockUuids__",
              op: Op.has,
              values: [ps?.uuid],
            },
          ],
        },
      });
    } else {
      onOk(values);
    }
  };

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "select.cluster",
          defaultMessage: "Select Cluster",
        })}
        selectType="checkbox"
        modalWidth={800}
        visible={visible}
        setVisible={setVisible}
        showSelect={false}
        ref={tableSelectRef}
        renderFooter={({ onCancel, selectedList: values }) => {
          return (
            <>
              <Button
                variant="link"
                onClick={() => {
                  onCancel();
                }}
                style={buttonMarginRightStyle}
              >
                {intl.formatMessage({
                  id: "cancel",
                  defaultMessage: "Cancel",
                })}
              </Button>
              <Button
                onClick={() => {
                  confirm(values);
                }}
                variant="primary"
                disabled={!values.length}
              >
                {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </>
          );
        }}
        resourceName={formatResourceName(selectedList, intl) ?? source?.name}
      >
        <VirtualizationClusterList
          current={selectedList?.[0]}
          view="select.primary.storage"
          defaultQuery={defaultQuery}
        />
      </ModalSelect>

      <DialogP3
        visible={iscsiShow}
        setVisible={setIscsiShow}
        title={intl.formatMessage({
          id: "cluster.modal.title.confirm.attach.iscsiStorage",
          defaultMessage: "Attach iSCSI Storage Synchronously？",
        })}
        bannerMessage={intl.formatMessage({
          id: "cluster.modal.attach.iscsiServerStorage.alert",
          defaultMessage:
            "The SAN Storage Data Storage uses LUNs provided by iSCSI storage that has not been attached to the current cluster. To ensure that you use the SAN Storage Data Storage normally, the system attaches the iSCSI storage to the same cluster synchronously.",
        })}
        resourceNames={(clusterWillAttachISCSI?.nendAttachISCSIList || []).map(
          (r: IResource) => r.name ?? "",
        )}
        onConfirm={() => onOk(tableSelectRef.current?.selectedList)}
      />
    </>
  );
};

export default AttachClusterList;
