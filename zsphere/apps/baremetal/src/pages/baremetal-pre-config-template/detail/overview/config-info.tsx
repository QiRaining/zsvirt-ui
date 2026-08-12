import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { CodeMirrorEditor, DraggableCard } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: IPreconfigurationTemplate;
}

const divTopPaddingStyle: React.CSSProperties = { paddingTop: 4 };

const ConfigInfo: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const [previewVisible, setPreviewVisible] = useState(false);
  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "template.content",
        defaultMessage: "Template Content",
      })}
      draggable={false}
      extra={
        <div style={divTopPaddingStyle}>
          <Tooltip
            title={intl.formatMessage({
              id: "look.for.detail",
              defaultMessage: "View Details",
            })}
          >
            <Icon
              type="audit"
              onClick={() => setPreviewVisible(true)}
              className="action-icon"
            />
          </Tooltip>
        </div>
      }
    >
      <CodeMirrorEditor height="60vh" value={current?.content} readonly />
      <DialogBase
        title={intl.formatMessage({
          id: "preConfigurationTemplate.modal.title.see.content",
          defaultMessage: "View Baremetal Preconfigured Template Content",
        })}
        visible={previewVisible}
        setVisible={setPreviewVisible}
        widthClassName="w-[1000px]"
        onCancel={() => setPreviewVisible(false)}
        footer={
          <Button
            key="submit"
            variant="primary"
            onClick={() => setPreviewVisible(false)}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        <CodeMirrorEditor
          height="60vh"
          value={current?.content}
          readonly
          minimap
        />
      </DialogBase>
    </DraggableCard>
  );
};

export default ConfigInfo;
