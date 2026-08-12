import { Form, Input } from "@zstack/zsphere-components";
import type { FormProps } from "antd/lib/form";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import MountPath from "../mountPath";
import StorageNetworkInfo from "../storageNetwork-info";

interface IProps {
  form: FormProps["form"];
}

const NfsStorageDeviceInfo: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();
  return (
    <>
      <MountPath form={form} />
      <Form.Item
        name="mountOptions"
        label={intl.formatMessage({
          id: "mountOptions",
          defaultMessage: "Mount Option",
        })}
        icon="info"
        iconTooltip={{
          title: (
            <ReactMarkdown>
              {intl.formatMessage({
                id: "virtualization.primaryStorage.field.mountOptions.tooltip",
                defaultMessage: `### Mount Option

1. Optional. To add mount options, make sure that these options are supported by the NFS server.
2. The options are separated by commas (,). For example, nfsvers=3,sec=sys,tcp,intr,timeo=5. The preceding example means that the NFS server version is 3, the standard UNIX authentication mechanism is used, TCP is used as the transmission protocol, an NFS call can be interrupted in case of an exception, and the timeout is 0.5 seconds (5/10).
3. To specify the mount options, you can refer to the content in the -o parameter of mount.
4. You can set the options according to the mount command on commonly used clients. If the configured options conflict with the NFS server, the server shall prevail.`,
              })}
            </ReactMarkdown>
          ),
        }}
      >
        <Input className="width-320" />
      </Form.Item>
      <StorageNetworkInfo form={form} />
    </>
  );
};

export default NfsStorageDeviceInfo;
