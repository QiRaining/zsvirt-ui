import { gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  ModalSelect,
  ZSVForm,
  Switch,
  Form,
  Input,
} from "@zstack/zsphere-components";
import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import { BackupStorageType, Op } from "@zstack/zsphere-types";
import type { FreeHardDiskInfo } from "@zstack/zsphere-types/graphql";
import {
  Encrypt,
  isCidr,
  isIP,
  isIPV4,
  isPath,
  isPoolName,
  isPort,
  parseNumber,
  reject,
} from "@zstack/zsphere-utils";
import { cloneDeep as _cloneDeep, pick as _pick } from "lodash-es";
import type { FC } from "react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { AddWay } from "zsv_resource/backup-storage/create/disk-config";
import DiskList from "zsv_shared/free-disk/list";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import { ErrorField } from "../../utils/error-field";
import { useValidator as useBSValidator } from "../../utils/use-validator";
import type { IWizardFormProps } from "../interface";
import AutoWay from "./auto-way";
import { useInitialValues } from "./hooks/use-initial-values";

import style from "./style.module.less";

const { Card } = ZSVForm;

interface ICreateBackupStorageProps extends IWizardFormProps {
  onBsSelectionChange?: (hasSelectedBs: boolean) => void;
  onBsAddModeChange?: (mode: "manual" | "auto") => void;
}

const addImageStoreBackupStorage = gql`
  mutation addImageStoreBackupStorage(
    $input: AddImageStoreBackupStorageInput!
  ) {
    addImageStoreBackupStorage(input: $input) {
      actionId
    }
  }
`;

const addCephBackupStorage = gql`
  mutation addCephBackupStorage($input: AddCephBackupStorageInput!) {
    addCephBackupStorage(input: $input) {
      actionId
    }
  }
`;

const testHostConnection = gql`
  mutation testConnection($input: TestConnectionInput!) {
    testConnection(input: $input) {
      actionId
    }
  }
`;

/**
 * 2025-5-15
 * 新增 自动获取 相关逻辑（其实就是从wizardInfo中获取）
 *
 */

export const BackupStorageCreator: FC<ICreateBackupStorageProps> = forwardRef(
  (props, ref) => {
    const { handleTaskFinished, onBsSelectionChange, onBsAddModeChange } =
      props;
    const intl = useIntl();
    const doAction = useAction();
    const [form] = Form.useForm();
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [selectDiskVisible, setSelectDiskVisible] = useState<boolean>(false);
    const [addWay, setAddWay] = useState<AddWay>(AddWay.FreeDisk);
    const freeDiskRef = useRef<FreeHardDiskInfo[]>([]);
    const [disabled, setDisabled] = useState<boolean>(false);
    const [selectFreeDiskDisabled, setSelectFreeDiskDisabled] =
      useState<boolean>(true);
    const [selectedMonList, setSelectedMonList] = useState<any[]>([]);

    const { zoneName, zoneUuid } = useWizardStore(
      useShallow((state) => ({
        zoneName: state.zoneName,
        zoneUuid: state.zoneUuid,
      })),
    );
    const wizardInfo = useWizardStore(useShallow((state) => state.wizardInfo));
    const handleSelectedMonListChange = useCallback(
      (monList: any[]) => {
        setSelectedMonList(monList);
        onBsSelectionChange?.(monList.length > 0);
      },
      [onBsSelectionChange],
    );
    const initialValues = useInitialValues(wizardInfo?.storageInfo);
    const queryDiskListConditions = useMemo(() => {
      const { username, password, sshPort, hostname } = form.getFieldsValue();
      return {
        conditions: [
          { key: "username", op: Op.eq, value: username },
          { key: "password", op: Op.eq, value: password },
          { key: "sshPort", op: Op.eq, value: Number(sshPort) },
          { key: "hostName", op: Op.ne, value: hostname },
        ],
      };
    }, [form.getFieldsValue()]);

    const selectDiskHandler = (freeDisk: FreeHardDiskInfo[]) => {
      if (freeDisk?.[0]?.withPartition) {
        setConfirmVisible(true);
        freeDiskRef.current = freeDisk;
      } else {
        setSelectDiskVisible(false);
        form.setFieldsValue({ freeDisk });
      }
    };

    const confirmOk = () => {
      setConfirmVisible(false);
      setSelectDiskVisible(false);
      form.setFieldsValue({ freeDisk: freeDiskRef.current });
    };

    const testConnection = async () => {
      form.setFieldsValue({ testConnError: "" });
      try {
        await form.validateFields(["name", "sshPort", "username", "password"]);
      } catch {
        return;
      }
      const hostname = form.getFieldValue("hostname");
      if (!hostname || !isIPV4(hostname)) {
        form.validateFields(["hostname"]);
        return;
      }
      try {
        await validatorBSHostname(zoneUuid, hostname);
      } catch {
        form.validateFields(["hostname"]);
      }
      setDisabled(true);
      const { sshPort, username, password } = form.getFieldsValue([
        "password",
        "hostname",
        "sshPort",
        "username",
      ]);

      const payload = {
        hostName: hostname,
        sshPort: Number(sshPort),
        username,
        password: Encrypt(password),
      };

      doAction({
        mutation: testHostConnection,
        payload,
        name: intl.formatMessage({
          id: "test.connection",
          defaultMessage: "Test Connection",
        }),
        total: 1,
        onFinish: (result) => {
          setDisabled(false);
          if (result?.inventory?.success) {
            setSelectFreeDiskDisabled(false);
          } else {
            form.setFieldsValue({
              testConnError: intl.formatMessage({
                id: "add.backup.storage.error.connection.fail",
                defaultMessage: "Connection Failed. Check your configurations.",
              }),
            });
          }
        },
      });
    };

    const handleValuesChange = (changedValues: any, values: any) => {
      if (
        values.testConnError &&
        ("password" in changedValues ||
          "hostname" in changedValues ||
          "sshPort" in changedValues ||
          "username" in changedValues)
      ) {
        form.setFieldsValue({ testConnError: "" });
      }
    };

    const addWayDesc = useMemo(() => {
      return addWay === AddWay.FreeDisk
        ? intl.formatMessage({
            id: "addWay.description",
            defaultMessage:
              'This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.',
          })
        : null;
    }, [addWay, intl]);

    const { isRequired, commonNameRules } = useValidator(intl);

    const initialBasicValues = useInitialValues(wizardInfo?.storageInfo);

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
    const hasSetInitial = useRef(false);
    //只在第一次渲染时赋值
    useEffect(() => {
      if (initialValues && !hasSetInitial.current) {
        form.setFieldsValue(initialValues);
        hasSetInitial.current = true;
      }
    }, [initialValues, form]);
    const { validatorBSHostname } = useBSValidator();

    // 在组件挂载时通知父组件当前的模式
    useEffect(() => {
      onBsAddModeChange?.(initialValues.bsAddMode as "auto" | "manual");
    }, [initialValues.bsAddMode, onBsAddModeChange]);

    const handleFinish = (values: any) => {
      const params = _cloneDeep(values);
      let payload;

      if (params.bsAddMode === "auto" && selectedMonList.length > 0) {
        //先不考虑zbs，后续再加上
        payload = {
          name: params?.name,
          zoneUuid,
        };
        const monUrls =
          selectedMonList.map((item) => {
            const { username, password, ip, port } = item;
            const monUrl = `${username}:${password}@${ip}:${port}`;
            return monUrl;
          }) || [];

        payload = {
          ...payload,
          poolName: params.poolName,
          monUrls,
        };

        doAction({
          // mutation: isZBS ? addImageStoreBackupStorage : addCephBackupStorage,
          mutation: addCephBackupStorage,
          payload,
          name: intl.formatMessage({
            id: "add.backupStorage",
            defaultMessage: "Add Image Storage",
          }),
          total: 1,
          type: "BackupStorage",
          onFinish: handleTaskFinished,
        });
      } else {
        const systemTags = [];
        switch (params.type) {
          case BackupStorageType.ImageStoreBackupStorage:
            payload = {
              ..._pick(params, [
                "name",
                "description",
                "type",
                "hostname",
                "url",
                "importImages",
                "sshPort",
                "username",
                "password",
                "systemTags",
                "blobUploadConcurrency",
                "blobDownloadConcurrency",
              ]),
            };
            if (params?.syncImageNetwork) {
              systemTags.push(
                `sync::network::cidr::${params.syncImageNetwork}`,
              );
            }
            payload = {
              ...payload,
              zoneUuid,
              blockDevicePath: params?.freeDisk && params?.freeDisk?.[0]?.name,
            };
            break;
          case BackupStorageType.Ceph:
            payload = {
              zoneUuid,
              ..._pick(params, [
                "name",
                "description",
                "type",
                "poolName",
                "monUrls",
                "systemTags",
                "blobUploadConcurrency",
                "blobDownloadConcurrency",
              ]),
            };
            payload.monUrls = [
              `${params.monitorUsername}:${params.monitorPassword}@${params.monitorIp}:${params.monitorSshPort}`,
            ];
            break;
          default:
            payload = params;
            break;
        }
        if (params?.dataNetwork) {
          systemTags.push(
            `backupStorage::data::network::cidr::${params.dataNetwork}`,
          );
        }

        // 高级设置
        if (params?.reservedCapacity) {
          const { number = 1, unit = "GB" } = params?.reservedCapacity ?? {};
          payload.reservedCapacity = parseNumber(number, unit)?.toString();
        }

        if (params?.blobUploadConcurrency) {
          payload.blobUploadConcurrency =
            String(params?.blobUploadConcurrency) ||
            initialBasicValues?.blobUploadConcurrency;
        }

        if (params?.blobDownloadConcurrency) {
          payload.blobDownloadConcurrency =
            String(params?.blobDownloadConcurrency) ||
            initialBasicValues?.blobDownloadConcurrency;
        }

        let fn;
        if (params?.type === "Ceph") {
          fn = addCephBackupStorage;
        } else {
          fn = addImageStoreBackupStorage;
        }

        doAction({
          mutation: fn,
          payload: { ...payload, systemTags },
          name: intl.formatMessage({
            id: "add.backupStorage",
            defaultMessage: "Add Image Storage",
          }),
          total: 1,
          type: "BackupStorage",
          onFinish: handleTaskFinished,
        });
      }
    };

    const ImageStoreForm = () => {
      return (
        <>
          <Form.Item
            name="hostname"
            label={intl.formatMessage({
              id: "backupStorage.hostname",
              defaultMessage: "Image Storage IP",
            })}
            validateTrigger="onBlur"
            required
            rules={[
              {
                async validator(rule: any, value: string) {
                  return validatorBSHostname(zoneUuid, value);
                },
              },
            ]}
          >
            <Input className={style["width-320"]} />
          </Form.Item>
          <Form.Item
            name="sshPort"
            label={intl.formatMessage({
              id: "sshPort",
              defaultMessage: "SSH Port",
            })}
            validateTrigger="onBlur"
            required
            rules={[
              {
                validator(rule, value: string) {
                  if (!value) {
                    return reject(
                      intl.formatMessage({
                        id: "global.field.validator.input.required",
                        defaultMessage: "This field is required.",
                      }),
                    );
                  }
                  if (!isPort(value)) {
                    return reject(
                      intl.formatMessage({
                        id: "backupStorage.field.sshPort.validator.format",
                        defaultMessage: "Invalid SSH port",
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input className={style["width-320"]} />
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
                  id: "global.field.validator.input.required",
                  defaultMessage: "This field is required.",
                }),
              },
            ]}
          >
            <Input className={style["width-320"]} />
          </Form.Item>
          <Form.Item
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
          >
            <Form.Item
              noStyle
              name="password"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "global.field.validator.input.required",
                    defaultMessage: "This field is required.",
                  }),
                },
              ]}
            >
              <Input.Password className={style["width-235"]} />
            </Form.Item>
            <Button
              type="button"
              className={style["test-connect"]}
              disabled={disabled}
              onClick={async () => {
                testConnection();
              }}
              style={{ display: "inline-block" }}
            >
              {intl.formatMessage({
                id: "test.connect",
                defaultMessage: "Test Connection",
              })}
            </Button>
            <Form.Item noStyle name="testConnError">
              <ErrorField className={style["error-field"]} />
            </Form.Item>
          </Form.Item>
        </>
      );
    };

    const CephStoreForm = () => {
      return (
        <>
          <Form.Item
            label={intl.formatMessage({
              id: "monitorNode",
              defaultMessage: "Monitoring Node",
            })}
          />

          <div className={style["management-node-container"]}>
            <Form.Item
              name="monitorIp"
              label={intl.formatMessage({
                id: "monNodeManageIP",
                defaultMessage: "Monitoring Node IP",
              })}
              rules={[isRequired(), { validator: validIp }]}
              labelWidth={148}
            >
              <Input className={style["width-320"]} />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: "sshPort",
                defaultMessage: "SSH Port",
              })}
              name="monitorSshPort"
              rules={[isRequired()]}
              labelWidth={148}
            >
              <Input className={style["width-320"]} />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: "username",
                defaultMessage: "Username",
              })}
              name="monitorUsername"
              rules={[isRequired()]}
              labelWidth={148}
            >
              <Input className={style["width-320"]} />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              name="monitorPassword"
              rules={[isRequired()]}
              labelWidth={148}
            >
              <Input.Password className={style["width-320"]} />
            </Form.Item>
          </div>
          <Form.Item
            name="poolName"
            label={intl.formatMessage({
              id: "backupStorage.pool",
              defaultMessage: "Image Storage Pool",
            })}
            validateTrigger="onBlur"
            rules={[
              {
                validator(rule, value: string) {
                  if (value && !isPoolName(value)) {
                    return reject(
                      intl.formatMessage({
                        id: "backupStorage.field.poolName.validator.format",
                        defaultMessage: "Invalid backup storage pool. ",
                      }),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            icon="info"
            iconTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backupStorage.field.backupStoragePool.tooltip",
                  defaultMessage: `### Image Storage Pool
1. You can specify a storage pool for the  Distributed Storage  backup storage to store images. If not specified, the Cloud creates one automatically.
2. To specify a storage pool, make sure that a storage pool is already available in the  Distributed Storage  cluster. Then you can specify the UUID of the storage pool.`,
                })}
              </ReactMarkdown>
            }
          >
            <Input className={style["width-320"]} />
          </Form.Item>
        </>
      );
    };

    return (
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={initialBasicValues}
        onValuesChange={handleValuesChange}
      >
        {wizardInfo?.storageInfo?.monList?.length > 0 && (
          <Card
            title={intl.formatMessage({
              id: "wizard.bs.add.mode",
              defaultMessage: "Add Image Storage",
            })}
          >
            <Form.Item
              shouldUpdate={true}
              label={intl.formatMessage({
                id: "wizard.bs.add.mode",
                defaultMessage: "Add Image Storage",
              })}
              name="bsAddMode"
            >
              <RadioGroup
                options={[
                  {
                    value: "auto",
                    label: intl.formatMessage({
                      id: "wizard.bs.add.mode.auto",
                      defaultMessage: "Add Automatically",
                    }),
                  },
                  {
                    value: "manual",
                    label: intl.formatMessage({
                      id: "wizard.bs.add.mode.manual",
                      defaultMessage: "Add Manually",
                    }),
                  },
                ]}
                onValueChange={(value) => {
                  onBsAddModeChange?.(value);
                }}
              />
            </Form.Item>
          </Card>
        )}

        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.bsAddMode !== cur.bsAddMode}
        >
          {({ getFieldValue }) => {
            const bsAddMode = getFieldValue("bsAddMode");
            return bsAddMode === "auto" ? (
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
                      id: "backupStorage.type",
                      defaultMessage: "Type",
                    })}
                  >
                    {intl.formatMessage({
                      id: "backupStorage.type.ceph",
                      defaultMessage: "Distributed Image Storage",
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
                <AutoWay onSelectedBsChange={handleSelectedMonListChange} />
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
                      id: "backupStorage.type",
                      defaultMessage: "Type",
                    })}
                    icon="info"
                    iconTooltip={
                      <ReactMarkdown>
                        {intl.formatMessage({
                          id: "backupStorage.field.type.tooltip",
                          defaultMessage: `### Type

- Standalone Image Storage: Store image files through image slices and support incremental storage.

- Distributed Image Storage: Store image files through distributed block storage.`,
                        })}
                      </ReactMarkdown>
                    }
                  >
                    <RadioGroup
                      onValueChange={(value) => {
                        form.setFieldsValue({ type: value });
                      }}
                      options={[
                        {
                          value: BackupStorageType.ImageStoreBackupStorage,
                          label: intl.formatMessage({
                            id: "backupStorage.type.imageStore",
                            defaultMessage: "Standalone Image Storage",
                          }),
                        },
                        {
                          value: BackupStorageType.Ceph,
                          label: intl.formatMessage({
                            id: "backupStorage.type.ceph",
                            defaultMessage: "Distributed Image Storage",
                          }),
                        },
                      ]}
                    />
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
                    noStyle
                    shouldUpdate={(prev, curr) => prev.type !== curr.type}
                  >
                    {(formInstance1) => {
                      switch (formInstance1.getFieldValue("type")) {
                        case BackupStorageType.ImageStoreBackupStorage:
                          return ImageStoreForm;
                        case BackupStorageType.Ceph:
                          return CephStoreForm;
                        default:
                          break;
                      }
                    }}
                  </Form.Item>
                </Card>
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) => prev.type !== curr.type}
                >
                  {(formInstance1) => {
                    return formInstance1.getFieldValue("type") ===
                      BackupStorageType.ImageStoreBackupStorage ? (
                      <Card
                        title={intl.formatMessage({
                          id: "diskConfig",
                          defaultMessage: "Disk Configuration",
                        })}
                      >
                        <Form.Item
                          name="addWay"
                          label={intl.formatMessage({
                            id: "addWay",
                            defaultMessage: "Addition Method",
                          })}
                          description={addWayDesc}
                          icon="info"
                          iconTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "virtualization.primaryStorage.field.addWay.tooltip",
                                defaultMessage: `### Addition Method

- Free Disk: Uses the unmounted or unpartitioned disks on hosts as the storage. The system will automatically format the selected host disks and create a mount path.
- Local Directory: Uses the local directory on hosts as the storage.`,
                              })}
                            </ReactMarkdown>
                          }
                        >
                          <RadioGroup
                            onValueChange={(value) => {
                              setAddWay(value as AddWay);
                            }}
                            options={[
                              {
                                value: AddWay.FreeDisk,
                                label: intl.formatMessage({
                                  id: "free.disk",
                                  defaultMessage: "Free Disk",
                                }),
                              },
                              {
                                value: AddWay.LocalDir,
                                label: intl.formatMessage({
                                  id: "local.directory",
                                  defaultMessage: "Local Directory",
                                }),
                              },
                            ]}
                          />
                        </Form.Item>
                        <Form.Item
                          noStyle
                          shouldUpdate={(prev, next) =>
                            prev.addWay !== next.addWay
                          }
                        >
                          {(formInstance2) => {
                            return formInstance2.getFieldValue("addWay") ===
                              AddWay.FreeDisk ? (
                              <>
                                <Form.Item
                                  name="freeDisk"
                                  label={intl.formatMessage({
                                    id: "free.disk",
                                    defaultMessage: "Free Disk",
                                  })}
                                  rules={[isRequired(IIsRequiredType.select)]}
                                >
                                  {selectFreeDiskDisabled ? (
                                    <Tooltip
                                      title={intl.formatMessage({
                                        id: "select.free.disk.disabled",
                                        defaultMessage:
                                          "Test connection first. After a successful connection test, you can select free disks.",
                                      })}
                                    >
                                      <span>
                                        <ModalSelect
                                          className={style["width-320"]}
                                          title={intl.formatMessage({
                                            id: "select.free.disk",
                                            defaultMessage: "Select Free Disk",
                                          })}
                                          disabledItem={selectFreeDiskDisabled}
                                        >
                                          <DiskList
                                            view="select"
                                            defaultQuery={
                                              queryDiskListConditions
                                            }
                                          />
                                        </ModalSelect>
                                      </span>
                                    </Tooltip>
                                  ) : (
                                    <ModalSelect
                                      title={intl.formatMessage({
                                        id: "select.free.disk",
                                        defaultMessage: "Select Free Disk",
                                      })}
                                      visible={selectDiskVisible}
                                      setVisible={setSelectDiskVisible}
                                      selectType="radio"
                                      className={style["width-320"]}
                                      alertMessage={intl.formatMessage({
                                        id: "select.disk.alert",
                                        defaultMessage:
                                          "This configuration will format the selected disks and completely erase all partitions, file systems, and data on the disk.",
                                      })}
                                      alertClosable={false}
                                      alertType="error"
                                      renderFooter={({
                                        onCancel,
                                        selectedList,
                                      }) => {
                                        return (
                                          <>
                                            <Button
                                              variant="link"
                                              onClick={() => {
                                                onCancel();
                                              }}
                                            >
                                              {intl.formatMessage({
                                                id: "cancel",
                                                defaultMessage: "Cancel",
                                              })}
                                            </Button>
                                            <Button
                                              onClick={() => {
                                                selectDiskHandler(selectedList);
                                              }}
                                              variant="primary"
                                              style={{ marginRight: 8 }}
                                              disabled={!selectedList.length}
                                            >
                                              {intl.formatMessage({
                                                id: "ok",
                                                defaultMessage: "OK",
                                              })}
                                            </Button>
                                          </>
                                        );
                                      }}
                                    >
                                      <DiskList
                                        view="select"
                                        defaultQuery={queryDiskListConditions}
                                      />
                                    </ModalSelect>
                                  )}
                                </Form.Item>
                              </>
                            ) : null;
                          }}
                        </Form.Item>

                        <Form.Item
                          name="url"
                          label={intl.formatMessage({
                            id: "mountPath",
                            defaultMessage: "Mount Path",
                          })}
                          required
                          validateTrigger="onBlur"
                          rules={[
                            {
                              validator(rule, value: string) {
                                if (!value) {
                                  return Promise.reject(
                                    intl.formatMessage({
                                      id: "global.field.validator.input.required",
                                      defaultMessage: "This field is required.",
                                    }),
                                  );
                                }

                                if (!isPath(value)) {
                                  return Promise.reject(
                                    intl.formatMessage({
                                      id: "backupStorage.field.url.validator.format",
                                      defaultMessage: "Invalid mount path.",
                                    }),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          icon="info"
                          iconTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "backupStorage.field.url.tooltip",
                                defaultMessage: `### Mount Path
It is recommended to mount a large capacity for this URL. Ensure that you enter the absolute path of this directory.`,
                              })}
                            </ReactMarkdown>
                          }
                          tooltip={intl.formatMessage({
                            id: "virtualization.backupStorage.field.local.url.hover",
                            defaultMessage: "/vms_is",
                          })}
                          description={
                            <div className={style.caption}>
                              <Icon type="alert-triangle-fill" color="danger" />
                              <ReactMarkdown>
                                {intl.formatMessage({
                                  id: "backupStorage.field.url.description",
                                  defaultMessage:
                                    "System directories such as /, /dev, /proc, /sys, /usr/bin, and /bin cannot be used. Using system directories might cause hosts unable to work properly.",
                                })}
                              </ReactMarkdown>
                            </div>
                          }
                        >
                          <Input className={style["width-320"]} />
                        </Form.Item>

                        <Form.Item
                          name="importImages"
                          valuePropName="checked"
                          label={intl.formatMessage({
                            id: "getAvailableImage",
                            defaultMessage: "Retrieve Existing Image",
                          })}
                          auth={{
                            authKey: "get.available.image",
                            resource: "backup.storage",
                          }}
                        >
                          <Switch />
                        </Form.Item>

                        <Form.Item
                          name="syncImageNetwork"
                          label={intl.formatMessage({
                            id: "imageSyncNetwork",
                            defaultMessage: "Image Sync Network",
                          })}
                          auth={{
                            authKey: "image.sync.network",
                            resource: "backup.storage",
                          }}
                          validateTrigger="onBlur"
                          rules={[
                            {
                              validator(rule, value: string) {
                                if (value && !isCidr(value)) {
                                  return Promise.reject(
                                    intl.formatMessage({
                                      id: "backupStorage.field.imageSyncNetwork.validator.format",
                                      defaultMessage: "Invalid image synchronization network",
                                    }),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          icon="info"
                          iconTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "backupStorage.field.imageSyncNetwork.tooltip",
                                defaultMessage: `### Image Sync Network

1. If you deployed a dedicated network for image synchronization, enter its CIDR.
2. If not set, a management network will be used by default for image synchronization.
3. If you set an image synchronization network for both a source image storage and a destination image storage, only the image synchronization network of the destination image storage works.`,
                              })}
                            </ReactMarkdown>
                          }
                        >
                          <Input className={style["width-240"]} />
                        </Form.Item>

                        <Form.Item
                          style={{ marginBottom: 10 }}
                          name="dataNetwork"
                          label={intl.formatMessage({
                            id: "dataNetwork",
                            defaultMessage: "Data Network",
                          })}
                          validateTrigger="onBlur"
                          rules={[
                            {
                              validator(rule, value: string) {
                                if (value && !isCidr(value)) {
                                  return Promise.reject(
                                    intl.formatMessage({
                                      id: "backupStorage.field.dataNetwork.validator.format",
                                      defaultMessage: "Invalid data network",
                                    }),
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                          icon="info"
                          iconTooltip={
                            <ReactMarkdown>
                              {intl.formatMessage({
                                id: "backupStorage.field.dataNetwork.tooltip",
                                defaultMessage: `### Data Network

A data network is a type of network where compute nodes and image storage can communicate with each other.

1. An independent data network can be used to avoid network congestion and improve transfer efficiencies.

2. If not set, management networks will be used by default.`,
                              })}
                            </ReactMarkdown>
                          }
                        >
                          <Input className={style["width-240"]} />
                        </Form.Item>

                        <DialogWeakP1
                          visible={confirmVisible}
                          setVisible={setConfirmVisible}
                          type="warning"
                          title={intl.formatMessage({
                            id: "confirm.format.disk",
                            defaultMessage: `Format Selected Disk?`,
                          })}
                          onConfirm={() => confirmOk()}
                          description={
                            <div>
                              {intl.formatMessage({
                                id: "confirm.format.disk.content",
                                defaultMessage:
                                  "Formatting selected disks will erase all partitions, file systems, and data on the disk. Proceed with caution.",
                              })}
                            </div>
                          }
                        />
                      </Card>
                    ) : null;
                  }}
                </Form.Item>
              </>
            );
          }}
        </Form.Item>
      </Form>
    );
  },
);
