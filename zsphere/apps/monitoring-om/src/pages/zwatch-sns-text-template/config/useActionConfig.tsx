import { useActionConfig } from "@zstack/zsphere-engine/src/zwatch-sns-text-template";
import type { IOption } from "@zstack/zsphere-engine/src/zwatch-sns-text-template/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  cancelDefaultSNSTextTemplate,
  setDefaultSNSTextTemplate,
} from "../../../gql/zwatch-sns-text-template.gql";
import Update from "../action/update-modal";
import { canCancelDefault, canSetDefault, many } from "../action/validators";
import CreateModal from "../create";

export default () => {
  const intl = useIntl();
  const doAction = useAction();

  const options: IOption<ISNSTextTemplate> = useMemo(
    () => [
      {
        key: "create.sns.text.template",
        name: intl.formatMessage({
          id: "new.messageTemplate",
          defaultMessage: "New Message Template",
        }),
        autoInjectPreValidator: false,
        primary: true,
        onClick: null as any,
        ActionWrapper: (props) => <CreateModal {...props} />,
      },
      {
        key: "editConfig",
        autoInjectPreValidator: false,
        primary: true,
        onClick: null as any,
        ActionWrapper: (props) => <CreateModal modalType="edit" {...props} />,
      },
      {
        key: "edit.zsv",
        autoInjectPreValidator: false,
        ActionWrapper: (props) => <Update {...props} />,
      },
      {
        key: "make.default",
        validators: [canCancelDefault],
        onClick: ({ selectedList = [], setSelectedList }) => {
          if (selectedList?.length) {
            const payload = selectedList?.map((it) => {
              return {
                uuid: it?.uuid,
              };
            });
            doAction({
              mutation: setDefaultSNSTextTemplate,
              payload,
              name: intl.formatMessage({
                id: "set.sns.text.template.default.action",
                defaultMessage: "Make Default",
              }),
              total: selectedList.length,
              onFinish: () => {
                setSelectedList?.([]);
              },
              type: "SNSTextTemplate",
            });
          }
        },
      },
      {
        key: "unset.default.template",
        validators: [canSetDefault],
        onClick: ({ selectedList = [], setSelectedList }) => {
          if (selectedList?.length) {
            const payload = selectedList?.map((it) => {
              return {
                uuid: it?.uuid,
              };
            });
            doAction({
              mutation: cancelDefaultSNSTextTemplate,
              payload,
              name: intl.formatMessage({
                id: "unset.sns.text.template.default.action",
                defaultMessage: "Cancel Default Setting",
              }),
              total: selectedList.length,
              onFinish: () => {
                setSelectedList?.([]);
              },
              type: "SNSTextTemplate",
            });
          }
        },
      },
      {
        key: "delete",
        preValidators: [many],
        ActionWrapper: require("../action/delete").default,
      },
    ],
    [doAction, intl],
  );
  return useActionConfig(options);
};
