import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import { getModifedValues, formatResourceName } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import _ from "lodash-es";
import type { FC } from "react";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import BasicConfig from "../create/basic-config";
import OtherConfig from "../create/other-config";

const editHostConfig = gql`
  mutation editHostConfig($input: EditHostConfigInput!) {
    editHostConfig(input: $input) {
      actionId
    }
  }
`;

const Action: FC<IActionWrapperProps<IHost>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const doAction = useAction();

  const current = useMemo(() => selectedList?.[0] ?? {}, [selectedList]);

  const title = intl.formatMessage({
    id: "edit.config",
    defaultMessage: "Modify Configuration",
  });

  const initialValues: any = useMemo(
    () => ({
      name: current.name,
      description: current.description,
      iommu: current.hostIommu?.state === "Enabled",
      ept: current.hostSystemInfo?.ept,
    }),
    [current],
  );

  useEffect(() => {
    if (visible) {
      form.setFields(
        _.keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [form, initialValues, visible]);

  const onOk = usePersistFn(async (currentValues: any) => {
    const payload = getModifedValues(initialValues, currentValues);
    payload.uuid = current.uuid;

    doAction({
      mutation: editHostConfig,
      payload,
      name: title,
      total: 1,
      type: "HostVO",
      onFinish: () => {
        refetch?.();
      },
    });
  });

  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      onOk={onOk}
      onCancel={() => setVisible(false)}
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form form={form}>
        <BasicConfig host={current} />
        <OtherConfig />
      </Form>
    </DialogForm>
  );
};

export default Action;
