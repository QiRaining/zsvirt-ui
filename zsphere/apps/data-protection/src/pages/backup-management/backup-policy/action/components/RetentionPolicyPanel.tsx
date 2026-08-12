import { Form } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import RetentionPolicy from "./RetentionPolicy";

export interface IRetentionPolicyPanelProp {
  backupType: "vm" | "db";
}

export default function RetentionPolicyPanel({
  backupType,
}: IRetentionPolicyPanelProp) {
  const intl = useIntl();
  return (
    <>
      <Form.Item
        name="localRetentionPolicy"
        label={intl.formatMessage({
          id: "local.retention.policy",
          defaultMessage: "Local Retention Policy",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {backupType === "db"
              ? intl.formatMessage({
                  id: "database.local.backup.retention.policy.tooltip",
                  defaultMessage:
                    "### Local Retention Policy\n\nSet the policy how local backup data is retained. The backup data can be retained by quantity or by time (day/week/month).\n\n- By quantity: Retains a minimum of 1 local backup data.\n- By time: Retains a minimum of 1 day of local backup data.\n\nNote: For data generated beyond the retention policy, only the backup records are deleted, which does not affect the data security.\n",
                })
              : intl.formatMessage({
                  id: "vm.local.backup.retention.policy.tooltip",
                  defaultMessage:
                    "### Local Retention Policy\n\nSet the policy how local backup data is retained. The backup data can be retained by quantity or by time (day/week/month).\n\n- By quantity: Retains a minimum of 1 local incremental backup data and 1 local full backup data.\n- By time: Retains a minimum of 1 day of local backup data.\n\nNote: For data generated beyond the retention policy, only the backup records are deleted, which does not affect the data security.\n",
                })}
          </ReactMarkdown>
        }
      >
        <RetentionPolicy retentionType="local" backupType={backupType} />
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {({ getFieldValue }) =>
          getFieldValue("syncRemote") && (
            <Form.Item
              name="remoteRetentionPolicy"
              label={intl.formatMessage({
                id: "remote.storage.retention.policy",
                defaultMessage: "Remote Retention Policy",
              })}
              icon="info"
              iconTooltip={
                <ReactMarkdown>
                  {backupType === "db"
                    ? intl.formatMessage({
                        id: "database.remote.retention.policy.tooltip",
                        defaultMessage:
                          "### Remote Retention Policy\n\nSet the policy how remote backup data is retained. The backup data can be retained permanently, by quantity, or by time (day/week/month).\n\n- Permanently: The remote backup data will not be cleared automatically.\n- By quantity: Retains a minimum of 1 remote backup data.\n- By time: Retains a minimum of 1 day of remote backup data.\n\nNote: For data generated beyond the retention policy, only the backup records are deleted, which does not affect the data security.\n",
                      })
                    : intl.formatMessage({
                        id: "vm.remote.retention.policy.tooltip",
                        defaultMessage:
                          "### Remote Retention Policy\n\nSet the policy how remote backup data is retained. The backup data can be retained permanently, by quantity, or by time (day/week/month).\n\n- Permanently: The remote backup data will not be cleared automatically.\n- By quantity: Retains a minimum of 1 remote incremental backup data and 1 remote full backup data.\n- By time: Retains a minimum of 1 day of remote backup data.\n\nNote: For data generated beyond the retention policy, only the backup records are deleted, which does not affect the data security.\n",
                      })}
                </ReactMarkdown>
              }
            >
              <RetentionPolicy retentionType="remote" backupType={backupType} />
            </Form.Item>
          )
        }
      </Form.Item>
    </>
  );
}
