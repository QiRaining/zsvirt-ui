import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import {
  clusterSummary,
  detachL2NetworkFromCluster,
} from "@zstack/virtualization-resource/src/gql/cluster.gql";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type { Cluster, L2Network } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

const DetachConfirmModal: React.FC<IActionWrapperProps<Cluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { current } = source ?? {};
  const l2 = current as L2Network;
  const l2NetworkUuid = l2?.uuid;
  const allBaremetal = selectedList?.every(
    (item) => item.hypervisorType === "baremetal",
  );

  const onOk = () => {
    const payload = selectedList?.map((item) => ({
      l2NetworkUuid,
      clusterUuid: item.uuid,
    }));
    doAction({
      mutation: detachL2NetworkFromCluster,
      payload,
      name: intl.formatMessage({
        id: "detach.cluster",
        defaultMessage: "Detach Cluster",
      }),
      total: 1,
      type: "L2Network",
    });
    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogP0
      bannerMessage={
        !allBaremetal
          ? intl.formatMessage({
              id: "detach.l2Network.alert",
              defaultMessage:
                "After detaching a cluster, the corresponding VM NICs will be removed. Proceed with caution.",
            })
          : undefined
      }
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "l2Network.modal.title.confirm.detach.cluster",
        defaultMessage: "Detach Cluster?",
      })}
      resourceType={intl.formatMessage({
        id: "cluster",
        defaultMessage: "Cluster",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      guide={intl.formatMessage({ id: "detach", defaultMessage: "Detach" })}
    />
  );
};

const DetachCluster: React.FC<IActionWrapperProps<L2Network>> = ({
  view,
  position,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const [clusterType, setClusterType] = useState("normal");
  const [value, onChange] = useState<Cluster[]>([]);
  const l2 = selectedList?.[0];
  const showBaremetalOnly = l2?.isDefault;

  const [getClusterSummary, { data }] = useLazyQuery(clusterSummary, {
    fetchPolicy: "no-cache",
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: l2?.attachedClusterUuids ?? [],
        },
      ],
    },
  });

  React.useEffect(() => {
    if (!visible) {
      onChange([]);
    } else if (!showBaremetalOnly) {
      getClusterSummary();
    }
  }, [visible, showBaremetalOnly, getClusterSummary]);

  const [v, setV] = React.useState(false);
  const [sel, setSel] = React.useState<Cluster[]>([]);

  const onOk = (values?: Cluster[]) => {
    setV(true);
    setSel(values ?? []);
  };

  const defaultQuery = useMemo(() => {
    return {
      type: ClusterQueryType.Normal,
      conditions: [
        {
          key: "hypervisorType",
          op: clusterType === "normal" && !showBaremetalOnly ? Op.notIn : Op.in,
          values: ["baremetal"],
        },
        {
          key: "uuid",
          values: l2?.attachedClusterUuids,
          op: Op.in,
        },
      ],
    };
  }, [l2, clusterType, showBaremetalOnly]);

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "detach.cluster",
          defaultMessage: "Detach Cluster",
        })}
        value={value}
        visible={visible}
        onChange={onChange}
        showSelect={false}
        setVisible={setVisible}
        selectType="checkbox"
        onOk={onOk}
        resourceName={formatResourceName(selectedList, intl)}
        modalHeader={
          !showBaremetalOnly ? (
            <RadioGroup
              value={clusterType}
              onValueChange={(value) => setClusterType(value)}
              style={RADIO_GROUP_STYLE}
              variant="button"
              options={[
                {
                  value: "normal",
                  label: intl.formatMessage(
                    {
                      id: "cluster.count",
                      defaultMessage: "Cluster ({clusterCount})",
                    },
                    {
                      clusterCount: data?.clusterSummary?.clusterCount ?? 0,
                    },
                  ),
                },
                {
                  value: "baremetal",
                  label: intl.formatMessage(
                    {
                      id: "baremetal.cluster.count",
                      defaultMessage: "Bare Metal Cluster ({clusterCount})",
                    },
                    {
                      clusterCount: data?.clusterSummary?.baremetalCount ?? 0,
                    },
                  ),
                },
              ]}
            />
          ) : undefined
        }
        alertType={showBaremetalOnly ? "warning" : undefined}
        alertMessage={
          showBaremetalOnly
            ? intl.formatMessage({
                id: "l2network.detach.cluster.modal.alert.default.vswitch",
                defaultMessage: "The default distributed switch only supports detaching bare metal clusters.",
              })
            : undefined
        }
      >
        <ClusterList
          selectType="checkbox"
          view="select.l2.network.attach"
          defaultQuery={defaultQuery}
        />
      </ModalSelect>
      <DetachConfirmModal
        view={view}
        position={position}
        visible={v}
        setVisible={setV}
        selectedList={sel}
        setSelectedList={setSel}
        source={{
          current: l2,
        }}
      />
    </>
  );
};

export default DetachCluster;
