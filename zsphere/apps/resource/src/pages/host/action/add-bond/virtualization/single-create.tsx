import { gql } from "@apollo/client";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHostVO } from "@zstack/zsphere-types/graphql";
import { useUpdate } from "ahooks";
import { compact as _compact, pick as _pick } from "lodash-es";
// row 单个添加聚合口
import React from "react";
import { useIntl } from "react-intl";

import type { InnerFormConfig } from "../create";
import { InnerForm } from "./create";

const createBond = gql`
  mutation createBond($input: CreateBondInput!) {
    createBond(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  selectedList: IHostVO[];
  visible: boolean;
  onBack: Function;
}

const VirSingleCreateBond: React.FC<IActionWrapperProps<IHostVO> & IProps> = ({
  visible,
  setVisible,
  selectedList,
  onBack,
}) => {
  const intl = useIntl();
  const update = useUpdate();
  const doAction = useAction();

  const host = React.useMemo(() => selectedList[0], [selectedList]);

  const formRef = React.useRef<InnerFormConfig>({});
  const getFormConfig = React.useCallback(
    (hostUuid) => formRef.current[hostUuid],
    [],
  );

  const setRef = React.useCallback((innerRef, hostUuid) => {
    formRef.current[hostUuid] = innerRef ?? ({} as InnerFormConfig["HostUuid"]);
  }, []);

  const onOk = React.useCallback(async () => {
    const form = getFormConfig(host.uuid).form;

    const formData = await form.validateFields();
    doAction({
      mutation: createBond,
      payload: [
        {
          hostUuids: [host.uuid],
          slaveNames: _compact(formData.physicalNicList).map(
            (nic: any) => nic.interfaceName,
          ),
          ipAddress: formData.ipv4Address,
          ..._pick(formData, [
            "xmitHashPolicy",
            "description",
            "gateway",
            "mode",
            "netmask",
            "bondingName",
          ]),
        },
      ],
      name: intl.formatMessage({
        id: "add.AggPort",
        defaultMessage: "Add Bond",
      }),
      total: selectedList.length,
      type: "Bond",
    });

    onBack();
  }, [host, intl]);

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "add.AggPort",
        defaultMessage: "Add Bond",
      })}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={() => onBack()}
    >
      <InnerForm
        required
        initialValues={{ enabled: true }}
        ref={(innerRef) => setRef(innerRef, host.uuid)}
        host={host}
        onSetAlert={update}
        className=""
        autoValidFields={false}
      />
    </DialogBase>
  );
};

export default VirSingleCreateBond;
