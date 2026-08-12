import { gql } from "@apollo/client";
import { Checkbox } from "@zstack/design";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Form, ModalSelect } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";

type IValues = Record<string, any>;

import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { CandidateSharedBlock as ICandidateSharedBlock } from "@zstack/zsphere-types/graphql";
import { map } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import SelectList from "../../shared-block-candidate/list";

import style from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

const addSharedBlockToSharedBlockGroup = gql`
  mutation addSharedBlockToSharedBlockGroup(
    $input: AddSharedBlockToSharedBlockGroupInput!
  ) {
    addSharedBlockToSharedBlockGroup(input: $input) {
      actionId
    }
  }
`;

const AddSharedBlock: React.FC<IActionWrapperProps<ICandidateSharedBlock>> = ({
  refetch,
  source,
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const primaryStorageUuid = source?.uuid;

  const onOk = (values: IValues) => {
    const lunUuids = map(values.lunDeviceList, "uuid");
    const params: { systemTags: string[] } = { systemTags: [] };

    if (values.forceWipe) {
      params.systemTags.push("forceWipe");
    }

    const payload = lunUuids?.map((diskUuid: string) => {
      return {
        uuid: primaryStorageUuid,
        diskUuid,
        ...params,
      };
    });

    doAction({
      mutation: addSharedBlockToSharedBlockGroup,
      payload,
      name: intl.formatMessage({
        id: "add.blockDevice",
        defaultMessage: "Add LUN",
      }),
      total: lunUuids?.length,
      type: "SharedBlock",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      className={style.addLunDeviceWrapper}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "add.blockDevice",
        defaultMessage: "Add LUN",
      })}
      onOk={onOk}
    >
      <Form
        form={form}
        initialValues={{
          lunDeviceList: [],
          forceWipe: false,
        }}
      >
        <Form.Item
          name="lunDeviceList"
          label={intl.formatMessage({
            id: "LunDevice",
            defaultMessage: "LUN",
          })}
          required
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "virtualization.primaryStorage.field.lunDeviceList.required",
                defaultMessage: "Select a LUN device",
              }),
            },
          ]}
          icon="info"
          iconTooltip={intl.formatMessage({
            id: "virtualization.primaryStorage.field.lunDeviceList.tooltip",
            defaultMessage:
              "A LUN is provided by iSCSI, FC, or NVMe storage. Note that you need to add iSCSI storage to a cluster in advance.",
          })}
          description={
            <div className={style.description}>
              {intl.formatMessage({
                id: "virtualization.primaryStorage.field.lunDeviceList.description",
                defaultMessage:
                  "A LUN is provided by iSCSI, FC, or NVMe storage. Note that you need to add iSCSI storage to a cluster in advance.",
              })}
            </div>
          }
        >
          <ModalSelect
            className={style.lunDeviceSelect}
            label={intl.formatMessage({
              id: "add.blockDevice",
              defaultMessage: "Add LUN",
            })}
            title={intl.formatMessage({
              id: "select.blockDevice",
              defaultMessage: "Select LUN",
            })}
            selectType="checkbox"
            renderItemContent={(item: ICandidateSharedBlock) => (
              <Text>{item.name}</Text>
            )}
          >
            <SelectList
              view="select"
              defaultQuery={{
                conditions: [
                  {
                    key: "clusterUuid",
                    op: Op.eq,
                    value: source?.attachedClusterUuids?.[0],
                  },
                ],
              }}
            />
          </ModalSelect>
        </Form.Item>

        <Form.Item
          name="forceWipe"
          label={intl.formatMessage({
            id: "cleanup.blockDevice",
            defaultMessage: "Cleanse LUN",
          })}
          valuePropName="checked"
          description={
            <div className={style.description}>
              <Icon type="alert-triangle-fill" color="alert" />
              <span>
                {intl.formatMessage({
                  id: "virtualization.primaryStorage.field.force.blockDevice.false.validator.tips",
                  defaultMessage:
                    "If data exists in the LUN, you might fail to add LUNs or attach data storage.",
                })}
              </span>
            </div>
          }
        >
          <FormCheckbox
            label={intl.formatMessage({
              id: "virtualization.primaryStorage.field.forceWipe.checkbox.clearLunDevice",
              defaultMessage: "Cleanse existing data in LUNs",
            })}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default AddSharedBlock;
