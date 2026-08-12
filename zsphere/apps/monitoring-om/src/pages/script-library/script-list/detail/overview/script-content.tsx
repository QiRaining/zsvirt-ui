import { CodeEditor } from "@zstack/unifie";
import { Card } from "@zstack/zsphere-components";
import { ScriptEncodingType } from "@zstack/zsphere-types";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import { decodeBase64 } from "../../../../utils";

import style from "./style.module.less";

interface IProps {
  detail: IScript;
}

const ScriptContent: FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const { scriptContent, encodingType } = detail;

  return (
    <Card
      title={intl.formatMessage({
        id: "scriptContent",
        defaultMessage: "Script Content",
      })}
      className={style["script-content"]}
    >
      <CodeEditor
        value={
          encodingType === ScriptEncodingType.Base64
            ? decodeBase64(scriptContent)
            : scriptContent || "null"
        }
        className="h-[400px] border-none"
        editable={false}
      />
    </Card>
  );
};

export default ScriptContent;
