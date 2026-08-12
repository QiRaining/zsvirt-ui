import { useLazyQuery } from "@apollo/client";
import { getClusterAttachablePrimaryStorageTypes } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import {
  Form,
  Input,
  Select,
  TextArea,
  useAuth,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { PrimaryStorageType, ResourceQueryType } from "@zstack/zsphere-types";
import { includes, find, sumBy } from "lodash-es";
import type { FC } from "react";
import React, { useContext, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  PrimaryStorageResourceContext,
  PrimaryStorageTypeContext,
  SharedResourceDataContext,
} from "./contexts/storageContexts";
import type {
  IPrimaryStorageResourceContext,
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
  ISubPrimaryStorageType,
} from "./type";

import styles from "./style.module.less";

const { Card } = ZSVForm;

const formItemNoMarginStyle = { marginBottom: 0 } as const;
const selectTypeStyle = { width: 240, marginRight: 4 } as const;
const selectSubTypeStyle = { width: 160 } as const;

interface IProps {
  form: any;
}

const BasicConfig: FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { resource, zone, setSelectedRowKeys, setCluster, initCluster } =
    useContext(PrimaryStorageResourceContext) as IPrimaryStorageResourceContext;
  const { setDiskInfo, setHostDataInTable } = useContext(
    SharedResourceDataContext,
  ) as ISharedResourceDataContext;
  const {
    primaryStorageType,
    setPrimaryStorageType,
    subPrimaryStorageType,
    setSubPrimaryStorageType,
  } = useContext(PrimaryStorageTypeContext) as IPrimaryStorageTypeContext;
  const [cluserAttachablePsTypes, setCluserAttachablePsTypes] = useState<
    string[]
  >([]);

  const { commonNameRules, longDescriptionRules, validatorUniqName } =
    useValidator(intl);

  const hasNfsAuth = hasAuth({
    type: "block",
    resource: "primary.storage",
    authKey: "NFS",
  });

  const [getPrimaryStorageTypes] = useLazyQuery(
    getClusterAttachablePrimaryStorageTypes,
    {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const types =
          data?.getClusterAttachablePrimaryStorageTypes?.types ?? [];
        setCluserAttachablePsTypes(types);
      },
    },
  );

  useEffect(() => {
    getPrimaryStorageTypes({
      variables: {
        clusterUuid: resource?.uuid,
      },
    });
  }, [resource]);

  const { primaryStorageTypes, disabledPrimaryStorageType } = useMemo(() => {
    const _primaryStorageTypes = [
      {
        label: intl.formatMessage({
          id: "virtualization.SAN.Storage",
          defaultMessage: "SAN Storage",
        }),
        value: PrimaryStorageType.SharedBlock,
        disabled: false,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.distributedStorage",
          defaultMessage: "Distributed Storage",
        }),
        value: PrimaryStorageType.Ceph,
        disabled: false,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.LocalStorage",
          defaultMessage: "Local Storage",
        }),
        value: PrimaryStorageType.LocalStorage,
        disabled: false,
      },
    ];

    if (hasNfsAuth) {
      _primaryStorageTypes.push({
        label: intl.formatMessage({
          id: "virtualization.NFS",
          defaultMessage: "NFS",
        }),
        value: PrimaryStorageType.NFS,
        disabled: false,
      });
    }

    if (
      includes(
        ["IscsiServer", "FiberChannelStorage", "NvmeTarget"],
        resource?.__typename,
      )
    ) {
      _primaryStorageTypes.forEach((item) => {
        item.disabled = !includes([PrimaryStorageType.SharedBlock], item.value);
      });
    }

    if (cluserAttachablePsTypes?.length > 0) {
      _primaryStorageTypes.forEach((item) => {
        item.disabled = !includes(cluserAttachablePsTypes, item.value);
      });

      const psinfo = find(_primaryStorageTypes, (it) => !it?.disabled);

      if (psinfo) {
        setPrimaryStorageType(psinfo?.value as PrimaryStorageType);
        setTimeout(() => {
          form.setFields([
            {
              name: "type",
              value: psinfo?.value,
            },
          ]);
        }, 0);
      } else {
        form.setFields([
          {
            name: "type",
            value: null,
          },
          {
            name: "subType",
            value: null,
          },
        ]);
      }
    }

    const enabledCount: number = sumBy(_primaryStorageTypes, (it) => {
      if (it?.disabled) {
        return 0;
      }
      return 1;
    });

    return {
      primaryStorageTypes: _primaryStorageTypes,
      disabledPrimaryStorageType: enabledCount === 1,
    };
  }, [intl, resource, cluserAttachablePsTypes]);

  const { subPrimaryStorageTypes } = useMemo(() => {
    const _subPrimaryStorageTypes = [
      {
        label: "Ceph",
        value: "ZCE",
        disabled: false,
      },
    ];

    if (cluserAttachablePsTypes?.length > 0) {
      _subPrimaryStorageTypes.forEach((item) => {
        item.disabled = !includes(
          cluserAttachablePsTypes,
          PrimaryStorageType.Ceph,
        );
      });
    }

    return {
      subPrimaryStorageTypes: _subPrimaryStorageTypes,
    };
  }, [cluserAttachablePsTypes]);

  const handleTypeChange = (value: PrimaryStorageType) => {
    setPrimaryStorageType(value);
    form.setFields([
      {
        name: "type",
        value,
      },
    ]);

    if (value === PrimaryStorageType.Ceph) {
      setSubPrimaryStorageType("ZCE");
      form.setFields([
        {
          name: "subType",
          value: "ZCE",
        },
      ]);
    } else {
      setSubPrimaryStorageType("");
      form.setFields([
        {
          name: "subType",
          value: null,
        },
      ]);
    }

    if (!initCluster.uuid) {
      setCluster([]);
    }

    if (value === PrimaryStorageType.NFS) {
      form.setFields([
        {
          name: "url",
          value: "",
        },
      ]);
    }

    setHostDataInTable([]);
    setSelectedRowKeys([]);
    setDiskInfo([]);
  };

  // 保留 ZCE 作为兼容后端的内部值，界面统一展示为 Ceph。
  const handleSubTypeChange = (value: ISubPrimaryStorageType) => {
    setSubPrimaryStorageType(value);
    form.setFields([
      {
        name: "subType",
        value,
      },
    ]);
  };

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Form.Item
        name="name"
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        validateTrigger="onBlur"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.PrimaryStorage,
            undefined,
            intl.formatMessage({
              id: "primaryStorage.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <Input className={styles["width-400"]} />
      </Form.Item>
      <Form.Item
        name="description"
        rules={longDescriptionRules}
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
      >
        <TextArea className={styles["width-400"]} isShowLimit limit={2000} />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: "type",
          defaultMessage: "Type",
        })}
        icon="info"
        iconTooltip={
          <ReactMarkdown>
            {includes(
              ["IscsiServer", "FiberChannelStorage", "NvmeTarget"],
              resource?.__typename,
            )
              ? intl.formatMessage({
                  id: "virtualization.primaryStorage.create.field.san.type.iconTooltip",
                  defaultMessage: `### Type

Uses LUN devices for SAN storage and can work with standalone image storage. You can add one or more LUN devices. Note that you need to enter the unique disk identifier, such as UUID, WWN, and WWID.`,
                })
              : intl.formatMessage({
                  id: "virtualization.primaryStorage.create.field.type.iconTooltip",
                  defaultMessage: `### Type

Data storage includes the following types:

1. Local Storage: Uses the local disk directory on the host as data storage and can work with standalone image storage. The total capacity of a local storage is the sum of each host directory capacity.

2. NFS: Uses network file systems for storage, and can work with standalone image storage. The NFS directory is automatically mounted to all hosts.

3. Distributed Storage:
    - Ceph: Uses distributed block storage for storage and can work with distributed image storage in the same cluster.

4. SAN Storage: Uses LUN devices for storage and can work with standalone image storage. You can add one or more LUN devices. Note that you need to enter the unique disk identifier, such as UUID, WWN, and WWID.`,
                })}
          </ReactMarkdown>
        }
        className={styles.typeItem}
      >
        <Form.Item style={formItemNoMarginStyle} name="type">
          <Select
            style={selectTypeStyle}
            value={primaryStorageType}
            disabled={disabledPrimaryStorageType}
            onChange={handleTypeChange}
          >
            {primaryStorageTypes.map(({ value, label, disabled }) => (
              <Select.Option key={value} value={value} disabled={disabled}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {primaryStorageType === PrimaryStorageType.Ceph && (
          <Form.Item
            style={formItemNoMarginStyle}
            name="subType"
            shouldUpdate={(pre, cur) => pre.type !== cur.type}
          >
            <Select
              style={selectSubTypeStyle}
              value={subPrimaryStorageType}
              onChange={handleSubTypeChange}
            >
              {subPrimaryStorageTypes.map(({ value, label, disabled }) => (
                <Select.Option key={value} value={value} disabled={disabled}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form.Item>
      <Form.Item
        name="zoneUuid"
        label={intl.formatMessage({
          id: "virtualization.zone",
          defaultMessage: "Data Center",
        })}
      >
        {zone?.name}
      </Form.Item>
    </Card>
  );
};

export default BasicConfig;
