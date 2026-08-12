import SelectTag from "@zstack/virtualization-resource/src/pages/tag/components/select-tag/index";
import { TextArea } from "@zstack/zsphere-components";
import { Form, Input, useAuth } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { FormCreateType } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

import VmSpecForm from "./vm-spec-form";

import styles from "./style.module.less";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  source?: any;
}

const { Item } = Form;

const GeneralConfig: React.FC<IProps> = ({ form, source }) => {
  const intl = useIntl();
  const { longDescriptionRules } = useValidator(intl);

  const { hasAuth } = useAuth();

  return (
    <div className={styles.content}>
      <Form.Item
        name="description"
        rules={longDescriptionRules}
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
      >
        <TextArea className="width-320" isShowLimit limit={2000} rows={4} />
      </Form.Item>
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.config.general.config.tag",
          defaultMessage: "Tag",
        })}
        name="tags"
      >
        <SelectTag className="width-320" />
      </Item>
      {hasAuth({
        resource: "virtualization.vm.spec",
        type: "view",
        authKey: "list",
      }) ? (
        <VmSpecForm />
      ) : (
        <Item
          label={intl.formatMessage({
            id: "virtualization.create.instance.config.general.hostname",
            defaultMessage: "Hostname",
          })}
          name="hostname"
        >
          <Input className="width-320" />
        </Item>
      )}
    </div>
  );
};

export default React.memo(GeneralConfig);
