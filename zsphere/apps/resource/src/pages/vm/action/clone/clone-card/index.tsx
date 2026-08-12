import { FieldStack, InputField, RadioGroupField } from "@zstack/form";
import React, { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import FormSection from "../form-section";
import type { CloneVmValues } from "../schema";
import { CloneTypeEnum } from "../utils";

interface CloneCardProps {
  form: UseFormReturn<CloneVmValues>;
  setCurrentCloneType: (type: CloneTypeEnum) => void;
}

const CloneCard: React.FC<CloneCardProps> = ({ form, setCurrentCloneType }) => {
  const intl = useIntl();

  useEffect(() => {
    const subscription = form.watch(
      (value: any, { name }: { name?: string }) => {
        if (name === "cloneType" && value.cloneType) {
          setCurrentCloneType(value.cloneType as CloneTypeEnum);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [form, setCurrentCloneType]);

  return (
    <FormSection
      title={intl.formatMessage({
        id: "clone.config",
        defaultMessage: "Clone Configuration",
      })}
    >
      <FieldStack>
        <InputField
          form={form}
          name="sourceVmName"
          label={intl.formatMessage({
            id: "originVm",
            defaultMessage: "Source VM",
          })}
          size="m"
          disabled
        />
        <RadioGroupField
          form={form}
          name="cloneType"
          label={intl.formatMessage({
            id: "cloneType",
            defaultMessage: "Clone Method",
          })}
          labelTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vmClone.field.cloneType.tooltip",
                defaultMessage: `### Clone Method

1. Full Clone: The cloned VM is independent of the source VM, and the performance is completely unaffected after cloning, but the VM starts slow.
2. Instant Full Clone: The cloned VM starts quickly, the VM is eventually independent of the source VM, and the performance is completely unaffected after cloning.

#### Note:

1. When you use Instant Full Clone to clone a VM, the system automatically performs Flatten to eventually achieve data independence. During flattening, operations on VMs/disks will be conducted after the flattening is completed.`,
              })}
            </ReactMarkdown>
          }
          options={[
            {
              value: CloneTypeEnum.FullClone,
              label: intl.formatMessage({
                id: "fullClone",
                defaultMessage: "Full Clone",
              }),
            },
            {
              value: CloneTypeEnum.FastFullClone,
              label: intl.formatMessage({
                id: "fastFullClone",
                defaultMessage: "Instant Full Clone",
              }),
            },
          ]}
        />
      </FieldStack>
    </FormSection>
  );
};

export default React.memo(CloneCard);
