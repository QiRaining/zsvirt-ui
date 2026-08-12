import { Text } from "@zstack/design";
import { ZSVForm } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  form: any;
  source?: any;
}

const SnapshotInfo: React.FC<IProps> = ({ source }) => {
  const intl = useIntl();

  return (
    <ZSVForm.Card
      title={intl.formatMessage({
        id: "snapshot.info",
        defaultMessage: "Snapshot Info",
      })}
    >
      <Form.Item
        label={intl.formatMessage({ id: "snapshot", defaultMessage: "Snapshot" })}
        name="snapshotName"
        style={{ marginBottom: 20 }}
      >
        <Text>{source?.group?.name ?? source?.name ?? ""}</Text>
      </Form.Item>
    </ZSVForm.Card>
  );
};

export default React.memo(SnapshotInfo);
