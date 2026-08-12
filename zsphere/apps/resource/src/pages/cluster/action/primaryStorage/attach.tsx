import { attachPrimaryStorageToCluster } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, PrimaryStorageQueryType } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { useIntl } from "react-intl";

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();
  const [modalContainer, setModalContainer] = useState<any>();

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title = intl.formatMessage({
    id: "virtualization.cluster.attach.primaryStorage",
    defaultMessage: "Attach Data Storage to Cluster",
  });

  const onOk = (value: IPrimaryStorage[]) => {
    const payload = value?.map((item) => ({
      clusterUuid: current?.uuid,
      primaryStorageUuid: item.uuid,
    }));
    doAction({
      mutation: attachPrimaryStorageToCluster,
      payload,
      name: title,
      total: 1,
      type: "Cluster",
      onFinish: () => {
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  const defaultQuery = useMemo<IQuery>(() => {
    return {
      type: PrimaryStorageQueryType.ClusterAttachablePs,
      conditions: [
        {
          key: "zoneUuid",
          op: Op.eq,
          value: current?.zoneUuid,
        },
      ],
      extraConditions: [
        {
          key: "clusterUuid",
          op: Op.eq,
          value: current.uuid,
        },
        {
          key: "hypervisorType",
          op: Op.eq,
          value: "KVM",
        },
      ],
    };
  }, [current]);

  // modal挂载地方不对,getContainer不生效
  // jira:
  React.useEffect(() => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    setModalContainer(container);

    return () => {
      container.parentNode?.removeChild(container);
    };
  }, []);

  return modalContainer
    ? ReactDOM.createPortal(
        <ModalSelect
          title={title}
          visible={visible}
          showSelect={false}
          setVisible={setVisible}
          onOk={onOk}
          selectType="checkbox"
        >
          <PrimaryStorageList
            view="select.cluster"
            defaultQuery={defaultQuery}
          />
        </ModalSelect>,
        modalContainer,
      )
    : null;
};

export default Action;
