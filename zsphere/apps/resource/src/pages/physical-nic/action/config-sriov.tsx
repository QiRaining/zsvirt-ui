import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField, FieldStack } from "@zstack/form";
import { SwitchField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { useUpdateEffect } from "ahooks";
import React, { useState, useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPhysicalNicSriovSchema,
  type PhysicalNicSriovFormValues,
} from "./schema";

const generateSriovPciDevices = gql`
  mutation generateSriovPciDevices($input: GenerateSriovPciDeviceInput!) {
    generateSriovPciDevices(input: $input) {
      actionId
    }
  }
`;

const unGenerateSriovPciDevice = gql`
  mutation unGenerateSriovPciDevice($input: UnGenerateSriovPciDeviceInput!) {
    unGenerateSriovPciDevice(input: $input) {
      actionId
    }
  }
`;

const ConfigSriovAction: React.FC<IActionWrapperProps<PhysicalNic>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const detail = selectedList?.[0] || {};
  const intl = useIntl();
  const doAction = useAction();
  const [closeSriovVisable, setCloseSriovVisable] = useState<boolean>(false);
  const [vfNicNumDisabled, setVfNicNumDisabled] = useState<boolean>(false);
  const maxPartNum: number = useMemo(() => {
    return detail?.pciDevice?.physicalNicDeviceMaxPartNum ?? 10;
  }, [detail]);

  const isSRIOVVirtualized = useMemo(
    () => detail?.pciDevice?.virtStatus === "SRIOV_VIRTUALIZED",
    [detail],
  );

  const defaultValues = useMemo<PhysicalNicSriovFormValues>(() => {
    const vfTotalNum = detail?.pciDevice?.vfAvailableNum?.vfTotalNum as number;

    return {
      sriovState: isSRIOVVirtualized,
      vfNicNum: isSRIOVVirtualized ? vfTotalNum : maxPartNum,
    };
  }, [detail, isSRIOVVirtualized, maxPartNum]);
  const formSchema = useMemo(
    () => createPhysicalNicSriovSchema(intl, maxPartNum),
    [intl, maxPartNum],
  );
  const form = useForm<PhysicalNicSriovFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const sriovState = useWatch({
    control: form.control,
    name: "sriovState",
  });

  useEffect(() => {
    if (visible) {
      setVfNicNumDisabled(isSRIOVVirtualized);
      form.reset(defaultValues);
    }
  }, [visible, isSRIOVVirtualized, defaultValues, form]);

  useUpdateEffect(() => {
    if (!sriovState && vfNicNumDisabled) {
      setCloseSriovVisable(true);
      form.setValue("sriovState", isSRIOVVirtualized);
    }
  }, [sriovState, vfNicNumDisabled, isSRIOVVirtualized, form]);

  const onOk = (values: PhysicalNicSriovFormValues) => {
    const { vfNicNum } = values;
    if (values.sriovState && !isSRIOVVirtualized) {
      const payload = {
        virtPartNum: Number(vfNicNum),
        pciDeviceUuid: selectedList![0].pciDevice?.uuid,
      };
      doAction({
        mutation: generateSriovPciDevices,
        payload,
        name: intl.formatMessage({
          id: "config.sriov",
          defaultMessage: "Configure SR-IOV",
        }),
        total: selectedList.length,
        type: "physicalNic",
        onFinish: () => {
          refetch?.();
        },
      });
      setSelectedList?.([]);
    }
  };

  const closeSriovFn = async () => {
    const payload = {
      pciDeviceUuid: selectedList![0]?.pciDevice?.uuid,
    };
    doAction({
      mutation: unGenerateSriovPciDevice,
      payload,
      name: intl.formatMessage({
        id: "close.sriov",
        defaultMessage: "Disable SR-IOV.",
      }),
      total: selectedList.length,
      type: "physicalNic",
      onFinish: () => {
        refetch?.();
      },
    });
    setCloseSriovVisable(false);
    setVfNicNumDisabled(false);
    setVisible(false);
    setSelectedList?.([]);
  };

  const modalProps = useMemo(() => {
    return {
      linkedResourceMessage: detail?.pciDevice?.vmCount
        ? intl.formatMessage(
            {
              id: "virtualization.associatedCount.vm",
              defaultMessage: "{vmInstanceCount} Virtual Machines",
            },
            {
              vmInstanceCount: detail?.pciDevice?.vmCount,
            },
          )
        : undefined,
    };
  }, [detail, intl]);

  const bannerMessage = useMemo(() => {
    return !!detail?.pciDevice?.vmCount
      ? intl.formatMessage({
          id: "physicalNic.modal.ungenerate.have.vm.alert.danger",
          defaultMessage:
            "The current VF NIC is being used by a virtual machine. Turning off this switch will also detach the related NIC from the virtual machine. Proceed with caution.",
        })
      : undefined;
  }, [detail, intl]);

  const renderDesc = useMemo(() => {
    if (isSRIOVVirtualized) {
      return intl.formatMessage({
        id: "restart.sriov.state.to.edit.vf.cards.number",
        defaultMessage: "To modify the number of VF NICs, you need to restart the SR-IOV status.",
      });
    }
    return intl.formatMessage(
      {
        id: "vf.nic.max.part.num.desc",
        defaultMessage: "This physical NIC supports a maximum of {maxPartNum} VF NICs.",
      },
      {
        maxPartNum,
      },
    );
  }, [intl, isSRIOVVirtualized, maxPartNum]);

  return (
    <>
      <DialogForm
        form={dialogForm}
        visible={visible}
        setVisible={setVisible}
        onOk={onOk}
        title={intl.formatMessage({
          id: "physicalNic.modal.title.sriovConfig",
          defaultMessage: "Configure SR-IOV",
        })}
        resourceName={selectedList?.[0]?.name}
      >
        <Form {...form}>
          <FieldStack>
            <SwitchField
              form={form}
              name="sriovState"
              label={intl.formatMessage({
                id: "sr.iov.state",
                defaultMessage: "SR-IOV Status",
              })}
              required
            />
            {sriovState ? (
              <InputNumberField
                form={form}
                name="vfNicNum"
                label={intl.formatMessage({
                  id: "vf.nic.num",
                  defaultMessage: "VF NICs",
                })}
                required
                hint={renderDesc}
                disabled={vfNicNumDisabled}
              />
            ) : null}
          </FieldStack>
        </Form>
      </DialogForm>

      <DialogP3
        title={intl.formatMessage({
          id: "physicalNic.modal.title.confirm.sriov.close",
          defaultMessage: "Disable SR-IOV?",
        })}
        bannerMessage={bannerMessage}
        resourceNames={(selectedList as any)?.map(
          (r: any) => r.interfaceName ?? r.name ?? r.uuid,
        )}
        resourceDescription={modalProps.linkedResourceMessage}
        visible={closeSriovVisable}
        setVisible={setCloseSriovVisable}
        onConfirm={() => closeSriovFn()}
      />
    </>
  );
};

export default ConfigSriovAction;
