import { Icon } from "@zstack/icon";
import { Form, Input } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { PrimaryStorageType } from "@zstack/zsphere-types";
import { isPath, isSystemPath } from "@zstack/zsphere-utils";
import type { FormProps } from "antd/lib/form";
import { includes as _includes } from "lodash-es";
import React, { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { PrimaryStorageTypeContext } from "../../create/contexts/storageContexts";
import type { IPrimaryStorageTypeContext } from "../../create/type";

import styles from "./style.module.less";

const iconAlertStyle = {
  color: "var(--danger-500)",
  width: 16,
  height: 16,
} as const;

interface IProps {
  form: FormProps["form"];
}

const MountPath: React.FC<IProps> = () => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const { primaryStorageType } = useContext(
    PrimaryStorageTypeContext,
  ) as IPrimaryStorageTypeContext;

  const { urlTooltip, urlTip } = useMemo(() => {
    const tipInfo: Record<
      string,
      { urlTooltip: React.ReactNode; urlTip: string | null }
    > = {
      [PrimaryStorageType.LocalStorage]: {
        urlTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.localStorageUrl.tooltip",
              defaultMessage: `### Mount Path

1. If the entered path does not exist, the system will automatically create one.
2. System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used.
3. Using system directories might cause the hosts unable to work properly.`,
            })}
          </ReactMarkdown>
        ),
        urlTip: intl.formatMessage({
          id: "virtualization.primaryStorage.field.local.url.hover",
          defaultMessage: "Example: /vms_ds",
        }),
      },
      [PrimaryStorageType.NFS]: {
        urlTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.nfsUrl.tooltip",
              defaultMessage: `### Mount Path

1. Enter the shared directory of the NFS server. Format: NFS_Server_IP:/NFS_Share_folder.
2. You need to set the access permissions of the corresponding directories on the NFS server in advance.
3. To ensure security control on the NFS server, we recommend that you configure corresponding security rules for access control.
4. System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used.
5. Using system directories might cause the hosts unable to work properly.`,
            })}
          </ReactMarkdown>
        ),
        urlTip: intl.formatMessage({
          id: "virtualization.primaryStorage.field.nfs.url.hover",
          defaultMessage: "Example: 192.168.0.1:/nfs_root/",
        }),
      },
      [PrimaryStorageType.SharedMountPoint]: {
        urlTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.primaryStorage.field.sharedMountPointUrl.tooltip",
              defaultMessage: `### Mount Path

1. Enter the URL of the shared storage mounted by the host.
2. System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used.
3. Using system directories might cause the hosts unable to work properly.`,
            })}
          </ReactMarkdown>
        ),
        urlTip: intl.formatMessage({
          id: "virtualization.primaryStorage.field.smp.url.hover",
          defaultMessage: "Example: /mnt/nfs",
        }),
      },
    };

    const { urlTooltip: _urlTooltip, urlTip: _urlTip } = tipInfo[
      primaryStorageType
    ] || { urlTooltip: <></>, urlTip: null };
    return {
      urlTooltip: _urlTooltip,
      urlTip: _urlTip,
    };
  }, [intl, primaryStorageType]);

  return (
    <>
      <Form.Item
        name="url"
        label={intl.formatMessage({
          id: "mountPath",
          defaultMessage: "Mount Path",
        })}
        icon="info"
        iconTooltip={{ title: urlTooltip }}
        rules={[
          isRequired(),
          () => ({
            validator(rule, values) {
              if (isSystemPath(values)) {
                return Promise.reject(
                  Error(
                    intl.formatMessage({
                      id: "virtualization.primaryStorage.field.url.validator.systemPath",
                      defaultMessage: "Unable to mount system directory. Please re-enter.",
                    }),
                  ),
                );
              }
              if (primaryStorageType === PrimaryStorageType.NFS) {
                if (!isPath(values, "nfs")) {
                  return Promise.reject(
                    Error(
                      intl.formatMessage({
                        id: "virtualization.primaryStorage.field.url.validator.format",
                        defaultMessage: "Invalid URL.",
                      }),
                    ),
                  );
                }
              }
              return Promise.resolve();
            },
          }),
        ]}
        tooltip={urlTip}
        description={
          _includes(
            [PrimaryStorageType.NFS, PrimaryStorageType.LocalStorage],
            primaryStorageType,
          ) ? (
            <div className={styles.caption}>
              <Icon
                className="zstack-icon"
                style={iconAlertStyle} type="alert-triangle-fill"
              />
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualization.primaryStorage.field.url.description",
                  defaultMessage:
                    "System directories such as /, /dev/, /proc/, /sys/, /usr/bin, and /bin cannot be used. Using system directories might cause the hosts unable to work properly.",
                })}
              </ReactMarkdown>
            </div>
          ) : null
        }
      >
        <Input className="width-320" />
      </Form.Item>
    </>
  );
};

export default MountPath;
