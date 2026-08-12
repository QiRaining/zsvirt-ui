import { gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import VmList from "@zstack/virtualization-resource/src/pages/vm/list";
import { ModalSelect, Modal, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  UsbDevice as IUsbDevice,
  AttachUsbDeviceToVmPayload,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const attachUsbDeviceToVm = gql`
  mutation attachUsbDeviceToVm($input: AttachUsbDeviceToVmInput!) {
    attachUsbDeviceToVm(input: $input) {
      actionId
    }
  }
`;

const { Item } = Form;

interface IForm {
  attachType: "PassThrough" | "Redirect";
  vm: [VmInstance];
}

const initialValues = {
  attachType: "PassThrough",
};

const Action: React.FC<IActionWrapperProps<IUsbDevice>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm<IForm>();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();

  const handleModalVisible = usePersistFn(() => {
    form.resetFields();
  });

  useEffect(() => {
    if (visible) {
      handleModalVisible();
    }
  }, [visible, handleModalVisible]);

  const passConditions = [
    {
      key: "hostUuid",
      op: Op.eq,
      value: selectedList?.[0]?.hostUuid,
    },
    {
      key: "type",
      op: Op.eq,
      value: "UserVm",
    },
    {
      key: "state",
      op: Op.in,
      values: ["Running", "Stopped"],
    },
  ];

  const redirectConditions = [
    {
      key: "type",
      op: Op.eq,
      value: "UserVm",
    },
    {
      key: "hypervisorType",
      op: Op.ne,
      value: "ESX",
    },
    {
      key: "state",
      op: Op.in,
      values: ["Running", "Stopped"],
    },
  ];

  const onOk = (data: IForm) => {
    const payload: AttachUsbDeviceToVmPayload[] = [
      {
        vmInstanceUuid: data.vm[0].uuid,
        usbDeviceUuid: selectedList[0]?.uuid,
        attachType: data.attachType,
      },
    ];
    doAction({
      mutation: attachUsbDeviceToVm,
      payload,
      name: intl.formatMessage({
        id: "attach.usb.device",
        defaultMessage: "Attach USB Device",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  const handleValuesChange = (changedValues: any) => {
    if ("attachType" in changedValues) {
      form.resetFields(["vm"]);
    }
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk as any}
      title={intl.formatMessage({
        id: "attach.vm",
        defaultMessage: "Attach Virtual Machine",
      })}
    >
      <Form
        form={form}
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
      >
        <Item
          name="attachType"
          label={intl.formatMessage({
            id: "usb.attach.type",
            defaultMessage: "Attach Mode",
          })}
          icon="info"
          iconTooltip={{
            title: (
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "usb.field.attach.type.tooltip",
                  defaultMessage:
                    "### Attach Mode \n\n1. Passthrough: Attach a USB device from the host where the virtual machine is located to the virtual machine. If you want to migrate the virtual machine, detach the USB device first.\n2. Forward: Attach a USB device from the host that is in the same as the virtual machine to the virtual machine. If you want to migrate the virtual machine, do not detach the USB device.",
                })}
              </ReactMarkdown>
            ),
          }}
        >
          <RadioGroup
            options={[
              {
                value: "PassThrough",
                label: intl.formatMessage({
                  id: "passthrough",
                  defaultMessage: "Passthrough",
                }),
              },
              {
                value: "Redirect",
                label: intl.formatMessage({
                  id: "transpond",
                  defaultMessage: "Forward",
                }),
              },
            ]}
          />
        </Item>
        <Item
          noStyle
          shouldUpdate={(prev, curr) => prev.attachType !== curr.attachType}
        >
          {({ getFieldValue }) => {
            const conditions =
              getFieldValue("attachType") === "PassThrough"
                ? passConditions
                : redirectConditions;
            return (
              <Item
                required
                name="vm"
                label={intl.formatMessage({
                  id: "vm",
                  defaultMessage: "Virtual Machine",
                })}
                rules={[
                  isRequired(
                    IIsRequiredType.select,
                    intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
                  ),
                ]}
              >
                <ModalSelect
                  className="width-320"
                  selectType="radio"
                  title={intl.formatMessage({
                    id: "select.vm",
                    defaultMessage: "Select Virtual Machine",
                  })}
                >
                  <VmList view="select" defaultQuery={{ conditions }} />
                </ModalSelect>
              </Item>
            );
          }}
        </Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
