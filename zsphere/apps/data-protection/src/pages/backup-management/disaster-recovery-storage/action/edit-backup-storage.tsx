import { gql, useLazyQuery } from "@apollo/client";
import { Input, Text } from "@zstack/design";
import {
  ZSVForm,
  ModalSelect,
  TextArea,
  Form,
  Tag,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
// import ZoneList from "@zstack/virtualization-resource/src/pages/zone/list";  //待修改
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  ZSVBackupStorage as IZSVBackupStorage,
  Zone as IZone,
  ZoneResponse,
} from "@zstack/zsphere-types/graphql";
import {
  isIP,
  isPort,
  isCidr,
  calculateCIDRRange,
} from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { getBackupStorageType } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

import {
  updateZSVBackupStorageConfig,
  ZSVBackupStorageSystemTagsList,
} from "../../../../gql/disaster-recovery-storage.gql";

import styles from "./style.module.less";

const zoneList = gql`
  query zoneList($conditions: [Condition!], $start: Int, $limit: Int) {
    zoneList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortDirection: asc
    ) {
      total
      list {
        clusterCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        uuid
        name
        description
        state
        isDefault
        createDate
      }
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const { commonNameRules, longDescriptionRules } = useValidator(intl);
  const defaultZoneUuid = useMemo(
    () => selectedList?.[0]?.attachedZoneRefUuids?.[0],
    [selectedList],
  );
  const [form] = Form.useForm();

  const [getZsvBackupStorageSystemTags, { data: tagData }] = useLazyQuery(
    ZSVBackupStorageSystemTagsList,
  );

  const [getZonelist, { data: zoneData }] = useLazyQuery<{
    zoneList: ZoneResponse;
  }>(zoneList);

  const tagInfo = useMemo(
    () => tagData?.ZSVBackupStorageSystemTagsList?.list?.[0],
    [tagData],
  );

  const sortedZones = useMemo(
    () =>
      _.sortBy(zoneData?.zoneList?.list, (zone) =>
        _.indexOf(selectedList?.[0]?.attachedZoneRefUuids, zone.uuid),
      ) || [],
    [selectedList, zoneData],
  );

  const defaultValues = useMemo(() => {
    const {
      name = "",
      description = "",
      sshPort = "",
      hostname = "",
      username = "",
    } = selectedList?.[0] || {};

    return {
      name,
      description,
      sshPort: String(sshPort),
      hostname,
      username,
    };
  }, [selectedList]);

  useEffect(() => {
    if (visible) {
      getZsvBackupStorageSystemTags({
        variables: {
          conditions: [
            {
              key: "resourceUuid",
              value: selectedList?.[0].uuid,
            },
            {
              key: "tag",
              op: "like",
              value: "backup::network::cidr::",
            },
          ],
          fields: ["tag"],
        },
      });
      getZonelist({
        variables: {
          conditions: [
            {
              key: "backupStorage.uuid",
              op: Op.eq,
              value: selectedList?.[0].uuid,
            },
          ],
        },
      });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue(defaultValues);
      if (tagInfo) {
        form.setFieldsValue({ backupNetwork: tagInfo.tag.split("cidr::")[1] });
      }

      if (sortedZones.length > 0) {
        form.setFieldsValue({
          zone: sortedZones?.map((it) => {
            return {
              name: it.name,
              uuid: it.uuid,
              disabledTooltip: intl.formatMessage({
                id: "backup.storage.default.zone.disabled.tooltip",
                defaultMessage: "You cannot delete the default data center.",
              }),
              disabled: defaultZoneUuid === it.uuid,
            };
          }),
        });
      }
    }
  }, [visible, tagInfo, defaultValues, sortedZones, intl]);

  const onOk = async (values: any) => {
    const {
      name,
      description,
      hostname,
      sshPort,
      username,
      zone = [],
      backupNetwork,
    } = values;
    const payload = {
      uuid: selectedList?.[0].uuid,
      name,
      description,
      attachedZoneUuids: _.difference(
        zone?.map((it: { uuid: string }) => it.uuid),
        selectedList?.[0].attachedZoneRefUuids || [],
      ),
      detachedZoneUuids: _.difference(
        selectedList?.[0].attachedZoneRefUuids || [],
        zone?.map((it: { uuid: string }) => it.uuid),
      ),
      cidr: backupNetwork || undefined,
      username,
      sshPort: sshPort ? Number(sshPort) : undefined,
      hostname,
    };

    doAction({
      mutation: updateZSVBackupStorageConfig,
      payload,
      type: "ZSVBackupStorage",
      name: intl.formatMessage({
        id: "change.configuration",
        defaultMessage: "Modify Configuration",
      }),
      total: selectedList.length,
      onFinish: (_result: IActionResult) => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
    setVisible(false);
  };

  const _defaultQuery: any = useMemo(() => {
    return {
      conditions: [
        {
          key: "uuid",
          op: Op.notIn,
          values: selectedList?.[0]?.attachedZoneUuids,
        },
      ],
    };
  }, [selectedList]);

  const zoneColumnConfig = useMemo(() => {
    return [
      {
        title: intl.formatMessage({ id: "name", defaultMessage: "Name" }),
        key: "name",
        render: (value, current: IZone) => {
          return (
            <span className={styles.zoneName}>
              <Text>{current.name}</Text>
              {defaultZoneUuid === current.uuid && (
                <Tag round level="weak" className={styles.tag}>
                  {intl.formatMessage({
                    id: "default",
                    defaultMessage: "Default",
                  })}
                </Tag>
              )}
            </span>
          );
        },
      },
    ];
  }, [sortedZones, intl]);

  const validaBackupNetwork = (_rule: any, value: string | undefined) => {
    if (!value) {
      return Promise.reject(
        intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      );
    }

    if (!isCidr(value)) {
      return Promise.reject(
        intl.formatMessage({
          id: "localBackupServer.field.backup.network.validator.format",
          defaultMessage: "Invalid backup network format.",
        }),
      );
    }

    const [ip, prefix] = value.split("/");
    const { networkAddress } = calculateCIDRRange(value);
    if (ip !== networkAddress) {
      return Promise.reject(
        intl.formatMessage(
          {
            id: "disaster.recovery.storage.field.backup.network.validator.cidr",
            defaultMessage:
              "{wrongCidr} is not a valid CIDR. Do you want to use {correctCidr} instead?",
          },
          {
            wrongCidr: value,
            correctCidr: `${networkAddress}/${prefix}`,
          },
        ),
      );
    }

    return Promise.resolve();
  };

  return (
    <DialogForm
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      onCancel={() => setVisible(false)}
      title={intl.formatMessage({
        id: "change.configuration",
        defaultMessage: "Modify Configuration",
      })}
      resourceName={selectedList?.[0]?.name || ""}
    >
      <Form form={form}>
        <ZSVForm.Card
          title={intl.formatMessage({
            id: "basic.info",
            defaultMessage: "Basic Info",
          })}
        >
          <Form.Item
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            rules={commonNameRules}
          >
            <Input className={styles["width-320"]} />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rules={longDescriptionRules}
          >
            <TextArea
              rows={3}
              className={styles["width-320"]}
              isShowLimit
              limit={2000}
            />
          </Form.Item>
          <Form.Item
            name="backupStorageType"
            label={intl.formatMessage({
              id: "backupStorageType",
              defaultMessage: "Backup Storage Type",
            })}
          >
            {getBackupStorageType(selectedList?.[0]?.backupStorageType, intl)}
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "zone",
              defaultMessage: "Data Center",
            })}
          >
            {selectedList?.[0]?.backupStorageType === "remotebackup" ? (
              <Form.Item
                noStyle
                name="zone"
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: "remote.disaster.backup.storage.form.zone.validator.required",
                      defaultMessage: "Select a data center.",
                    }),
                  },
                ]}
              >
                <ModalSelect
                  style={{ width: 320 }}
                  title={intl.formatMessage({
                    id: "please.select.zone",
                    defaultMessage: "Select a data center.",
                  })}
                  selectType="checkbox"
                  tableLayout="fixed"
                  columnConfig={zoneColumnConfig}
                >
                  {/* <ZoneList view="select" defaultQuery={defaultQuery} /> */}
                </ModalSelect>
              </Form.Item>
            ) : (
              <Form.Item noStyle name="zone" valuePropName="none">
                <Text>{sortedZones?.[0]?.name}</Text>
              </Form.Item>
            )}
          </Form.Item>
        </ZSVForm.Card>

        <ZSVForm.Card
          title={intl.formatMessage({
            id: "config.info",
            defaultMessage: "Configurations",
          })}
        >
          <Form.Item
            name="hostname"
            label={intl.formatMessage({
              id: "backup.server.ip",
              defaultMessage: "Backup Storage IP",
            })}
            rules={[
              {
                required: true,
                validator(rule, value: string) {
                  if (!value) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "remote.backup.storage.form.hostname.validator.required",
                        defaultMessage: "Enter a remote backup server IP.",
                      }),
                    );
                  }

                  if (!isIP(value)) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "remote.backup.storage.form.hostname.validator.validator",
                        defaultMessage: "Invalid IP address.",
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input className={styles["width-240"]} />
          </Form.Item>
          <Form.Item
            name="sshPort"
            label={intl.formatMessage({
              id: "ssh.port",
              defaultMessage: "SSH Port",
            })}
            rules={[
              {
                required: true,
                validator(rule, value: string) {
                  if (!value) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "remote.disaster.backup.storage.form.backup.ssh.port",
                        defaultMessage: "Enter an SSH port.",
                      }),
                    );
                  }

                  if (!isPort(value)) {
                    return Promise.reject(
                      intl.formatMessage({
                        id: "remote.disaster.backup.storage.form.backup.ssh.port.validator",
                        defaultMessage: "Invalid SSH port.",
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input className={styles["width-80"]} />
          </Form.Item>
          <Form.Item
            name="username"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "remote.disaster.backup.storage.form.backup.username",
                  defaultMessage: "Enter a username.",
                }),
              },
            ]}
          >
            <Input className={styles["width-240"]} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "backup.network",
              defaultMessage: "Backup Network",
            })}
            name="backupNetwork"
            tooltip="192.168.1.0/24"
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backup.storage.create.field.network.tooltip",
                  defaultMessage:
                    "### Backup Network\n\n1. The network used for backups. Enter a backup network CIDR.\n2. Data backup is implemented by using the backup network. A dedicated backup network can avoid network congestion and improve transmission efficiency.\n",
                })}
              </ReactMarkdown>
            }
            rules={[{ required: true, validator: validaBackupNetwork }]}
          >
            <Input className={styles["width-240"]} />
          </Form.Item>
        </ZSVForm.Card>
      </Form>
    </DialogForm>
  );
};

export default Action;
