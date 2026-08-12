import { Checkbox } from "@zstack/design";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import {
  Form,
  InputDebounce,
  ModalSelect,
  Switch,
  ZSVForm,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { Condition, FormCreateType } from "@zstack/zsphere-types";
import {
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageState,
  PrimaryStorageStatus,
  ResourceQueryType,
} from "@zstack/zsphere-types";
import { formatConditions } from "@zstack/zsphere-utils";
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import Group from "../basic-config/group";
import HaAlertItem from "../basic-config/ha-alert";
import RunInPosition from "../basic-config/run-position";
import { CreateInstanceContext } from "../context";

import styles from "./style.module.less";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  isEdit?: boolean;
  onFinish?: Function;
  source?: any;
}

const { Card } = ZSVForm;
const { Item } = Form;

const STYLE_WIDTH_400 = { width: 400 } as const;

export const fieldsNeedsValidateInBasic = ["name", "count"];

const BasicPart: React.FC<IProps> = ({ form }) => {
  const intl = useIntl();

  const { commonNameRules, validatorUniqName } = useValidator(intl);

  const { currentUser } = usePlatformStore();

  const { zoneUuid, realSource: source } = useContext(CreateInstanceContext);

  const sourceType = source?.__typename;

  useEffect(() => {
    if (["HostVO", "Cluster"].indexOf(source?.__typename) !== -1) {
      form.setFieldsValue({
        runPath: [source],
      });
    }
  }, [source, form]);

  // 处理高可用模式的设置
  useEffect(() => {
    const runPath = form.getFieldValue("runPath");

    if (runPath?.[0] && runPath?.[0]?.__typename) {
      let ha = true;
      if (runPath?.[0]?.__typename === "HostVO") {
        ha = runPath?.[0]?.cluster?.resourceConfigValue?.haVmHaLevel !== "None";
      }
      if (runPath?.[0]?.__typename === "Cluster") {
        ha = runPath?.[0]?.resourceConfigValue?.haVmHaLevel !== "None";
      }

      form.setFieldsValue({ ha });
    }
  }, [form]);

  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.VmInstance,
            source?.__typename === "VmInstance" ? source?.name : undefined,
            intl.formatMessage({
              id: "instance.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <InputDebounce
          className={styles.baseFormItem}
          style={STYLE_WIDTH_400}
        />
      </Item>

      {/* //选择分组,只有admin才有 */}
      {currentUser?.currentIdentity === "Admin" && (
        <Group form={form} zoneUuid={zoneUuid} source={source} />
      )}

      {/* //选择硬件 */}
      <RunInPosition form={form} zoneUuid={zoneUuid} source={source} />

      <Item
        noStyle
        shouldUpdate={(pre, cur) => {
          const preClusterUuid =
            pre.runPath?.[0]?.__typename === "Cluster"
              ? pre.runPath?.[0]?.uuid
              : pre.runPath?.[0]?.cluster?.uuid;

          const curClusterUuid =
            cur.runPath?.[0]?.__typename === "Cluster"
              ? cur.runPath?.[0]?.uuid
              : cur.runPath?.[0]?.cluster?.uuid;

          return (
            preClusterUuid !== curClusterUuid ||
            pre.runPath?.[0]?.__typename !== cur.runPath?.[0]?.__typename
          );
        }}
      >
        {() => {
          const runPath = form.getFieldValue("runPath");
          const { uuid = "", __typename: runPathType = "" } =
            runPath?.[0] ?? {};

          let extraConditions: Condition[] = [];
          let queryType = PrimaryStorageQueryType.Zstack;

          const conditions = [
            { key: "zoneUuid", op: Op.eq, value: zoneUuid },
            { key: "state", op: Op.eq, value: PrimaryStorageState.Enabled },
            { key: "status", op: Op.eq, value: PrimaryStorageStatus.Connected },
          ];

          const addClusterCondition = (clusterUuid: string) => {
            if (clusterUuid) {
              conditions.push({
                key: "cluster.uuid",
                op: Op.eq,
                value: clusterUuid,
              });
            }
          };

          let clusterUuidFromRunPath: string | undefined;

          if (runPath) {
            if (runPathType === "Cluster") {
              clusterUuidFromRunPath = uuid;
            } else if (
              ["Zone"].includes(sourceType) &&
              runPath?.[0]?.cluster?.uuid
            ) {
              clusterUuidFromRunPath = runPath[0].cluster.uuid;
            } else if (["Cluster", "HostVO", "Host"].includes(sourceType)) {
              clusterUuidFromRunPath = runPath?.[0]?.clusterUuid;
            }
          }

          if (clusterUuidFromRunPath) {
            addClusterCondition(clusterUuidFromRunPath);
          }

          const isHostType =
            ["HostVO", "Host"].includes(runPath?.[0]?.__typename) ||
            ["HostVO", "Host"].includes(sourceType);

          if (isHostType) {
            queryType =
              PrimaryStorageQueryType.CreateInstanceDiskOptionFromHostInLocalStorageType;
            const hostUuid = runPath?.[0]?.uuid || source?.uuid;
            extraConditions = [{ key: "hostUuid", op: Op.eq, value: hostUuid }];

            if (
              ["HostVO", "Host"].includes(sourceType) &&
              source?.cluster?.uuid
            ) {
              addClusterCondition(source.cluster.uuid);
            }
          }

          if (sourceType === "Cluster" && source?.uuid) {
            addClusterCondition(source.uuid);
          }

          if (sourceType === "PrimaryStorageVO") {
            return (
              <Item
                label={intl.formatMessage({
                  id: "virtualization.create.instance.store.path",
                  defaultMessage: "Storage Location",
                })}
                name="storePath"
              >
                {source?.name}
              </Item>
            );
          }

          return (
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.store.path",
                defaultMessage: "Storage Location",
              })}
              name="storePath"
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.store.path.select.modal.title",
                  defaultMessage: "Select Storage Location",
                })}
                className={styles.baseFormItem}
                modalWidth={800}
                style={STYLE_WIDTH_400}
                autoDispatch={true}
              >
                <PrimaryStorageList
                  view="select"
                  defaultQuery={{
                    type: queryType,
                    conditions,
                    extraConditions,
                  }}
                />
              </ModalSelect>
            </Item>
          );
        }}
      </Item>

      <Item
        noStyle
        shouldUpdate={(prev, cur) => prev.storePath !== cur.storePath}
      >
        {({ getFieldValue }) => {
          const storePath =
            sourceType === "PrimaryStorageVO"
              ? source
              : getFieldValue("storePath")?.[0];
          return storePath?.type === "Ceph" ? (
            <Item
              name="storagePool"
              label={intl.formatMessage({
                id: "virtualization.storage.pool",
                defaultMessage: "Storage Pool",
              })}
            >
              <ModalSelect
                transformKey="poolName"
                title={intl.formatMessage({
                  id: "virtualization.select.storage.ceph.pool",
                  defaultMessage: "Select a storage pool.",
                })}
                style={STYLE_WIDTH_400}
                autoDispatch={true}
              >
                <CephPoolList
                  view="select"
                  defaultQuery={{
                    conditions: formatConditions({
                      primaryStorageUuid: storePath.uuid,
                      type: "Data",
                    }),
                  }}
                />
              </ModalSelect>
            </Item>
          ) : null;
        }}
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.ha.mode",
          defaultMessage: "HA",
        })}
        name="ha"
        valuePropName="checked"
        icon="info"
        style={{ marginBottom: "12px" }}
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "virtualization.create.instance.ha.mode.tooltip",
              defaultMessage: `### HA

Specifies whether to automatically power on the virtual machine upon shutdown.

1. Off: The VM will not automatically power on upon shutdown.

2. On and with HA policy enabled:

    - VMs that shut down through a scheduled task will automatically power on.
    - VMs that shut down unexpectedly will migrate to another host to power on according to its customized HA policy.

#### Note:

1. You can set a cluster-wide VM HA through Advanced Settings in a cluster. If you set the HA for an individual VM, the individual setting prevails over the cluster setting.
2. When the HA policy is disabled, if you enable this switch, VM HA will take effect after the HA policy is enabled.`,
            })}
          </ReactMarkdown>
        }
        description={<HaAlertItem />}
      >
        <Switch />
      </Item>

      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.poweron",
          defaultMessage: "Power Status",
        })}
        name="strategy"
        valuePropName="checked"
      >
        <FormCheckbox
          label={intl.formatMessage({
            id: "virtualization.create.instance.poweron.checkbox.description",
            defaultMessage: "Power on after creation",
          })}
        />
      </Item>
    </Card>
  );
};

export default React.memo(BasicPart);
