import { useActionConfig } from "@zstack/zsphere-engine/src/pre-config-template";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import { downloadFile } from "@zstack/zsphere-utils";
import { useCallback } from "react";
import { useIntl } from "react-intl";

import {
  disabled,
  enabled,
  verifyIsPredefined,
  verifyMulti,
} from "../action/validator";

export default () => {
  const intl = useIntl();
  const downloadTemplateFile = useCallback(async (selectedList) => {
    const fileType = {
      preseed: "seed",
      kickstart: "cfg",
      autoyast: "xml",
    };
    type UFileType = keyof typeof fileType;
    const { content, name, type } = selectedList.selectedList[0];
    const fileName = `${name}.${fileType?.[type as UFileType]}`;
    downloadFile(fileName, content);
  }, []);

  return useActionConfig<IPreconfigurationTemplate>([
    {
      key: "add.preconfigurationTemplate",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "start",
      preValidators: [verifyMulti],
      validators: [enabled],
      ActionWrapper: require("../action/start-modal").default,
    },
    {
      key: "stop",
      preValidators: [verifyMulti],
      validators: [disabled],
      ActionWrapper: require("../action/stop-modal").default,
    },
    {
      key: "delete",
      validators: [verifyIsPredefined],
      ActionWrapper: require("../action/delete-modal").default,
      notSupportedModal: {
        title: intl.formatMessage({
          id: "baremetal.pre.config.template.modal.title.cannot.delete.pre.config.template",
          defaultMessage: "Cannot Delete Bare Metal Template",
        }),
      },
    },
    {
      key: "donwload",
      autoInjectPreValidator: false,
      onClick: (selectedList) => downloadTemplateFile(selectedList),
    },
    {
      key: "edit",
      validators: [verifyIsPredefined],
      ActionWrapper: require("../action/modify").default,
    },
  ]);
};
