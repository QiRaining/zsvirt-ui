import type { DocumentNode } from "@apollo/client";
import { gql, useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import {
  Switch,
  ZSVForm,
  Form,
  Input,
  Select,
} from "@zstack/zsphere-components";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import {
  HostState,
  HostStatus,
  Op,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import { genUuid, isCidr, isIP, isPoolName } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import type { FC } from "react";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import {
  PrimaryStorageTypeContext,
  SharedResourceDataContext,
  PrimaryStorageProvider,
  getPrimaryStorageType,
} from "zsv_resource/primary-storage/create";
import type {
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
  ISubPrimaryStorageType,
} from "zsv_resource/primary-storage/create";
import { useShallow } from "zustand/react/shallow";

import type { IWizardFormProps } from "../../../src/components/interface";
import { useWizardStore } from "../../../src/layouts/wizard-container/wizard-container";
import AutoWay from "./auto-way";
import { useInitialValues } from "./hooks/use-initial-values";

import style from "./style.module.less";

const LocalStorageFreediskInfo = React.lazy(
  () => import("zsv_resource/primary-storage/LocalStorageFreediskInfo"),
);

const { Card } = ZSVForm;

const createLocalStoragePrimaryStorage = gql`
  mutation createLocalStoragePrimaryStorage(
    $input: CreateLocalPrimaryStorageInput!
  ) {
    createLocalStoragePrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const createCephPrimaryStorage = gql`
  mutation createCephPrimaryStorage($input: CreateCephPrimaryStorageInput!) {
    createCephPrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const HOST_LIST = gql`
  query hostList($conditions: [Condition!]) {
    hostList(
      conditions: $conditions
      start: 0
      limit: 20
      replyWithCount: true
    ) {
      list {
        uuid
        name
        state
        status
        managementIp
        hypervisorType
        username
        sshPort
        cluster {
          uuid
          name
        }
        zone {
          uuid
          name
        }
      }
      total
    }
  }
`;

interface IPrimaryStorageCreatorProps extends IWizardFormProps {
  onMonSelectionChange?: (hasSelectedMons: boolean) => void;
  onPsAddModeChange?: (mode: "manual" | "auto") => void;
}

/**
 * 2025-5-15
 * 新增 自动获取 相关逻辑（其实就是从wizardInfo中获取）
 *
 */
export const PrimaryStorageCreatorWrapper: React.FC<IPrimaryStorageCreatorProps> =
  forwardRef((props, ref) => {
    return (
      <PrimaryStorageProvider>
        <PrimaryStorageCreator {...props} ref={ref} />
      </PrimaryStorageProvider>
    );
  });

export const PrimaryStorageCreator: FC<IPrimaryStorageCreatorProps> =
  forwardRef((props, ref) => {
    const { handleTaskFinished, onMonSelectionChange, onPsAddModeChange } =
      props;
    const intl = useIntl();
    const [form] = Form.useForm();
    const { isRequired, commonNameRules } = useValidator(intl);
    const doAction = useAction();
    const wizardInfo = useWizardStore(useShallow((state) => state.wizardInfo));
    const initialValues = useInitialValues(wizardInfo?.storageInfo);
    const [selectedMonList, setSelectedMonList] = useState<any[]>([]);

    const { setHostDataInTable } = useContext(
      SharedResourceDataContext,
    ) as ISharedResourceDataContext;

    const handleSelectedMonListChange = useCallback(
      (monList: any[]) => {
        setSelectedMonList(monList);
        onMonSelectionChange?.(monList.length > 0);
      },
      [onMonSelectionChange],
    );

    const submit = async () => {
      await form.validateFields();
      form.submit();
    };

    useImperativeHandle(ref, () => ({
      submit,
    }));

    const validIp = async (_rule: any, value: string) => {
      if (isIP(value)) {
        return;
      }
      throw intl.formatMessage({
        id: "monitoringNode.field.ip.validator.format",
        defaultMessage: "Invalid IP address.",
      });
    };

    const primaryStorageTypes = useMemo(() => {
      const _primaryStorageTypes = [
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

      return _primaryStorageTypes;
    }, [intl]);

    const { subPrimaryStorageTypes } = useMemo(() => {
      const _subPrimaryStorageTypes = [
        {
          label: "Ceph",
          value: "ZCE",
          disabled: false,
        },
      ];

      return {
        subPrimaryStorageTypes: _subPrimaryStorageTypes,
      };
    }, []);

    const {
      primaryStorageType,
      setPrimaryStorageType,
      subPrimaryStorageType,
      setSubPrimaryStorageType,
    } = useContext(PrimaryStorageTypeContext) as IPrimaryStorageTypeContext;
    const { clusterUuid, clusterName, zoneName, zoneUuid } = useWizardStore(
      useShallow((state) => ({
        clusterUuid: state.clusterUuid,
        clusterName: state.clusterName,
        zoneName: state.zoneName,
        zoneUuid: state.zoneUuid,
      })),
    );

    const [_queryHostList, { data }] = useLazyQuery(HOST_LIST, {
      onCompleted: (_data: any) => {
        const _hostList = _data?.hostList?.list;
        setHostDataInTable(_hostList);
      },
      errorPolicy: "ignore",
    });

    const _host = useMemo(() => {
      return data?.hostList?.list?.[0];
    }, [data]);

    useEffect(() => {
      if (clusterUuid && zoneUuid) {
        _queryHostList({
          variables: {
            conditions: [
              {
                key: "zoneUuid",
                op: Op.eq,
                value: zoneUuid,
              },
              {
                key: "clusterUuid",
                op: Op.eq,
                value: clusterUuid,
              },
              { key: "state", op: Op.eq, value: HostState.Enabled },
              { key: "status", op: Op.eq, value: HostStatus.Connected },
              { key: "hypervisorType", op: Op.ne, value: "ESX" },
            ],
          },
        });
      }
    }, [clusterUuid, zoneUuid]);
    const hasSetInitial = useRef(false);
    //只在第一次渲染时赋值
    useEffect(() => {
      if (initialValues && !hasSetInitial.current) {
        form.setFieldsValue(initialValues);
        hasSetInitial.current = true;
      }
    }, [initialValues, form]);

    // 在组件挂载时通知父组件当前的模式
    useEffect(() => {
      onPsAddModeChange?.(initialValues.psAddMode as "auto" | "manual");
    }, [initialValues.psAddMode, onPsAddModeChange]);

    const handleFinish = (values: any) => {
      const realPrimaryStorageType = getPrimaryStorageType(
        primaryStorageType,
        subPrimaryStorageType,
      );

      const params = { ...initialValues, ..._.cloneDeep(values) };
      const {
        cidr,
        mountOptions,
        forceWipe,
        thinProvision,
        cephx = true,
        token,
        monitorIp,
        monitorSshPort,
        monitorUsername,
        monitorPassword,
        _freeDisk,
      } = params;

      let payload;

      if (params.psAddMode === "auto" && selectedMonList.length > 0) {
        payload = {
          name: params?.name,
          clusterUuid,
          zoneUuid,
        };
        const systemTags = [];
        if (wizardInfo?.storageInfo?.storagePublicNetwork) {
          systemTags.push(
            `primaryStorage::gateway::cidr::${wizardInfo?.storageInfo?.storagePublicNetwork}`,
          );
        }
        const monUrls =
          selectedMonList?.map((item) => {
            const { username, password, ip, port } = item;
            const monUrl = `${username}:${password}@${ip}:${port}`;
            return monUrl;
          }) || [];

        payload = {
          ...payload,
          monUrls,
          systemTags,
          rootVolumePoolName: params.poolName,
          dataVolumePoolName: params.poolName,
          imageCachePoolName: params.poolName,
        };
        doAction({
          mutation: createCephPrimaryStorage,
          payload,
          name: intl.formatMessage({
            id: "add.primaryStorage",
            defaultMessage: "Add Data Storage",
          }),
          total: 1,
          type: "PrimaryStorageVO",
          onFinish: handleTaskFinished,
        });
      } else {
        const systemTags = [];

        const hostUuids: string[] = [];
        const blockDevicePaths: string[] = [];

        _.forEach(params, (value, key) => {
          if (_.startsWith(key, "disk-")) {
            const uuid = key.substring(5); // 去掉前缀"disk-"

            if (value?.length) {
              hostUuids.push(uuid);
              blockDevicePaths.push(value?.[0]?.name);
            }
          }
        });

        if (cidr) {
          systemTags.push(`primaryStorage::gateway::cidr::${cidr}`);
        }
        if (
          primaryStorageType === PrimaryStorageType.NFS &&
          !_.isUndefined(mountOptions)
        ) {
          systemTags.push(`nfs::mount::options::${mountOptions}`);
        }
        if (forceWipe) {
          systemTags.push("forceWipe");
        }
        if (thinProvision) {
          systemTags.push(
            "primaryStorageVolumeProvisioningStrategy::ThinProvisioning",
          );
        }
        if (!cephx) {
          systemTags.push("ceph::nocephx");
        }
        if (token) {
          systemTags.push(`ceph::thirdPartyPlatform::${token}`);
        }

        const monUrls = [
          `${monitorUsername}:${monitorPassword}@${monitorIp}:${monitorSshPort}`,
        ];

        if (
          _.includes([PrimaryStorageType.LocalStorage], realPrimaryStorageType)
        ) {
          payload = {
            systemTags,
            clusterUuid,
            blockDevicePaths,
            hostUuids,
            zoneUuid,
            ..._.pick(params, ["type", "name", "description", "url"]),
          };
        }

        if (
          _.includes([`${PrimaryStorageType.Ceph}-ZCE`], realPrimaryStorageType)
        ) {
          payload = {
            systemTags,
            clusterUuid,
            zoneUuid,
            monUrls,
            ..._.pick(params, [
              "type",
              "name",
              "description",
              "imageCachePoolName",
            ]),
          };

          if (params?.dataVolumePoolName) {
            payload = {
              ...payload,
              dataVolumePoolName: params?.dataVolumePoolName,
              rootVolumePoolName: params?.dataVolumePoolName,
            };
          } else {
            systemTags.push(
              `ceph::customInitializationPoolName::pool-${genUuid()}`,
            );
          }
        }

        const typeMap = new Map([
          [PrimaryStorageType.LocalStorage, createLocalStoragePrimaryStorage],
          [`${PrimaryStorageType.Ceph}-ZCE`, createCephPrimaryStorage],
        ]);

        const mutation: DocumentNode =
          typeMap.get(realPrimaryStorageType) ||
          createLocalStoragePrimaryStorage;

        doAction({
          mutation,
          payload,
          name: intl.formatMessage({
            id: "add.data.storage",
            defaultMessage: "Add Data Storage",
          }),
          total: 1,
          type: "PrimaryStorageVO",
          onFinish: handleTaskFinished,
        });
      }
    };

    return (
      <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
        {wizardInfo?.hostList?.length > 0 && (
          <Card
            title={intl.formatMessage({
              id: "wizard.ps.add.mode",
              defaultMessage: "Add Data Storage",
            })}
          >
            <Form.Item
              shouldUpdate={true}
              label={intl.formatMessage({
                id: "wizard.ps.add.mode",
                defaultMessage: "Add Data Storage",
              })}
              name="psAddMode"
            >
              <RadioGroup
                options={[
                  {
                    value: "auto",
                    label: intl.formatMessage({
                      id: "wizard.ps.add.mode.auto",
                      defaultMessage: "Add Automatically",
                    }),
                  },
                  {
                    value: "manual",
                    label: intl.formatMessage({
                      id: "wizard.ps.add.mode.manual",
                      defaultMessage: "Add Manually",
                    }),
                  },
                ]}
                onValueChange={(value) => {
                  onPsAddModeChange?.(value);
                }}
              />
            </Form.Item>
          </Card>
        )}

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.psAddMode !== cur.psAddMode}
        >
          {({ getFieldValue }) => {
            const psAddMode = getFieldValue("psAddMode");
            return psAddMode === "auto" ? (
              <>
                <Card
                  title={intl.formatMessage({
                    id: "basic.info",
                    defaultMessage: "Basic Info",
                  })}
                >
                  <Form.Item
                    label={intl.formatMessage({
                      id: "name",
                      defaultMessage: "Name",
                    })}
                    name="name"
                    rules={commonNameRules}
                  >
                    <Input className={style["width-320"]} />
                  </Form.Item>
                  <Form.Item
                    name="type"
                    label={intl.formatMessage({
                      id: "primaryStorage.type",
                      defaultMessage: "Type",
                    })}
                    rules={commonNameRules}
                  >
                    {intl.formatMessage({
                      id: "primaryStorage.type.ceph",
                      defaultMessage: "Distributed Storage",
                    })}
                  </Form.Item>
                  <Form.Item
                    name="poolName"
                    label={intl.formatMessage({
                      id: "storage.pool",
                      defaultMessage: "Storage Pool",
                    })}
                    rules={[isRequired()]}
                  >
                    <Input className={style["width-320"]} />
                  </Form.Item>
                </Card>
                <AutoWay
                  onSelectedMonListChange={handleSelectedMonListChange}
                />
              </>
            ) : (
              <>
                <Card
                  title={intl.formatMessage({
                    id: "basic.info",
                    defaultMessage: "Basic Info",
                  })}
                >
                  <Form.Item
                    shouldUpdate={true}
                    label={intl.formatMessage({
                      id: "name",
                      defaultMessage: "Name",
                    })}
                    name="name"
                    rules={commonNameRules}
                  >
                    <Input className="width-320" />
                  </Form.Item>

                  <Form.Item
                    label={intl.formatMessage({
                      id: "type",
                      defaultMessage: "Type",
                    })}
                    className={style.typeItem}
                  >
                    <Form.Item name="type" style={{ marginBottom: 0 }}>
                      <Select
                        style={{ width: 240, marginRight: 4 }}
                        defaultValue={primaryStorageType}
                        onChange={(value) =>
                          setPrimaryStorageType(value as PrimaryStorageType)
                        }
                      >
                        {primaryStorageTypes.map(
                          ({ value, label, disabled }) => {
                            return (
                              <Select.Option
                                key={value}
                                value={value}
                                disabled={disabled}
                              >
                                {label}
                              </Select.Option>
                            );
                          },
                        )}
                      </Select>
                    </Form.Item>
                    {primaryStorageType === PrimaryStorageType.Ceph && (
                      <Form.Item
                        style={{ marginBottom: 0 }}
                        name="subType"
                        shouldUpdate={(pre, cur) => pre.type !== cur.type}
                      >
                        <Select
                          style={{ width: 160 }}
                          defaultValue={subPrimaryStorageType}
                          onChange={(value) =>
                            setSubPrimaryStorageType(
                              value as ISubPrimaryStorageType,
                            )
                          }
                        >
                          {subPrimaryStorageTypes.map(
                            ({ value, label, disabled }) => (
                              <Select.Option
                                key={value}
                                value={value}
                                disabled={disabled}
                              >
                                {label}
                              </Select.Option>
                            ),
                          )}
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
                    {zoneName}
                  </Form.Item>
                </Card>
                <Card
                  title={intl.formatMessage({
                    id: "config.info",
                    defaultMessage: "Configurations",
                  })}
                >
                  <Form.Item
                    name="clusterUuid"
                    label={intl.formatMessage({
                      id: "associatedCluster",
                      defaultMessage: "Cluster",
                    })}
                  >
                    {clusterName}
                  </Form.Item>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.type !== curr.type}
                  >
                    {() => {
                      const realPrimaryStorageType = getPrimaryStorageType(
                        primaryStorageType,
                        subPrimaryStorageType,
                      );

                      switch (realPrimaryStorageType) {
                        case PrimaryStorageType.LocalStorage:
                          return <LocalStorageFreediskInfo form={form} />;
                        case `${PrimaryStorageType.Ceph}-ZCE`:
                          return (
                            <>
                              <Form.Item
                                name="cephx"
                                label={intl.formatMessage({
                                  id: "virtualization.cephx",
                                  defaultMessage: "Key Authentication",
                                })}
                                icon="info"
                                iconTooltip={{
                                  title: (
                                    <ReactMarkdown>
                                      {intl.formatMessage({
                                        id: "virtualization.primaryStorage.field.cephx.tooltip",
                                        defaultMessage: `###  Key Authentication

1. If the network of the storage node and compute node is relatively secure, you can turn off this option to avoid authentication failure.
2. Make sure that the authentication option on the distributed storage side is consistent with this option. If the authentication is disabled on the distributed storage side but enabled here, you might fail to create virtual machines, and vice versa.`,
                                      })}
                                    </ReactMarkdown>
                                  ),
                                }}
                                valuePropName="checked"
                                textFormItem
                              >
                                <Switch defaultChecked />
                              </Form.Item>

                              <Form.Item
                                label={intl.formatMessage({
                                  id: "monitorNode",
                                  defaultMessage: "Monitoring Node",
                                })}
                              />

                              <div
                                className={style["management-node-container"]}
                              >
                                <Form.Item
                                  labelWidth={148}
                                  name="monitorIp"
                                  label={intl.formatMessage({
                                    id: "monNodeManageIP",
                                    defaultMessage: "Monitoring Node IP",
                                  })}
                                  rules={[isRequired(), { validator: validIp }]}
                                >
                                  <Input className="width-320" />
                                </Form.Item>
                                <Form.Item
                                  labelWidth={148}
                                  label={intl.formatMessage({
                                    id: "sshPort",
                                    defaultMessage: "SSH Port",
                                  })}
                                  name="monitorSshPort"
                                  rules={[isRequired()]}
                                >
                                  <Input className="width-320" />
                                </Form.Item>
                                <Form.Item
                                  labelWidth={148}
                                  label={intl.formatMessage({
                                    id: "username",
                                    defaultMessage: "Username",
                                  })}
                                  name="monitorUsername"
                                  rules={[isRequired()]}
                                >
                                  <Input className="width-320" />
                                </Form.Item>
                                <Form.Item
                                  labelWidth={148}
                                  label={intl.formatMessage({
                                    id: "password",
                                    defaultMessage: "Password",
                                  })}
                                  name="monitorPassword"
                                  rules={[isRequired()]}
                                >
                                  <Input.Password className="width-320" />
                                </Form.Item>
                              </div>

                              <Form.Item
                                name="imageCachePoolName"
                                label={intl.formatMessage({
                                  id: "imageCachePool",
                                  defaultMessage: "Image Cache Pool",
                                })}
                                rules={[
                                  () => ({
                                    validator(rule, values) {
                                      if (values === "" || isPoolName(values)) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        Error(
                                          intl.formatMessage({
                                            id: "virtualization.primaryStorage.field.imageCachePool.validator.format",
                                            defaultMessage:
                                              "Invalid image cache pool.",
                                          }),
                                        ),
                                      );
                                    },
                                  }),
                                ]}
                                icon="info"
                                iconTooltip={
                                  <ReactMarkdown>
                                    {intl.formatMessage({
                                      id: "virtualization.cephStoragePool.field.imageCachePool.tooltip",
                                      defaultMessage: `### Image Cache Pool
1. You can specify a storage pool for image caches. If you do not specify a storage pool, the system creates one automatically.
2. If you specify a storage pool, make sure that a storage pool is already available in the distributed storage cluster. Then you can specify the UUID of a storage pool.`,
                                    })}
                                  </ReactMarkdown>
                                }
                              >
                                <Input className={style["width-320"]} />
                              </Form.Item>

                              <Form.Item
                                name="dataVolumePoolName"
                                label={intl.formatMessage({
                                  id: "storagePool",
                                  defaultMessage: "Storage Pool",
                                })}
                                rules={[
                                  () => ({
                                    validator(rule, values) {
                                      if (values === "" || isPoolName(values)) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        Error(
                                          intl.formatMessage({
                                            id: "virtualization.primaryStorage.field.dataVolumePool.validator.format",
                                            defaultMessage:
                                              "Invalid data disk pool.",
                                          }),
                                        ),
                                      );
                                    },
                                  }),
                                ]}
                                icon="info"
                                iconTooltip={
                                  <ReactMarkdown>
                                    {intl.formatMessage({
                                      id: "virtualization.cephStoragePool.field.dataVolumePool.tooltip",
                                      defaultMessage: `### Storage Pool

1. You can specify a storage pool for data disks . If you do not specify a storage pool, the system creates one automatically.
2. If you specify a storage pool, make sure that a storage pool is already available in the distributed storage cluster. Then you can specify the UUID of a storage pool.`,
                                    })}
                                  </ReactMarkdown>
                                }
                              >
                                <Input className={style["width-320"]} />
                              </Form.Item>

                              <Form.Item
                                name="cidr"
                                label={intl.formatMessage({
                                  id: "storageNetwork",
                                  defaultMessage: "Storage Network",
                                })}
                                icon="info"
                                iconTooltip={{
                                  title: (
                                    <ReactMarkdown>
                                      {intl.formatMessage({
                                        id: "virtualization.primaryStorage.field.storageNetwork.tooltip",
                                        defaultMessage: `### Storage Network

1. The storage network specified for the shared storage. The system uses the storage network to check the health status of virtual machines.
2. We recommend that you plan an independent storage network in advance to avoid potential risks. If you do not have an independent storage network, enter the network address according to your actual needs.`,
                                      })}
                                    </ReactMarkdown>
                                  ),
                                }}
                                tooltip={intl.formatMessage({
                                  id: "virtualization.primaryStorage.field.storageNetwork.hover",
                                  defaultMessage: "Example: 192.168.1.0/24",
                                })}
                                rules={[
                                  isRequired(),
                                  () => ({
                                    validator(rule, values) {
                                      if (
                                        _.isUndefined(values) ||
                                        values === "" ||
                                        isCidr(values)
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        Error(
                                          intl.formatMessage({
                                            id: "virtualization.primaryStorage.field.storageNetwork.validator.format",
                                            defaultMessage: "Invalid CIDR.",
                                          }),
                                        ),
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <Input className={style["width-320"]} />
                              </Form.Item>
                            </>
                          );
                        default:
                          return null;
                      }
                    }}
                  </Form.Item>
                </Card>
              </>
            );
          }}
        </Form.Item>
      </Form>
    );
  });

PrimaryStorageCreator.displayName = "PrimaryStorageCreator";
