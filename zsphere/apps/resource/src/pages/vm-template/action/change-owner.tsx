import { gql } from "@apollo/client";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { AccountPlainList } from "zsv_administration_shared/account-information/mf-index";

import style from "./style.module.less";

const changeResourceOwner = gql`
  mutation changeResourceOwner($input: ChangeResourceOwnerInput!) {
    changeResourceOwner(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const [form] = Form.useForm();
  const { isRequired } = useValidator(intl);

  const defaultQuery: IQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "resourceUuids",
          values: selectedList?.map((vm) => vm.uuid),
          op: Op.in,
        },
      ],
    };
  }, [selectedList]);

  const onOk = (values: any) => {
    const { owner = [] } = values;
    const payload = selectedList
      ?.filter((cv) => cv.owner?.uuid !== owner?.[0]?.uuid)
      ?.map((cv) => ({
        accountUuid: owner?.[0]?.uuid,
        resourceUuid: cv.uuid,
      }));
    doAction({
      mutation: changeResourceOwner,
      payload,
      name: intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      }),
      total: payload?.length,
      type: "VmTemplate",
    });
    setVisible(false);
  };

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "change.owner",
        defaultMessage: "Change Owner",
      })}
      form={form}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form}>
        <Form.Item
          label={intl.formatMessage({ id: "owner", defaultMessage: "Owner" })}
          name="owner"
          required
          rules={[isRequired(IIsRequiredType.select)]}
          className={style.ownerFormItem}
        >
          <ModalSelect
            title={intl.formatMessage({
              id: "select.account",
              defaultMessage: "Select User",
            })}
            className="width-320"
          >
            <AccountPlainList view="select" defaultQuery={defaultQuery} />
          </ModalSelect>
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
