import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { Slider, InputNumber } from "antd";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

const generateSriovPciDevices = gql`
  mutation generateSriovPciDevices($input: GenerateSriovPciDeviceInput!) {
    generateSriovPciDevices(input: $input) {
      actionId
    }
  }
`;

const SriovGenerateAction: React.FC<IActionWrapperProps<PhysicalNic>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState<number>(1);
  const [marks, setMarks] = useState<{ [key: number]: string }>();

  const maxPartNum = useMemo(() => {
    return selectedList?.[0]?.pciDevice?.physicalNicDeviceMaxPartNum ?? 10;
  }, [selectedList]);

  useEffect(() => {
    const middNum: number = Math.round(maxPartNum / 2);
    setMarks({
      1: "1",
      [middNum]: String(middNum),
      [maxPartNum]: String(maxPartNum),
    });
    setInputValue(maxPartNum);
  }, [maxPartNum]);

  const onOk = () => {
    const payload = {
      virtPartNum: Number(inputValue),
      pciDeviceUuid: selectedList![0].pciDevice?.uuid,
    };
    doAction({
      mutation: generateSriovPciDevices,
      payload,
      name: intl.formatMessage({
        id: "sriovGenerate",
        defaultMessage: "SR-IOV",
      }),
      total: selectedList.length,
      type: "physicalNic",
      onFinish: () => {
        refetch?.();
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      alertType="warning"
      alertMessage={intl.formatMessage({
        id: "physicalNic.modal.title.sriovGenerate.alert.warn",
        defaultMessage:
          "Physical NICs will be virtualized into the specified number of vNICs. Please exercise caution.",
      })}
      onOk={onOk}
      title={intl.formatMessage({
        id: "physicalNic.modal.title.sriovGenerate",
        defaultMessage: "SR-IOV",
      })}
    >
      <Form form={form}>
        <div className="flex justify-center">
          <div className="w-1/2">
            <Slider
              marks={marks}
              min={1}
              max={maxPartNum}
              onChange={setInputValue}
              value={typeof inputValue === "number" ? inputValue : 1}
              defaultValue={maxPartNum}
            />
          </div>
          <div className="w-[16.67%]">
            <InputNumber
              min={1}
              max={maxPartNum}
              style={{ margin: "0 16px" }}
              value={inputValue}
              onChange={setInputValue as any}
            />
          </div>
        </div>
      </Form>
    </DialogForm>
  );
};

export default SriovGenerateAction;
