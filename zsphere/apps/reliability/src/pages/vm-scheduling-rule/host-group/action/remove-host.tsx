import { ModalSelect } from "@zstack/zsphere-components";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { HostQueryType, Op } from "@zstack/zsphere-types";
import type { HostGroup, Host } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import HostList from "zsv_resource/host/list";

import RemoveHostConfirm from "./remove-host-confirm";

const RemoveHostAction: React.FC<IActionWrapperProps<HostGroup>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const currentHostGroupUuid = selectedList?.[0]?.uuid;
  const defaultQueryHostList = useMemo(() => {
    return {
      extraConditions: [
        { key: "hostGroupUuid", op: Op.eq, value: currentHostGroupUuid },
      ],
      type: HostQueryType.GetHostByHostGroup,
    };
  }, [currentHostGroupUuid]);

  const [value, onChange] = useState<Host[]>([]);
  const [confirmVisible, setConfirmVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!confirmVisible) {
      onChange([]);
    }
  }, [confirmVisible]);

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "select.host",
          defaultMessage: "Select Host",
        })}
        value={value}
        onChange={onChange}
        visible={visible}
        setVisible={setVisible}
        showSelect={false}
        onOk={() => setConfirmVisible(true)}
        selectType="checkbox"
        resourceName={selectedList?.[0]?.name}
      >
        <HostList view="select" defaultQuery={defaultQueryHostList} />
      </ModalSelect>
      <RemoveHostConfirm
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

export default RemoveHostAction;
