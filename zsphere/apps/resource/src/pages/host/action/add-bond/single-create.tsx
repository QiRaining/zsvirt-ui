import { gql } from "@apollo/client";
import {
  Button,
  Drawer,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from "@zstack/design";
import { useAction } from "@zstack/zsphere-hooks";
import type { Host as IHost } from "@zstack/zsphere-types/graphql";
import { useUpdate } from "ahooks";
import { compact as _compact, pick as _pick } from "lodash-es";
// row 单个添加聚合口
import React from "react";
import { useIntl } from "react-intl";

import type { InnerFormConfig } from "./virtualization/create";
import { InnerForm } from "./virtualization/create";

const createBond = gql`
  mutation createBond($input: CreateBondInput!) {
    createBond(input: $input) {
      actionId
    }
  }
`;

export interface IProps {
  selectedList: IHost[];
  onBack: Function;
  visible: boolean;
}

const SingleCreateBond: React.FC<IProps> = ({
  visible,
  onBack,
  selectedList,
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
    <Drawer
      open={visible}
      setOpen={(v) => {
        if (typeof v === "function") {
          onBack();
        } else if (!v) {
          onBack();
        }
      }}
      placement="right"
      style={{ width: 600 }}
    >
      <DrawerHeader onClose={() => onBack()}>
        {intl.formatMessage({
          id: "add.AggPort",
          defaultMessage: "Add Bond",
        })}
      </DrawerHeader>
      <DrawerBody>
        <InnerForm
          initialValues={{ enabled: true }}
          ref={(innerRef) => setRef(innerRef, host.uuid)}
          host={host}
          onSetAlert={update}
          className=""
          autoValidFields={false}
        />
      </DrawerBody>
      <DrawerFooter>
        <div className="flex items-center gap-2">
          <Button onClick={onOk} variant="primary">
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
          <Button onClick={() => onBack()} variant="link">
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
};

export default SingleCreateBond;
