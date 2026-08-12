import { useActionConfig } from "@zstack/zsphere-engine/src/script-list";
import type { IActionOption } from "@zstack/zsphere-engine/src/script-list/useActionConfig";
import type { Script } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router";
import { DrawerContainer } from "shared/common/mf-index";

import CreateAction from "../action/create";
import DeleteAction from "../action/delete";
import EditNameDescAction from "../action/edit-name-desc";
import ExecuteScriptAction from "../action/execute-script";
import Modify from "../modify";

export default () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const option = useMemo<IActionOption<Script>>(
    () => [
      {
        key: "create.script",
        autoInjectPreValidator: false,
        primary: true,
        ActionWrapper: CreateAction,
      },
      {
        key: "edit.nameAndDescription",
        ActionWrapper: EditNameDescAction,
      },
      {
        key: "execute.script",
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "script.action.execute.script.description",
              defaultMessage: `### Execute Script
Execute the script in a specified VM instance. Make sure the following points:
1. The VM operating systems match the script platform type.
2. The VM instance is running.
3. The VM instance is installed with the GuestTools of the latest version.`,
            })}
          </ReactMarkdown>
        ),
        ActionWrapper: ExecuteScriptAction,
      },
      {
        key: "modify.script",
        ActionWrapper: (props) => (
          <DrawerContainer visible={props?.visible}>
            <Modify {...props} />
          </DrawerContainer>
        ),
      },
      {
        key: "delete",
        ActionWrapper: DeleteAction,
      },
    ],
    [intl, navigate],
  );
  return useActionConfig<Script>(option);
};
