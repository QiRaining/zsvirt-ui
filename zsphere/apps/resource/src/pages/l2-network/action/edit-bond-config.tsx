import { gql, useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  FieldStack,
  SelectField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { getBondReleatedResource } from "@zstack/virtualization-resource/src/gql/bond.gql";
import { Title } from "@zstack/zsphere-components";
import { DialogForm, DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  L2Network,
  UpdateVirtualSwitchUplinkBondingsActionPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createEditBondConfigSchema,
  type EditBondConfigValues,
} from "./schema";

const updateVirtualSwitchUplinkBondings = gql`
  mutation updateVirtualSwitchUplinkBondings(
    $input: UpdateVirtualSwitchUplinkBondingsActionInput!
  ) {
    updateVirtualSwitchUplinkBondings(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<L2Network, L2Network>> = (props) => {
  const { refetch, visible, setVisible, source: _source, selectedList } = props;

  const intl = useIntl();
  const doAction = useAction();
  const l2Network = selectedList?.[0];

  const [confirmVisible, setConfirmVisible] = useState(false);

  const [queryBondReleatedResource, { data, loading }] = useLazyQuery(
    getBondReleatedResource,
  );

  const [payload, setPayload] =
    useState<UpdateVirtualSwitchUplinkBondingsActionPayload>();
  const defaultValues = useMemo<EditBondConfigValues>(
    () => ({
      mode: l2Network?.systemTags?.bondingMode ?? "802.3ad",
      xmitHashPolicy: l2Network?.systemTags?.xmitHashPolicy ?? "layer2+3",
    }),
    [l2Network],
  );
  const formSchema = useMemo(() => createEditBondConfigSchema(intl), [intl]);
  const form = useForm<EditBondConfigValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const mode = form.watch("mode");

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
      setPayload(undefined);
    }
  }, [defaultValues, form, visible]);

  useEffect(() => {
    if (mode === "802.3ad" && !form.getValues("xmitHashPolicy")) {
      form.setValue("xmitHashPolicy", "layer2+3", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, mode]);

  const releatedResource = useMemo(() => {
    if (loading || !data) {
      return { host: 0, vm: 0 };
    }
    return {
      host: data?.bondReleatedResource?.host,
      vm: data?.bondReleatedResource?.vm,
    };
  }, [data, loading]);

  const onConfirmOk = () => {
    doAction({
      mutation: updateVirtualSwitchUplinkBondings,
      payload,
      name: intl.formatMessage({
        id: "edit.bonding.mode",
        defaultMessage: "Modify Uplink Mode",
      }),
      total: 1,
      type: "Bond",
      onFinish: () => refetch?.(),
    });
    setVisible(false);
    setConfirmVisible(false);
    setPayload(undefined);
  };

  const onOk = (values: EditBondConfigValues) => {
    if (!l2Network?.uuid) {
      return;
    }

    const _payload: UpdateVirtualSwitchUplinkBondingsActionPayload = {
      xmitHashPolicy: values.mode === "802.3ad" ? values.xmitHashPolicy : null,
      mode: values.mode,
      uuid: l2Network.uuid,
    };
    queryBondReleatedResource({
      variables: {
        bondingName: l2Network?.physicalInterface,
      },
    });
    setPayload(_payload);
    setConfirmVisible(true);
  };

  return (
    <>
      <DialogForm
        title={
          <Title
            title={intl.formatMessage({
              id: "edit.bonding.mode",
              defaultMessage: "Modify Uplink Mode",
            })}
            resourceName={l2Network?.physicalInterface}
          />
        }
        widthClassName="w-150"
        onCancel={() => setVisible(false)}
        onOk={onOk}
        visible={visible}
        form={dialogForm}
        setVisible={setVisible}
      >
        <Form {...form}>
          <FieldStack>
            <FormItem className="flex flex-row gap-2">
              <FormLabel className="mt-[5px] flex">
                {intl.formatMessage({
                  id: "up.bond.name",
                  defaultMessage: "Uplink Name",
                })}
              </FormLabel>
              <div className="flex min-h-8 items-center">
                {l2Network?.physicalInterface}
              </div>
            </FormItem>
            <SelectField
              form={form}
              name="mode"
              label={intl.formatMessage({
                id: "bond.mode.in.host",
                defaultMessage: "Bond Mode",
              })}
              labelTooltip={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "bond.field.bond.mode.tooltip",
                    defaultMessage: `### Bond Mode
Supports 2 Bond modes: Active-backup (mode1) and LACP (mode4).
1. Active-backup: This mode allows you to bind 1-2 physical NIC ports and we recommend that you bind 2 ports, one acting as the primary port and the other as the secondary port. The primary port handle all network flows by default. When the primary port fails, the secondary port automatically replaces the primary port to handle flows and avoid business interruptions.
2. LACP:
   - Link aggregation control protocol (LACP) mode. This mode allows you to bind 1-8 physical NIC ports and we recommend that you bind at least 2 ports. Bound ports share the same speed and duplex setting. Network flows are evenly sent to the bound ports, thus realizing a load balance.
   - A bond of this mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.
     - layer2+3: Picks out a port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
     - layer3+4: Picks out a port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
     - layer2: Picks out a port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                  })}
                </ReactMarkdown>
              }
              options={[
                {
                  label: intl.formatMessage({
                    id: "link.aggregation.mode",
                    defaultMessage: "LACP (mode 4)",
                  }),
                  value: "802.3ad",
                },
                {
                  label: intl.formatMessage({
                    id: "master.backup.mode",
                    defaultMessage: "Active-Backup (mode1)",
                  }),
                  value: "active-backup",
                },
              ]}
            />

            {mode !== "active-backup" ? (
              <SelectField
                form={form}
                name="xmitHashPolicy"
                label={intl.formatMessage({
                  id: "HashPolicy",
                  defaultMessage: "Hash Policy",
                })}
                labelTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "bond.field.HashPolicy.tooltip",
                      defaultMessage: `### Hash Policy
A bond of LACP mode determines its network export based on a hash computation. Three hash policies are supported: layer2+3, layer 3+4, and layer2.

1. layer2+3: Picks out a NIC port to send data packets based on the hash computation on the source MAC address, destination MAC address, and IP address.
2. layer3+4: Picks out a NIC port to send data packets based on the hash computation on the IP address and port. TCP/IP stacks are supported.
3. layer2: Picks out a NIC port to send data packets based on the hash computation on the source MAC address and destination MAC address.`,
                    })}
                  </ReactMarkdown>
                }
                options={["layer2+3", "layer3+4", "layer2"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            ) : null}
          </FieldStack>
        </Form>
      </DialogForm>
      <DialogP0
        visible={confirmVisible}
        setVisible={setConfirmVisible}
        bannerMessage={intl.formatMessage({
          id: "edit.AggPort.alert",
          defaultMessage:
            "Modifying the bond may cause a network interruption. Proceed with caution.",
        })}
        title={intl.formatMessage({
          id: "l2Network.modal.title.confirm.edit.bond.type",
          defaultMessage: "Modify Uplink Mode?",
        })}
        resourceNames={[l2Network?.physicalInterface ?? l2Network?.uuid ?? ""]}
        onConfirm={onConfirmOk}
        confirmText={intl.formatMessage({
          id: "confirm.edit",
          defaultMessage: "Confirm to Edit",
        })}
        guide={{
          confirmWord: "edit",
          guideMessage: intl.formatMessage(
            {
              id: "l2Network.edit.bond.confirm.guide",
              defaultMessage:
                '{hostCount} hosts and {vmCount} VMs are associated with the selected uplinks. I acknowledge the above risks. To confirm to edit, type "{confirmWord}" here.',
            },
            {
              hostCount: (
                <span className="font-bold text-neutral-800">
                  {releatedResource.host ?? 0}
                </span>
              ),
              vmCount: (
                <span className="font-bold text-neutral-800">
                  {releatedResource.vm ?? 0}
                </span>
              ),
              confirmWord: (
                <span className="text-danger-600 font-bold">edit</span>
              ),
            },
          ),
        }}
      />
    </>
  );
};

export default Action;
