import { useActionConfig } from "@zstack/zsphere-engine/src/iscsi-server";
import { useAction } from "@zstack/zsphere-hooks";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { updateIscsiServers } from "../../../gql/iscsi-server.gql";
import UpdateAction from "../action/base/update-iscsi-server";
import {
  verifyDelete,
  verifyMultiSelect,
  verifyRefreshIscsiServer,
  verifyDisable,
  verifyEnable,
} from "../action/validator";

export default () => {
  const intl = useIntl();
  const doAction = useAction();
  return useActionConfig<IIscsiServer>([
    {
      key: "virtualization.add.iscsi.server",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper:
        require("@zstack/virtualization-resource/src/pages/iscsi-server/create")
          .default,
    },
    {
      key: "enable",
      preValidators: [verifyMultiSelect],
      validators: [verifyEnable],
      onClick: ({ selectedList, setSelectedList }) => {
        doAction({
          mutation: updateIscsiServers,
          payload: selectedList
            .filter((cv) => cv.state !== "Enabled")
            .map((cv) => ({
              uuid: cv.uuid,
              state: "Enabled",
            })),
          name: intl.formatMessage({
            id: "enable.IscsiServer",
            defaultMessage: "Enable iSCSI Storage",
          }),
          total: selectedList.filter((cv) => cv.state !== "Enabled").length,
          onFinish: () => {
            setSelectedList?.([]);
          },
        });
      },
      icon: "play-circle",
    },
    {
      key: "add.data.storage",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper:
        require("@zstack/virtualization-resource/src/pages/primary-storage/create")
          .default,
    },
    {
      key: "disable",
      preValidators: [verifyMultiSelect],
      validators: [verifyDisable],
      ActionWrapper: require("../action/base/disabled-modal").default,
      icon: "stop-circle",
    },
    {
      key: "edit",
      name: intl.formatMessage({ id: "edit.name", defaultMessage: "Edit Name" }),
      ActionWrapper: (props) => {
        const myProps = {
          ...props,
          updateData: {
            name: props?.selectedList?.[0]?.name,
          },
        };
        return <UpdateAction {...myProps} />;
      },
    },
    {
      key: "refresh.iscsi.server",
      preValidators: [verifyRefreshIscsiServer],
      ActionWrapper: require("../action/base/refresh-iscsi-server").default,
    },
    {
      key: "delete",
      preValidators: [verifyDelete],
      ActionWrapper: require("../action/base/delete").default,
    },
  ]);
};
