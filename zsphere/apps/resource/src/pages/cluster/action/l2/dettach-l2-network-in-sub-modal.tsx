import { detachL2NetworkFromCluster } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { formatDoActionParams } from "../../utils";

const ChangeOwner: React.FC<IActionWrapperProps<IL2Network>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const clusterUuid = source?.uuid;
  const onOk = () => {
    const payload = selectedList?.map((item) => ({
      clusterUuid,
      l2NetworkUuid: item.uuid,
    }));
    doAction(
      formatDoActionParams(
        {
          payload,
          action: {
            total: payload.length,
            name: intl.formatMessage({
              id: "detach.l2Network",
              defaultMessage: "Detach Distributed Switch",
            }),
          },
          type: "L2Network",
          onFinish: () => {
            refetch?.();
          },
        },
        detachL2NetworkFromCluster,
      ),
    );

    setVisible(false);
    setSelectedList?.([]);
  };

  return (
    <DialogP0
      onConfirm={() => {
        onOk();
      }}
      visible={visible}
      setVisible={setVisible}
      onCancel={() => setVisible(false)}
      title={intl.formatMessage({
        id: "cluster.modal.title.confirm.detach.l2Network",
        defaultMessage: "Detach Distributed Switch?",
      })}
      resourceType={intl.formatMessage({
        id: "l2.network",
        defaultMessage: "Distributed Switch",
      })}
      bannerMessage={intl.formatMessage({
        id: "detach.l2Network.from.cluster.alert",
        defaultMessage:
          "Detach Distributed Switch",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      guide={intl.formatMessage({
        id: "detach",
        defaultMessage: "Detach",
      })}
    />
  );
};

export default ChangeOwner;
