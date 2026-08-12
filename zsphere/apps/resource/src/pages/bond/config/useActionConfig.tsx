import { useActionConfig } from "@zstack/zsphere-engine/src/bond";
import type { Bond } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  verifyAddNic,
  verifyZSVRemoveNic,
  verifySelected,
  verifyWithoutVsiwth,
  verifyVSwitchIsNotDefault,
} from "../action/validator";

export default (actionProps: any) => {
  const intl = useIntl();
  return useActionConfig<Bond>([
    {
      key: "add.physical.nic",
      validators: [verifyAddNic],
      tooltip: intl.formatMessage({
        id: "bond.action.add.physical.nic.disabled.tooltip",
        defaultMessage: "The number of physical ports in this bond has reached the maximum limit of 8. No more ports can be added.",
      }),
      ActionWrapper: require("../action/add-physical-nic").default,
    },
    {
      key: "remove.physical.nic",
      validators: [verifyZSVRemoveNic],
      tooltip: ({ source }) =>
        source?.isDefault
          ? intl.formatMessage({
              id: "bond.action.remove.physical.nic.disabled.with.default.vswitch.tooltip",
              defaultMessage: "The number of physical ports in this bond is 1. No ports can be removed.",
            })
          : intl.formatMessage({
              id: "bond.action.remove.physical.nic.disabled.tooltip",
              defaultMessage: "The number of physical ports in this bond is 0. No ports can be removed.",
            }),
      ActionWrapper: require("../action/remove-physical-nic").default,
    },
    {
      key: "remove.host.from.bond",
      validators: [verifyVSwitchIsNotDefault],
      ActionWrapper: require("../action/remove-host").default,
    },
    {
      key: "addNic",
      tooltip: ({ selectedList }) =>
        verifyAddNic(selectedList?.[0])
          ? intl.formatMessage({
              id: "bond.action.with.vswitch.disabled.tooltip.in.bond.list",
              defaultMessage:
                "This aggregated port has been linked to the upstream link, please go to the \\\"Distributed Switch > Upstream Link\\\" page to modify the configuration.",
            })
          : intl.formatMessage({
              id: "bond.action.add.physical.nic.disabled.tooltip",
              defaultMessage:
                "The number of physical ports in this bond has reached the maximum limit of 8. No more ports can be added.",
            }),
      validators: [verifyAddNic, verifyWithoutVsiwth],
      ActionWrapper: require("../action/add-physical-nic").default,
    },
    {
      key: "removeNic",
      tooltip: ({ selectedList, source }) => {
        if (verifyZSVRemoveNic(selectedList?.[0], source)) {
          return intl.formatMessage({
            id: "bond.action.with.vswitch.disabled.tooltip.in.bond.list",
            defaultMessage:
              "This aggregated port has been linked to the upstream link, please go to the \\\"Distributed Switch > Upstream Link\\\" page to modify the configuration.",
          });
        }
        return source?.isDefault
          ? intl.formatMessage({
              id: "bond.action.remove.physical.nic.disabled.with.default.vswitch.tooltip",
              defaultMessage: "The number of physical ports in this bond is 1. No ports can be removed.",
            })
          : intl.formatMessage({
              id: "bond.action.remove.physical.nic.disabled.tooltip",
              defaultMessage: "The number of physical ports in this bond is 0. No ports can be removed.",
            });
      },
      validators: [verifyZSVRemoveNic, verifyWithoutVsiwth],
      ActionWrapper: require("../action/remove-physical-nic").default,
    },
    {
      key: "delete",
      autoInjectPreValidator: false,
      ActionWrapper: (props) => {
        const Action = require("../action/delete").default;
        return <Action {...actionProps} {...props} />;
      },
      preValidators: [verifySelected],
      validators: [verifyWithoutVsiwth],
      notSupportedModal: {
        title: intl.formatMessage({
          id: "bond.action.notSupportModal.title.delete.bond",
          defaultMessage: "Delete Bond?",
        }),
        itemName: "bondingName",
        alertType: "error",
        alertMessage: intl.formatMessage({
          id: "bond.action.notSupportModal.alertMessage.delete.bond",
          defaultMessage:
            "Deleting a bond will disconnect its network and release all physical ports from the bond. Proceed with caution.",
        }),
      },
      tooltip: intl.formatMessage({
        id: "bond.action.delete.tooltip",
        defaultMessage: "You cannot delete the bond because it is currently in use by a distributed switch.",
      }),
    },

    {
      key: "edit",
      ActionWrapper: require("../action/edit").default,
    },
    {
      key: "set.physicalNetwork.type",
      ActionWrapper: require("../action/set-physicalNetwork-type").default,
      description: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "physicalNetwork.action.modify.physicalNetworkType.description",
            defaultMessage: "description",
          })}
        </ReactMarkdown>
      ),
    },
    {
      key: "edit.description",
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      ActionWrapper: require("../action/edit").default,
    },
  ]);
};
