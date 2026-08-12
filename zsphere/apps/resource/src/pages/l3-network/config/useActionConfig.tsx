import { queryL3NetworkList } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import { useShare, verifyCancelShare } from "@zstack/zsphere-components";
import { useActionConfig as useFlatActionConfig } from "@zstack/zsphere-engine/src/flat-network";
import type { IOption } from "@zstack/zsphere-engine/src/l3-network/useActionConfig";
import type { L3Network } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import CancelShare from "zsv_administration_shared/account-information/action/cancel-share";
import SetShareType from "zsv_administration_shared/account-information/action/set-share-type";

import { SetResourceAttribute } from "../../../components/resource-attribute";
import CreateHostKernelInterface from "../../host-kernel-interface/create";
import AddDns from "../action/add-dns";
import AddIpRangeForm from "../action/add-ip-range";
import DeleteAction from "../action/delete";
import EditConfig from "../action/edit-config";
// shared start
import ShareResource from "../action/share-resource";
import UpdateModal from "../action/update-modal";
// shared end
import {
  addDNS,
  deleteL3Network,
  verifyAddIpRange,
  verifyEditConfig,
  verifySetShareType,
  verifyCreateHostKernelInterface,
} from "../action/validator";
import CreateL3Network from "../create";

function buildL3NetworkActionConfig<T extends Function>(
  useInitActionConfig: T,
): T {
  const useL3ActionConfig = (options: IOption<L3Network> = []) => {
    const iOptions: IOption<L3Network> = [
      {
        key: "cancel.share" as any,
        validators: [verifyCancelShare],
        ActionWrapper: CancelShare,
      },
    ];
    const keys = options.map((option) => option.key);
    const filterOptions = iOptions.filter(
      (iOption) => !keys.includes(iOption.key as "delete"),
    );
    return useInitActionConfig(options.concat(filterOptions) as any);
  };
  return useL3ActionConfig as any as T;
}

export default () => {
  const intl = useIntl();
  const useActionConfig = buildL3NetworkActionConfig(useFlatActionConfig);
  const { verifyShareResource } = useShare();
  const config = useActionConfig<L3Network>([
    {
      key: "virtualization.create",
      autoInjectPreValidator: false,
      ActionWrapper: CreateL3Network,
    },
    {
      key: "virtualization.edit.config",
      validators: [(l3) => !verifyShareResource(l3), verifyEditConfig],
      ActionWrapper: EditConfig,
    },
    {
      key: "virtualization.edit.name.and.description",
      validators: [(l3) => !verifyShareResource(l3)],
      ActionWrapper: UpdateModal,
    },
    {
      key: "virtualization.add.ipv4.range",
      ActionWrapper: (props) => <AddIpRangeForm {...props} ipVersion={4} />,
      tooltip: ({ selectedList }) => {
        const current = selectedList?.[0];
        if (current && !current.enableIPAM) {
          return {
            title: intl.formatMessage({
              id: "add.ip.range.disabled.tooltip",
              defaultMessage: "You cannot add network range because IPAM is disabled.",
            }),
          };
        }
      },
      validators: [(l3) => !verifyShareResource(l3), verifyAddIpRange],
    },
    {
      key: "virtualization.add.ipv6.ipRange",
      ActionWrapper: (props) => <AddIpRangeForm {...props} ipVersion={6} />,
      tooltip: ({ selectedList }) => {
        const current = selectedList?.[0];
        if (current && !current.enableIPAM) {
          return {
            title: intl.formatMessage({
              id: "add.ip.range.disabled.tooltip",
              defaultMessage: "You cannot add network range because IPAM is disabled.",
            }),
          };
        }
      },
      validators: [
        (l3) => !verifyShareResource(l3),
        (l3) =>
          !["manage", "flow"].includes(l3.networkType!) &&
          l3.l2Network?.vSwitchType !== "OvsDpdk",
        verifyAddIpRange,
      ],
    },
    {
      key: "virtualization.set.shareType",
      validators: [verifySetShareType],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "l3network.set.share.type.modal.title.not.support",
          defaultMessage: "Cannot Set Sharing Mode",
        }),
        alertType: "warning",
        alertMessage: intl.formatMessage({
          id: "l3network.set.share.type.modal.alert.default.port.group",
          defaultMessage: "You cannot set sharing mode for a default distributed port group.",
        }),
      },
      ActionWrapper: SetShareType,
    },
    {
      key: "virtualization.add.dns",
      validators: [addDNS, (l3) => !verifyShareResource(l3)],
      ActionWrapper: AddDns,
    },
    {
      key: "virtualization.delete",
      validators: [(l3) => !verifyShareResource(l3), deleteL3Network],
      notSupportedModal: (selectedList) => ({
        title: intl.formatMessage({
          id: "l3network.delete.modal.title.not.support",
          defaultMessage: "Cannot Delete Distributed Port Group",
        }),
        ...(selectedList?.some((item) => item.isDefault)
          ? {
              alertType: "warning" as const,
              alertMessage: intl.formatMessage({
                id: "l3network.delete.modal.alert.default.port.group",
                defaultMessage: "You cannot delete a default distributed port group.",
              }),
            }
          : {}),
      }),
      ActionWrapper: DeleteAction,
    },
    {
      key: "virtualization.create.hostKernelInterface",
      validators: [verifyCreateHostKernelInterface],
      ActionWrapper: CreateHostKernelInterface,
    },
    {
      key: "share.resource",
      autoInjectPreValidator: false,
      ActionWrapper: (props) => (
        <ShareResource {...props} resourceType="L3Network" />
      ),
    },
    {
      key: "virtualization.set.resource.attribute",
      ActionWrapper: SetResourceAttribute,
    },
  ]);
  return { ...config, gql: queryL3NetworkList };
};
