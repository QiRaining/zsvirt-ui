import { CodeMirrorEditor, Card } from "@zstack/zsphere-components";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useIntl } from "react-intl";

const cardStyle = { marginTop: 20 } as const;

interface IProps {
  current: IPreconfigurationTemplate;
}

const Overview: FC<IProps> = ({ current }) => {
  const intl = useIntl();
  return (
    <Card
      style={cardStyle}
      title={intl.formatMessage({
        id: "template.content",
        defaultMessage: "Template Content",
      })}
    >
      <CodeMirrorEditor
        height="60vh"
        value={current?.content}
        readonly
        border
      />
    </Card>
  );
};

export default Overview;
