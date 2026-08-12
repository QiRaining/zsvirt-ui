import { ModalSelect } from "@zstack/zsphere-components";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import List from "zsv_resource/l2-network/list";

import { detachL2NetworkFromCluster } from "../../../gql/cluster-operations.gql";
import useConfirm from "../../../utils/use-confirm";

import style from "./style.module.less";

const getUuid = <T extends { uuid: string }>(
  selectedList: T[],
  searchParams: URLSearchParams,
) => {
  const uuid = searchParams.get("uuid");
  // 在detail页面
  if (uuid) {
    return uuid;
  }
  // list 页面
  return selectedList?.[0]?.uuid;
};

const DetachL2Network: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const [value, onChange] = useState<IL2Network[]>([]);
  const { waitConfirm, confirmProps } = useConfirm();
  const [confirmList, setConfirmList] = useState([] as IL2Network[]);

  let clusterUuid: string;
  if (source?.__typename === "Zone") {
    clusterUuid = selectedList?.[0]?.uuid;
  } else {
    clusterUuid = source?.uuid || getUuid(selectedList, searchParams);
  }

  const onOk = (v: IL2Network[]) => {
    const payload = v?.map((item) => ({
      l2NetworkUuid: item.uuid,
      clusterUuid,
    }));

    doAction({
      mutation: detachL2NetworkFromCluster,
      payload,
      name: intl.formatMessage({
        id: "detach.l2Network",
        defaultMessage: "Detach Distributed Switch",
      }),
      total: selectedList.length,
      type: "L2Network",
      onFinish: () => {
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  useEffect(() => {
    onChange([]);
  }, [visible]);

  const detachModal = (
    <DialogP1
      bannerMessage={intl.formatMessage({
        id: "detach.l2Network.from.baremetal.cluster.alert",
        defaultMessage:
          "Detach distributed switches will detach NICs from the associated bare metal instances in the cluster. Proceed with caution.",
      })}
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.detach.l2Network",
        defaultMessage: "Detach Distributed Switch?",
      })}
      resourceType={intl.formatMessage({
        id: "l2.network",
        defaultMessage: "Distributed Switch",
      })}
      resourceNames={confirmList.map((item) => item.name ?? item.uuid)}
      afterClose={() => setConfirmList([])}
      {...confirmProps}
    />
  );

  const defaultQuery = React.useMemo(
    () => ({
      conditions: [
        {
          key: "cluster.uuid",
          op: Op.eq,
          value: selectedList?.[0]?.uuid,
        },
        {
          key: "type",
          op: Op.ne,
          value: "portGroup",
        },
      ],
    }),
    [selectedList?.[0]?.uuid],
  );

  return (
    <ModalSelect
      selectType="checkbox"
      title={intl.formatMessage({
        id: "detach.l2Network",
        defaultMessage: "Detach Distributed Switch",
      })}
      value={value}
      visible={visible}
      onChange={onChange}
      showSelect={false}
      setVisible={setVisible}
      onOk={onOk}
      beforeOnOk={async (values: IL2Network[]) => {
        setConfirmList(values);
        await waitConfirm();
      }}
      renderFooter={({ node }) => {
        return (
          <>
            {detachModal}
            {node}
          </>
        );
      }}
    >
      <List
        view="select.baremetal.cluster.attach"
        defaultQuery={defaultQuery}
      />
    </ModalSelect>
  );
};

export default DetachL2Network;
