import { Form, Input } from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import { validCidr } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { isExist, validCidr0 } from "./utils";

import style from "./style.module.less";

export interface IProps {
  form?: FormInstance;
}

const NetworkSetting: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const [formData, setFormData] = React.useState<any>({});

  React.useEffect(() => {
    new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(form?.getFieldsValue());
      }, 0);
    }).then((data) => {
      setFormData(data);
    });
  }, [form]);

  const { isRequired } = useValidator(intl);

  return (
    <>
      <Form.Item
        label={intl.formatMessage({
          id: "vdiNetwork",
          defaultMessage: "VDI Network",
        })}
        name="displayNetworkCidr"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.vdiNetwork.tooltip",
              defaultMessage: `### VDI Network

1. Enter the VDI network CIDR if you deployed a network used independently by VDI.
2. If this setting does not take effect, VDI will use the management network by default.`,
            })}
          </ReactMarkdown>
        }
        rules={[
          {
            required: isExist(formData?.displayNetworkCidr),
            message: isRequired(IIsRequiredType.input).message,
          },
          {
            validator: (rule, value) => {
              return validCidr(rule, value, intl);
            },
          },
          {
            validator: (rule, value) => {
              return validCidr0(rule, value, intl);
            },
          },
        ]}
      >
        <Input className={style["width-320"]} />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: "migrateNetwork",
          defaultMessage: "Migration Network",
        })}
        name="migrateNetworkCidr"
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cluster.field.migrateNetwork.tooltip",
              defaultMessage: `### Migration Network

1. The network used for migrating virtual machines. Enter the CIDR of the migration network here.
2. If not set, the management network will be used for VM migration by default.`,
            })}
          </ReactMarkdown>
        }
        rules={[
          {
            required: isExist(formData?.migrateNetworkCidr),
            message: isRequired(IIsRequiredType.input).message,
          },
          {
            validator: (rule, value) => {
              return validCidr(rule, value, intl);
            },
          },
          {
            validator: (rule, value) => {
              return validCidr0(rule, value, intl);
            },
          },
        ]}
      >
        <Input className={style["width-320"]} />
      </Form.Item>
    </>
  );
};

export default NetworkSetting;
