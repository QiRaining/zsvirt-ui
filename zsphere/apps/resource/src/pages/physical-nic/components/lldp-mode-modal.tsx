import { zodResolver } from "@hookform/resolvers/zod";
import { Form, type SelectOptions } from "@zstack/design";
import { SelectField } from "@zstack/form";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import ReactMarkdown from "react-markdown";

type IValues = Record<string, any>;
import type { PhysicalNic } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPhysicalNicLldpModeSchema,
  type PhysicalNicLldpModeFormValues,
} from "../action/schema";
import { useLldpModeMap } from "../hooks/use-lldp-mode-map";

export interface IEditLLDPModeModal {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (val: IValues) => void;
  selectedList?: PhysicalNic[];
  title?: React.ReactNode;
}

const LLDPModeModal: FC<IEditLLDPModeModal> = ({
  visible,
  setVisible,
  onOk,
  selectedList = [],
  title,
}) => {
  const intl = useIntl();

  const { modeOptions } = useLldpModeMap();
  const selectOptions = useMemo<SelectOptions[]>(
    () =>
      modeOptions.map((option) => ({
        ...option,
        value: String(option.value),
      })),
    [modeOptions],
  );
  const defaultValues = useMemo<PhysicalNicLldpModeFormValues>(
    () => ({
      mode: String(selectedList?.[0]?.lLDPMode?.mode ?? ""),
    }),
    [selectedList],
  );
  const formSchema = useMemo(
    () => createPhysicalNicLldpModeSchema(intl),
    [intl],
  );
  const form = useForm<PhysicalNicLldpModeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const dialogTitle = (title ??
    intl.formatMessage({
      id: "physicalNic.action.batch.modal.lldp.title",
      defaultMessage: "Modify LLDP Mode in Bulk",
    })) as string;

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  return (
    <DialogForm
      form={dialogForm}
      resourceName={formatResourceName(selectedList, intl)}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "physicalNic.action.batch.modal.lldp.alert",
        defaultMessage:
          "The LLDP service will automatically restart after the modification. During this time, peer device information cannot be obtained. Please wait patiently.",
      })}
      title={dialogTitle}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={() => setVisible(false)}
    >
      <Form {...form}>
        <SelectField
          form={form}
          name="mode"
          labelTooltip={
            <>
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "physicalNic.action.modal.lldp.mode.tooltip",
                  defaultMessage: `### LLDP Mode

LLDP allows you to receive LLDP information from a neighboring network device, or to transmit the local LLDP information to its neighbors. With LLDP, you can query and judge the link communication status.

1. LLDP has the following 4 modes:

- Receive-only mode (Default): Processes received LLDP packets and displays LLDP information.
- Transmit-only mode: Transmits LLDP packets, and does not process received packets. You cannot view LLDP in this mode.
- Transmit and Receive mode: Performs both transmit and receive LLDP packet processing.
- Disabled: Do not transmit or receive LLDP packets. You cannot view LLDP in this mode.

2. LLDP can work in the following OS:

-  x86: H84r and x86_KylinV10P3
- ARM: arm_KylinV10P3 and H22e`,
                })}
              </ReactMarkdown>
            </>
          }
          label={intl.formatMessage({
            id: "physicalNic.action.modal.lldp.mode",
            defaultMessage: "LLDP Mode",
          })}
          options={selectOptions}
          required
        />
      </Form>
    </DialogForm>
  );
};

export default LLDPModeModal;
