import { CodeMirrorEditor } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";

export default (current: any) => {
  const intl = useIntl();
  return (
    <div>
      <p>
        {intl.formatMessage({
          id: "preConfigurationTemplate.content",
          defaultMessage: "Template Content",
        })}
      </p>
      <CodeMirrorEditor
        height="60vh"
        value={current?.content}
        readonly
        border
      />
    </div>
  );
};
