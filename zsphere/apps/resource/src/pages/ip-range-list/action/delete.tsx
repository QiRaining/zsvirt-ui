import { gql } from "@apollo/client";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { IpRange as IIpRange } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteIpRange = gql`
  mutation deleteIpRange($input: DeleteIpRangeInput!) {
    deleteIpRange(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<
  IActionWrapperProps<IIpRange> & {
    refetchCount?: Function;
  }
> = ({ refetchCount, visible, setVisible, selectedList, setSelectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = async () => {
    setVisible(false);

    doAction({
      mutation: deleteIpRange,
      payload: selectedList?.map(({ uuid }) => ({ uuid })),
      name: intl.formatMessage({
        id: "delete.ip.range",
        defaultMessage: "Delete Network Range",
      }),
      total: selectedList.length,
      type: "IpRange",
      onFinish: () => {
        setSelectedList?.([]);
        refetchCount?.();
      },
    });
  };

  const isFlat = window.location.pathname.includes("flat-network");

  const [_vmCount, _vrouterCount] = useMemo(() => {
    const vm = selectedList.reduce((acc, cur) => {
      acc += cur?.linkResource?.vm ?? 0;
      return acc;
    }, 0);
    const vrouter = selectedList.reduce((acc, cur) => {
      acc += cur?.linkResource?.vrouter ?? 0;
      return acc;
    }, 0);
    return [vm, vrouter];
  }, []);

  return (
    <DialogP0
      setVisible={setVisible}
      onConfirm={onOk}
      visible={visible}
      title={intl.formatMessage({
        id: "ipRange.modal.title.confirm.delete.networkRange",
        defaultMessage: "Delete Network Range?",
      })}
      bannerMessage={
        <ReactMarkdown>
          {!isFlat
            ? intl.formatMessage({
                id: "ipRange.modal.delete.alert.danger",
                defaultMessage: `1. Deleting a network range detaches the VM NICs that are using the network range. If the NIC is using a double-stack network, it is detached only when both the IPv4 and IPv6 ranges it is using are deleted.
2. Deleting a network range deletes the VPC vRouters whose default public network NICs are using the network range. If the NIC is using a double-stack network, the VPC vRouter is deleted only when both the IPv4 and IPv6 ranges the NIC is using are deleted.
3. Deleting a network range deletes the VPC vRouters whose management network NICs are using the network range. If the NIC is using a double-stack network, the VPC vRouter is deleted only when both the IPv4 and IPv6 ranges the NIC is using are deleted.
4. If the L3 network has a DHCP IP that is in the selected network range, deleting the network range does not delete the DHCP IP. If all network ranges under the L3 network are deleted, the DHCP IP will be released.`,
              })
            : intl.formatMessage({
                id: "flat.network.ipRange.modal.delete.alert.danger",
                defaultMessage: `1. Deleting a network range also detaches the VM NICs that are using the network range. Please exercise caution.

2. If the L3 network has a DHCP IP that is in the selected network range, deleting the network range does not delete the DHCP IP. If all network ranges under the L3 network are deleted, the DHCP IP will be released.`,
              })}
        </ReactMarkdown>
      }
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      resourceType={intl.formatMessage({
        id: "networkRange",
        defaultMessage: "Network Range",
      })}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
    />
  );
};

export default Action;
