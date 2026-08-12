import { CodeMirrorEditor } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useIntl } from "react-intl";

interface IProps {
  visible: any;
  setVisible: any;
  fileValue: any;
}

const Action: React.FC<IProps> = ({ visible, setVisible, fileValue }) => {
  const intl = useIntl();

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "preConfigurationTemplate.modal.title.action.see.preConfigurationTemplate",
        defaultMessage: "View Template Content",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-200"
      hideCancelButton
      onOk={() => setVisible(false)}
    >
      <CodeMirrorEditor height="60vh" value={fileValue} readonly border />
    </DialogBase>
  );
};

export default Action;
