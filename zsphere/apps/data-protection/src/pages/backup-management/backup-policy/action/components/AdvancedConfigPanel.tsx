import { Switch, Form } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import Qos from "./Qos";

import style from "./style.module.less";

export default function AdvancedConfigPanel() {
  const intl = useIntl();
  return (
    <>
      <Form.Item
        className={style.fieldTitle}
        name="qos"
        label={intl.formatMessage({
          id: "backup.qos",
          defaultMessage: "Backup QoS",
        })}
        valuePropName="checked"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backup.field.qos.tooltip",
              defaultMessage:
                "### Backup QoS\n\n1. You can set a network QoS and disk QoS for VM backup plans. If left blank, the QoS is unlimited by default.\n2. It is recommend to set a QoS based on your physical network environments and the bandwidth that concurrent backup may consume.\n",
            })}
          </ReactMarkdown>
        }
      >
        <Switch />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.qos !== curr.qos}>
        {({ getFieldValue }) => getFieldValue("qos") && <Qos />}
      </Form.Item>
    </>
  );
}
