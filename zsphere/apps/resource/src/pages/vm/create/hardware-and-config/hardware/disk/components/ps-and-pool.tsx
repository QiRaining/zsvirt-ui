import { Text } from "@zstack/design";
import { primaryStorageForCreateResourceList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import CephPoolList from "@zstack/virtualization-resource/src/pages/ceph-primary-storage-pool/list";
import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import { ModalSelect, Form } from "@zstack/zsphere-components";
import type { Condition } from "@zstack/zsphere-types";
import {
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageState,
  PrimaryStorageStatus,
} from "@zstack/zsphere-types";
import { formatConditions } from "@zstack/zsphere-utils";
import { includes } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import styles from "../style.module.less";

interface IProps {
  // form: any;
  isEdit?: boolean;
  source?: any;
  zoneUuid?: string;
  index: number;
}

const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;

const PSWithPool: React.FC<IProps> = ({
  index,
  _isEdit = false,
  zoneUuid = "",
  source,
}) => {
  const intl = useIntl();

  const sourceType = source?.__typename;

  const validateEmpty = () => {
    return {
      required: true,
      validateTrigger: "onChange",
      validator() {
        return Promise.resolve();
      },
    };
  };

  const form = Form.useFormInstance();

  const renderStoragePoolEle = (primaryStorageUuid?: string) => {
    const storePath = form.getFieldValue(`storePath-${index}`)?.[0];
    if (storePath?.type === "Ceph" || source?.type === "Ceph") {
      return (
        <Form.Item
          name={`volumeStoragePool-${index}`}
          label={intl.formatMessage({
            id: "virtualization.storage.pool",
            defaultMessage: "Storage Pool",
          })}
          dependencies={[`storePath-${index}`]}
        >
          <ModalSelect
            transformKey="poolName"
            title={intl.formatMessage({
              id: "virtualization.select.storage.ceph.pool",
              defaultMessage: "Select a storage pool.",
            })}
            style={STYLE_WIDTH_200}
            autoDispatch={true}
          >
            <CephPoolList
              view="select"
              defaultQuery={{
                conditions: formatConditions({
                  primaryStorageUuid: primaryStorageUuid || storePath?.uuid,
                  type: "Data",
                }),
              }}
            />
          </ModalSelect>
        </Form.Item>
      );
    }
    return null;
  };

  return (
    <Item
      noStyle
      shouldUpdate={(pre, cur) => {
        // 使用值比较而非引用比较，避免无限循环
        return (
          pre.runPath?.[0]?.uuid !== cur.runPath?.[0]?.uuid ||
          pre[`diskCreateType-${index}`] !== cur[`diskCreateType-${index}`]
        );
      }}
    >
      {() => {
        const type = form?.getFieldValue(`diskCreateType-${index}`);
        const runPath = form.getFieldValue("runPath");

        if (type === "created" || type === "rdm") {
          return;
        }

        //如果是来自PS入口，则存储位置直接显示对应文字
        if (sourceType === "PrimaryStorageVO") {
          return (
            <>
              <Item
                label={intl.formatMessage({
                  id: "virtualization.create.instance.store.path",
                  defaultMessage: "Storage Location",
                })}
                name={`storePath-${index}`}
                initialValue={[source]}
              >
                {source?.name}
              </Item>
              <Item noStyle>{renderStoragePoolEle(source?.uuid)}</Item>
            </>
          );
        }

        // 注意：移除了原来的 isFieldTouched 检查，因为它会在每次渲染时清空刚选择的值
        // 如果需要在 runPath 变化时清空 storePath，应该使用 useEffect 或 dependencies 来处理

        const conditions = [
          {
            key: "zoneUuid",
            op: Op.eq,
            value: zoneUuid,
          },
          {
            key: "state",
            op: Op.eq,
            value: PrimaryStorageState.Enabled,
          },
          {
            key: "status",
            op: Op.eq,
            value: PrimaryStorageStatus.Connected,
          },
        ];

        //const runPathType = runPath?.[0]?.__typename ?? ''

        const { uuid = "", __typename: runPathType = "" } = runPath?.[0] ?? {};

        let clusterUuid = "";
        let extraConditions: Condition[] = [];
        // , 对于cluster/host入口进入且选中的是本地存储，使用率展示需要做区分
        let queryType = PrimaryStorageQueryType.Zstack;

        const hostValues = new Set(["HostVO", "Host"]);
        if (hostValues.has(runPath?.[0]?.__typename)) {
          queryType =
            PrimaryStorageQueryType.CreateInstanceDiskOptionFromHostInLocalStorageType;
          extraConditions = [
            { key: "hostUuid", op: Op.eq, value: runPath?.[0]?.uuid },
          ];
        }

        if (runPath && includes(["Zone", "Image"], sourceType)) {
          clusterUuid =
            runPathType === "Cluster" ? uuid : runPath?.[0]?.cluster?.uuid;
        }

        if (
          runPath &&
          includes(["Cluster", "HostVO", "Host", "VmInstance"], sourceType)
        ) {
          clusterUuid =
            runPathType === "Cluster" ? uuid : runPath?.[0]?.clusterUuid;
        }

        if (sourceType === "Cluster") {
          clusterUuid = source?.uuid;
        }

        if (sourceType === "HostVO") {
          clusterUuid = source?.cluster?.uuid;
        }

        if (clusterUuid && clusterUuid !== "") {
          conditions.push({
            key: "cluster.uuid",
            op: Op.eq,
            value: clusterUuid,
          });
        }

        if (sourceType === "VmInstance") {
          const renderStoreEle = [];
          if (form.getFieldValue(`storePath-${index}`)?.[0]?.name) {
            renderStoreEle.push(
              <Item
                label={intl.formatMessage({
                  id: "virtualization.create.instance.store.path",
                  defaultMessage: "Storage Location",
                })}
                name={`storePath-${index}`}
              >
                {form.getFieldValue(`storePath-${index}`)?.[0]?.name}
              </Item>,
            );
          }

          if (form.getFieldValue(`volumeStoragePool-${index}`)) {
            renderStoreEle.push(
              <Item
                label={intl.formatMessage({
                  id: "virtualization.storage.pool",
                  defaultMessage: "Storage Pool",
                })}
                name={`volumeStoragePool-${index}`}
              >
                <div style={STYLE_WIDTH_200}>
                  <Text
                    value={form.getFieldValue(`volumeStoragePool-${index}`)}
                  />
                </div>
              </Item>,
            );
          }

          if (renderStoreEle.length > 0) {
            return renderStoreEle;
          }
        }

        //other
        return (
          <>
            <Item
              label={intl.formatMessage({
                id: "virtualization.create.instance.store.path",
                defaultMessage: "Storage Location",
              })}
              name={`storePath-${index}`}
              required={sourceType === "VmInstance" && type === "image"}
              rules={sourceType === "VmInstance" ? [validateEmpty] : []}
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "virtualization.create.instance.store.path.select.modal.title",
                  defaultMessage: "Select Storage Location",
                })}
                className={styles.baseFormItem}
                modalWidth={800}
                style={STYLE_WIDTH_200}
                autoDispatch={true}
              >
                <PrimaryStorageList
                  view="select"
                  gql={primaryStorageForCreateResourceList}
                  defaultQuery={{
                    conditions,
                    type: queryType,
                    extraConditions,
                  }}
                />
              </ModalSelect>
            </Item>
            <Item
              noStyle
              shouldUpdate={(prev, cur) =>
                prev[`storePath-${index}`] !== cur[`storePath-${index}`]
              }
            >
              {() => renderStoragePoolEle()}
            </Item>
          </>
        );
      }}
    </Item>
  );
};

export default React.memo(PSWithPool);
