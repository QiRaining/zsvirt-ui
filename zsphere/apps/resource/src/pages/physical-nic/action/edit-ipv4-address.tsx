import { gql, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@zstack/design";
import { FieldStack, useDialogHookFormAdapter } from "@zstack/form";
import { Modal, useValidatePassword } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic as IPhysicalNic } from "@zstack/zsphere-types/graphql";
import { isCidr } from "@zstack/zsphere-utils";
import React, { useMemo, useRef, useEffect } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import { cidrToSubnet } from "../../bond/list/index";
import {
  createPhysicalNicIpv4AddressSchema,
  type PhysicalNicIpv4AddressFormValues,
} from "./schema";

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

const setIpOnInterface = gql`
  mutation setIpOnInterface($input: SetIpOnInterfaceInput!) {
    setIpOnInterface(input: $input) {
      actionId
    }
  }
`;
const checkIpForBondOrNic = gql`
  mutation checkIpForBondOrNic($ip: String!) {
    checkIpForBondOrNic(ip: $ip) {
      available
    }
  }
`;

export const IpAddressItems = (props: {
  form: UseFormReturn<PhysicalNicIpv4AddressFormValues>;
  info?: string;
  ipv4InfoTooltip?: React.ReactNode;
  ipv4Text?: string;
  ipv4Disabled?: boolean;
  required?: boolean;
  skipIp?: string;
}) => {
  const {
    form,
    info,
    ipv4InfoTooltip,
    ipv4Text,
    ipv4Disabled,
    required = true,
  } = props;
  const intl = useIntl();
  const enabled = form.watch("enabled");

  return (
    <>
      <FormField
        control={form.control}
        name="enabled"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-2">
            <FormLabel
              info={ipv4InfoTooltip}
              required={required}
              className="mt-[5px] flex"
            >
              {intl.formatMessage({
                id: "IPv4.address",
                defaultMessage: "IPv4 Address",
              })}
            </FormLabel>
            <FormControl>
              <FormCheckbox
                checked={field.value}
                disabled={ipv4Disabled}
                onChange={field.onChange}
                label={
                  ipv4Text ??
                  intl.formatMessage({
                    id: "designated.ipv4",
                    defaultMessage: "Assign IPv4",
                  })
                }
              />
            </FormControl>
          </FormItem>
        )}
      />
      {enabled && (
        <>
          <FormField
            control={form.control}
            name="ipv4Address"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel required={required} className="mt-[5px] flex" />
                <div className="flex flex-col">
                  <FormControl>
                    <Input
                      {...field}
                      disabled={ipv4Disabled}
                      style={{
                        width: "240px",
                        marginLeft: 0,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {info && <div className={style.info}>{info}</div>}
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="netmask"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel required={required} className="mt-[5px] flex">
                  {intl.formatMessage({
                    id: "netmask",
                    defaultMessage: "Netmask",
                  })}
                </FormLabel>
                <div className="flex flex-col">
                  <FormControl>
                    <Input
                      {...field}
                      disabled={ipv4Disabled}
                      style={{ width: "240px" }}
                    />
                  </FormControl>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          {/* <Form.Item
                  name="gateway"
                  style={{ display: 'inline-flex' }}
                  label={intl.formatMessage({ id: 'gateway', defaultMessage: '网关' })}
                  validateTrigger="onBlur"
                  rules={[
                    {
                      validator: (_: any, value: string) =>
                        validatorIP(
                          value,
                          4,
                          intl.formatMessage({
                            id: 'l3Network.field.gateway.validator.format',
                            defaultMessage: '无效的网关'
                          })
                        )
                    }
                  ]}
                >
                  <Input disabled={ipv4Disabled} style={{ width: '160px' }} />
                </Form.Item> */
          /* <Form.Item
              name="defaultRoute"
              style={{
                display: 'inline-flex',
                marginLeft: '10px' ,
                alignItems: 'center'
              }}
              valuePropName='checked'
            >
              <Checkbox>
                {intl.formatMessage({ id: 'set.default.route', defaultMessage: '设为默认路由' })}
              </Checkbox>
            </Form.Item> */}
        </>
      )}
    </>
  );
};

const EditIpAddressAction: React.FC<IActionWrapperProps<IPhysicalNic>> = ({
  refetch,
  source: _source,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [remoteValidateIp] = useMutation(checkIpForBondOrNic);

  const ipv4Cidr = selectedList?.[0]?.ipAddresses?.find((item) =>
    isCidr(item, 4),
  );

  const editConfig = useMemo(
    () => ({
      ipv4DefaultValue: ipv4Cidr?.split("/")[0] ?? "",
      netmaskDefaultValue: ipv4Cidr ? cidrToSubnet(ipv4Cidr) : "",
    }),
    [ipv4Cidr],
  );

  const validateIpAvailability = useMemo(
    () => async (ip: string) => {
      if (editConfig.ipv4DefaultValue?.includes(ip)) {
        return;
      }
      const res = await remoteValidateIp({ variables: { ip } });

      if (!res?.data?.checkIpForBondOrNic?.available) {
        throw new Error(
          intl.formatMessage({
            id: "vpc.field.requiredIp.validator.used.case.used",
            defaultMessage: "The IP address is already in use.",
          }),
        );
      }
    },
    [editConfig.ipv4DefaultValue, intl, remoteValidateIp],
  );

  const defaultValues = useMemo<PhysicalNicIpv4AddressFormValues>(
    () => ({
      enabled: true,
      ipv4Address: editConfig.ipv4DefaultValue,
      netmask: editConfig.netmaskDefaultValue,
    }),
    [editConfig],
  );
  const formSchema = useMemo(
    () => createPhysicalNicIpv4AddressSchema(intl, validateIpAvailability),
    [intl, validateIpAvailability],
  );
  const form = useForm<PhysicalNicIpv4AddressFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const valueRef = useRef(defaultValues);

  const handleOk = (values: PhysicalNicIpv4AddressFormValues) => {
    valueRef.current = values;

    onOk();
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onOk = () => {
    const { uuid = "" } = selectedList?.[0] || {};
    const ipAddress = valueRef.current.ipv4Address;
    const netmask = valueRef.current.netmask;
    const payload = valueRef.current.enabled
      ? {
          interfaceUuid: uuid,
          ipAddress,
          netmask,
        }
      : {
          interfaceUuid: uuid,
        };

    doAction({
      mutation: setIpOnInterface,
      payload,
      name: intl.formatMessage({
        id: "modify.ip.address",
        defaultMessage: "Modify IP Address",
      }),
      total: selectedList.length,
      type: "physicalNic",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
    setValidateModalVisible(false);
  };

  const {
    setValidateModalVisible,
    validateModalVisible,
    username,
    onConfirmOk,
  } = useValidatePassword({ validate: onOk });

  const modalProps = useMemo(() => {
    return {
      needConfirm: true,
      confirmType: "input",
      confirmInputText: "Confirm",
      actionName: intl.formatMessage({
        id: "modify",
        defaultMessage: "Edit",
      }),
    } as any;
  }, [intl]);

  return (
    <>
      <DialogForm
        onOk={handleOk}
        form={dialogForm}
        visible={visible}
        setVisible={setVisible}
        resourceName={selectedList?.[0]?.name}
        title={intl.formatMessage({
          id: "modify.ip.address",
          defaultMessage: "Modify IP Address",
        })}
        alertType="danger"
        alertMessage={intl.formatMessage({
          id: "physicalNic.edit.ip.error",
          defaultMessage:
            "Modifying the IP address may cause a network interruption on the NIC port. Proceed with caution.",
        })}
        {...modalProps}
      >
        <Form {...form}>
          <FieldStack>
            <IpAddressItems form={form} skipIp={editConfig.ipv4DefaultValue} />
          </FieldStack>
        </Form>
      </DialogForm>
      <Modal.ValidateModal
        title={intl.formatMessage({
          id: "physicalNic.edit.ip.verify.identidy.title",
          defaultMessage: "Modify IP Address?",
        })}
        alertType="danger"
        alertMessage={intl.formatMessage({
          id: "physicalNic.edit.ip.error",
          defaultMessage:
            "Modifying the IP address may cause a network interruption on the NIC port. Proceed with caution.",
        })}
        username={username}
        visible={validateModalVisible}
        setVisible={setValidateModalVisible}
        onOk={onConfirmOk}
      />
    </>
  );
};

export default EditIpAddressAction;
