import { useQuery, gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const schedulerJobList = gql`
  query schedulerJobList {
    schedulerJobList(type: DatabaseBackupJob, limit: 1, replyWithCount: true) {
      total
    }
  }
`;

export default function BackupEntityType() {
  const intl = useIntl();

  const { data, loading } = useQuery(schedulerJobList);
  const canCreateDatabaseJob = !loading && !data?.schedulerJobList?.total;

  return (
    <>
      <Form.Item
        name="entityType"
        label={intl.formatMessage({
          id: "backup.entity.type",
          defaultMessage: "Backup Object Type",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backup.object.type.tooltip",
              defaultMessage:
                "### Backup Object Type\n\nSupports creation of backup plans for virtual machines or platform database.\n\n- Virtual Machine:\n    1. You can add VMs that are under the selected data center, either in running or paused state, and not yet associated with any backup plans.\n    2. The number of selected VMs must not exceed the authorized backup quota.\n    3. Creating a new backup plan for VM with existing backup data does not occupy additional authorized backup quota.\n    4. By default, the entire VM is backed up. However, shared disks and RDM disks attached to VMs are excluded from backup.\n    5. You can set the priority for VM backups, including high and normal.\n- Platform Database:\n    1. You can only create one backup plan for platform database.\n",
            })}
          </ReactMarkdown>
        }
      >
        {canCreateDatabaseJob ? (
          <RadioGroup
            options={[
              {
                value: "vm",
                label: intl.formatMessage({
                  id: "vm",
                  defaultMessage: "Virtual Machine",
                }),
              },
              {
                value: "db",
                label: intl.formatMessage({
                  id: "platform.database",
                  defaultMessage: "Platform Database",
                }),
              },
            ]}
          />
        ) : (
          intl.formatMessage({
            id: "vm",
            defaultMessage: "Virtual Machine",
          })
        )}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.entityType !== curr.entityType}
      >
        {({ getFieldValue }) =>
          getFieldValue("entityType") === "db" && (
            <Form.Item label=" " className={style.radioGroupDescription}>
              {intl.formatMessage({
                id: "backup.type.database.description.only.one.allowed",
                defaultMessage: "You can only create one backup plan for platform database.",
              })}
            </Form.Item>
          )
        }
      </Form.Item>
    </>
  );
}
