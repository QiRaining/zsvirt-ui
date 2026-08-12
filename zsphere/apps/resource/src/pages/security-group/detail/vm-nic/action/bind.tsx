import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op, VmNicQueryType } from "@zstack/zsphere-types";
import type {
  VmNic as IVmNic,
  SecurityGroup as ISecurityGroup,
} from "@zstack/zsphere-types/graphql";
import { difference as _difference, compact as _compact } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { SgVmNicForm } from "../components/vmNic-modal";

const addVmNicToSecurityGroup = gql`
  mutation addVmNicToSecurityGroup($input: AddVmNicToSecurityGroupInput!) {
    addVmNicToSecurityGroup(input: $input) {
      actionId
    }
  }
`;

interface IProps extends Omit<
  IActionWrapperProps<IVmNic, ISecurityGroup>,
  "view"
> {
  securityGroupUuid: string;
  zoneUuid?: string;
}

const AddVmNicToSecurityGroupAction: React.FC<IProps> = ({
  visible,
  setVisible,
  securityGroupUuid,
  zoneUuid,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const defaultQuery: IQuery = useMemo(
    () => ({
      type: VmNicQueryType.CandidateVmNicForSecurityGroup,
      extraConditions: [
        {
          key: "securityGroupUuid",
          op: Op.eq,
          value: securityGroupUuid,
        },
      ],
    }),
    [securityGroupUuid],
  );

  const onOk = async (data: any) => {
    const { vmNics = [] } = data;

    doAction({
      mutation: addVmNicToSecurityGroup,
      payload: [
        {
          securityGroupUuid,
          vmNicUuids: vmNics.map((it: IVmNic) => it.uuid),
          l3NetworkUuids: _difference(
            vmNics.map((it: IVmNic) => it.l3NetworkUuid),
            _compact(source?.attachedL3NetworkUuids),
          ),
        },
      ],
      name: intl.formatMessage({
        id: "bind.vmNic",
        defaultMessage: "Associate VM NIC",
      }),
      total: 1,
      type: "VmNic",
      onFinish: () => {
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "bind.vmNic",
        defaultMessage: "Associate VM NIC",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
    >
      <Form form={form} initialValues={{ l3NetworkType: "all" }}>
        <SgVmNicForm defaultQuery={defaultQuery} zoneUuid={zoneUuid} />
      </Form>
    </DialogForm>
  );
};

export default AddVmNicToSecurityGroupAction;
