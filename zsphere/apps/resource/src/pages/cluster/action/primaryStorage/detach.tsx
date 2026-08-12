import DetachPrimaryStorageConfirm from "@zstack/virtualization-resource/src/pages/primary-storage/action/detach-in-cluster-modal";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  PrimaryStorageVO as IPrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import ReactDOM from "react-dom";
import { useIntl } from "react-intl";

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
  const [value, onChange] = React.useState<IPrimaryStorage[]>([]);

  React.useEffect(() => {
    if (!confirmVisible) {
      onChange([]);
    }
  }, [confirmVisible]);

  const title = intl.formatMessage({
    id: "virtualization.cluster.attach.primaryStorage",
    defaultMessage: "Attach Data Storage to Cluster",
  });

  const defaultQuery = React.useMemo<IQuery>(() => {
    return {
      conditions: [
        {
          key: "attachedClusterUuids",
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
              <PrimaryStorageList
                view="select.cluster"
                defaultQuery={defaultQuery}
              />
            </ModalSelect>,
            modalContainer,
          )
        : null}
      <DetachPrimaryStorageConfirm
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
