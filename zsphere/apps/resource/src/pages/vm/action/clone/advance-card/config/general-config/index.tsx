import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@zstack/design";
import { FieldStack, InputField } from "@zstack/form";
import { ModalSelect, useAuth } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { VmGroupPlainList } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/mf-index";

import { vmGroupAuth } from "../../../../../detail/overview/relative-object";
import type { CloneVmValues } from "../../../schema";

interface GeneralConfigProps {
  form: UseFormReturn<CloneVmValues>;
  sourceVm?: IVM;
}

const GeneralConfig: React.FC<GeneralConfigProps> = ({ form, sourceVm }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const vmGroupDefaultQuery = useMemo(
    () => ({
      conditions: [{ key: "zoneUuid", op: Op.eq, value: sourceVm?.zoneUuid }],
    }),
    [sourceVm?.zoneUuid],
  );

  return (
    <FieldStack>
      <InputField
        form={form}
        name="hostname"
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.hostname",
          defaultMessage: "Hostname",
        })}
        size="m"
      />
      {hasAuth(vmGroupAuth) && (
        <FormField
          control={form.control}
          name="vmGroupList"
          render={({ field }) => (
            <FormItem className="flex min-h-8 flex-row items-start gap-2">
              <FormLabel
                info={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "virtualization.create.instance.config.general.schduled.group.tooltip",
                      defaultMessage: `### VM Scheduling Group

1. A virtual machine can be added to only one VM scheduling group. After the addition, the virtual machine will be scheduled based on the scheduling policy associated with the group.

2. The scheduling policies associated with a VM scheduling group can be classified into the following four types: VM Exclusive from Each Other, VM Affinitive to Each Other, VMs Affinitive to Hosts, and VMs Exclusive from Hosts.
          `,
                    })}
                  </ReactMarkdown>
                }
              >
                {intl.formatMessage({
                  id: "virtualization.create.instance.config.general.schduled.group",
                  defaultMessage: "VM Scheduling Group",
                })}
              </FormLabel>
              <div className="flex flex-col">
                <FormControl>
                  <ModalSelect
                    title={intl.formatMessage({
                      id: "select.vmGroup",
                      defaultMessage: "Select VM Scheduling Group",
                    })}
                    selectType="radio"
                    value={field.value}
                    onChange={field.onChange}
                    className="!w-80"
                  >
                    <VmGroupPlainList
                      view="select"
                      defaultQuery={vmGroupDefaultQuery}
                    />
                  </ModalSelect>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      )}
    </FieldStack>
  );
};

export default React.memo(GeneralConfig);
