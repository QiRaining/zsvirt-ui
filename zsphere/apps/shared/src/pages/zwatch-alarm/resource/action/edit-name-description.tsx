import { gql } from "@apollo/client";
import {
  ZSVForm,
  Form,
  Modal,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";
import { useIntl } from "react-intl";

const updateAlarm = gql`
  mutation updateAlarm($input: UpdateAlarmInput!) {
    updateAlarm(input: $input) {
      actionId
    }
  }
`;

export default function EditNameDescription({
  visible,
  selectedList,
  setVisible,
}: IActionWrapperProps<ZWatchAlarmVO>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { translateAlarmNameByLocale } = useMetricNameConfig();

  const current = selectedList?.[0];

  useEffect(() => {
    if (current && visible) {
      form.setFieldsValue({
        name: translateAlarmNameByLocale(current.name, current.zhName),
        description: current.description ?? "",
      });
    }
  }, [visible, current]);

  const onOk = async (values: any) => {
    doAction({
      mutation: updateAlarm,
      payload: {
        ...values,
        uuid: current?.uuid ?? "",
      },
      name: intl.formatMessage({
        id: "update.alarm",
        defaultMessage: "Edit Alarm",
      }),
      type: "ZWatchAlarmVO",
      total: selectedList.length,
    });
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.name.description",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={translateAlarmNameByLocale(current?.name, current?.zhName)}
    >
      <Form form={form}>
        <ZSVForm.NameAndDesc />
      </Form>
    </DialogForm>
  );
}
