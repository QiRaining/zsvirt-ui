import { attachL2NetworkToCluster } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, L2NetworkQueryType } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import ReactDOM from "react-dom";
import { useIntl } from "react-intl";

import L2NetworkList from "../../../l2-network/list";

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();
  const [modalContainer, setModalContainer] = React.useState<any>();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title = intl.formatMessage({
    id: "virtualization.cluster.attach.l2",
    defaultMessage: "Loading distributed switch.",
  });

  const onOk = (value: IL2Network[]) => {
    const payload = value?.map((item) => ({
      clusterUuid: current?.uuid,
      l2NetworkUuid: item.uuid,
    }));
    doAction({
      mutation: attachL2NetworkToCluster,
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

  const defaultQuery = React.useMemo<IQuery>(() => {
    return {
      type: L2NetworkQueryType.ClusterAttachableL2network,
      extraConditions: [
        {
          key: "clusterUuid",
          op: Op.eq,
          value: current.uuid,
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
          <L2NetworkList
            view="select.virtualization.l3"
            defaultQuery={defaultQuery}
          />
        </ModalSelect>,
        modalContainer,
      )
    : null;
};

export default Action;
