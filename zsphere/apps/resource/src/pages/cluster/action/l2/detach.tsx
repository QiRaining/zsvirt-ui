import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import ReactDOM from "react-dom";
import { useIntl } from "react-intl";

import L2NetworkList from "../../../l2-network/list";
import DetachL2NetworkConfirm from "./dettach-l2-network-in-sub-modal";

const Action: React.FC<IActionWrapperProps<ICluster>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();

  const [modalContainer, setModalContainer] = React.useState<any>();

  const current = React.useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const [confirmVisible, setConfirmVisible] = React.useState<boolean>(false);
  const [value, onChange] = React.useState<IL2Network[]>([]);

  React.useEffect(() => {
    if (!confirmVisible) {
      onChange([]);
    }
  }, [confirmVisible]);

  const title = intl.formatMessage({
    id: "virtualization.cluster.detach.l2",
    defaultMessage: "Detach Distributed Switch",
  });

  const defaultQuery = React.useMemo<IQuery>(() => {
    return {
      conditions: [
        {
          key: "cluster.uuid",
          op: Op.eq,
          value: current.uuid,
        },
        {
          key: "type",
          op: Op.notIn,
          values: ["VxlanNetwork", "HardwareVxlanNetwork"],
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

  return (
    <>
      {modalContainer
        ? ReactDOM.createPortal(
            <ModalSelect
              title={title}
              visible={visible}
              showSelect={false}
              setVisible={setVisible}
              onOk={() => setConfirmVisible(true)}
              selectType="checkbox"
              onChange={onChange}
            >
              <L2NetworkList
                view="select.virtualization.l3"
                defaultQuery={defaultQuery}
              />
            </ModalSelect>,
            modalContainer,
          )
        : null}
      <DetachL2NetworkConfirm
        view="main"
        position="row"
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        source={selectedList?.[0]}
        selectedList={value}
        refetch={refetch}
        setSelectedList={setSelectedList as () => void}
      />
    </>
  );
};

export default Action;
