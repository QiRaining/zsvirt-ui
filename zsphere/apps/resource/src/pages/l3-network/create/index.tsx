import { createL3Network } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { getPortGroupVlanMode } from "@zstack/virtualization-resource/src/pages/l3-network/hook";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { PortGroupVlanMode } from "@zstack/zsphere-types";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import BasicCard from "./basic-config";
import IpConfig from "./ip-config";

import style from "./style.module.less";

export const initialBasicValues = {
  name: "",
  description: "",
  ipVersion: 4,
  isByCidr: false,
  enableIPAM: false,
  dhcpService: false,
  vlanMode: PortGroupVlanMode.NONE,
};

export default function Create({
  visible,
  setVisible,
  source,
  selectedList = [],
}: IActionWrapperProps<any>) {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();

  const l2Network = React.useMemo(() => {
    const current = selectedList?.[0] ?? source ?? {};

    if (current.__typename === "L2Network") {
      return {
        uuid: current.uuid,
        name: current.name,
        portGroups: current.portGroups,
      };
    }
  }, [selectedList, source]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        ...initialBasicValues,
        l2Network: l2Network?.uuid ? [l2Network] : [],
      });
    }
  }, [visible, form, l2Network]);

  const submitHandle = useCallback(
    async (e: any) => {
      const params = _cloneDeep(e);

      const {
        isByCidr,
        description,

        networkCidr,
        networkType,
        dhcpIp,
        dnsDomain,
        netmask,
        prefixLen,
        addressMode,
        startIp,
        endIp,
        dns,
        ipAllocateStrategy,
        dhcpService,
        enableIPAM,
        ipVersion = 4,
        ipRangeType,
        gateway,
        name,
        vlan: _vlan,
        vlanMode,
      } = params;

      const vlan = _vlan ? parseInt(_vlan, 10) : 0;

      try {
        doAction({
          mutation: createL3Network,
          payload: {
            networkCidr: isByCidr ? networkCidr?.[ipVersion] : undefined,
            startIp: startIp?.[ipVersion],
            endIp: endIp?.[ipVersion],
            dns: dns?.[ipVersion],
            gateway: gateway?.[ipVersion],
            dhcpIp: dhcpIp?.[ipVersion],
            type: "L3BasicNetwork",
            system: false,
            category: "Private",
            showNetworkServiceType: "Flat",
            dnsDomain,
            enableIPAM,
            networkType,
            netmask,
            prefixLen,
            addressMode,
            vlan,
            vlanMode: getPortGroupVlanMode({ vlan, vlanMode }),
            ipAllocateStrategy,
            dhcpService,
            ipVersion,
            ipRangeType,
            name,
            description,
            l2NetworkUuid: params.l2Network?.[0]?.uuid,
            hideDns: true,
          },
          name: intl.formatMessage({
            id: "virtualization.create.l3network",
            defaultMessage: "New Distributed Port Group",
          }),
          total: 1,
          type: "L3Network",
        });
      } catch {
        // ignore
      }
    },
    [doAction, intl],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.create.l3network",
        defaultMessage: "New Distributed Port Group",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form form={form}>
        <BasicCard source={source} />
        <div className={style.card}>
          <IpConfig />
        </div>
      </Form>
    </DialogForm>
  );
}
