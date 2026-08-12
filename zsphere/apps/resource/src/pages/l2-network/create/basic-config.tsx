import { useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { clusterSummary } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { Form, Auth } from "@zstack/zsphere-components";
import {
  InputDebounce,
  ModalSelect,
  Radio,
  TextArea,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import type { FormCreateType, Condition } from "@zstack/zsphere-types";
import { Op, ResourceQueryType } from "@zstack/zsphere-types";
import type {
  Zone as IZone,
  Cluster as ICluster,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const MODAL_SELECT_STYLE = { width: 400 } as const;
const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  zone?: IZone;
  cluster?: ICluster;
}

const { Item } = Form;

const BasicPart: React.FC<IProps> = ({ form, zone, cluster }) => {
  const intl = useIntl();
  const [clusterType, setClusterType] = useState("normal");
  const [visible, setVisible] = useState(false);

  const {
    commonNameRules,
    longDescriptionRules,
    isRequired,
    validatorUniqName,
  } = useValidator(intl);

  const clusterDefaultQuery = useMemo(() => {
    const conditions: Condition[] = [
      {
        key: "state",
        op: Op.eq,
        value: "Enabled",
      },
      {
        key: "hypervisorType",
        op: clusterType === "normal" ? Op.notIn : Op.in,
        values: ["baremetal"],
      },
      {
        key: "zoneUuid",
        op: Op.eq,
        value: zone?.uuid,
      },
    ];
    return {
      conditions,
    };
  }, [zone, clusterType]);

  const [getClusterSummary, { data }] = useLazyQuery(clusterSummary, {
    fetchPolicy: "no-cache",
    variables: {
      conditions: [
        {
          key: "state",
          op: Op.eq,
          value: "Enabled",
        },
        {
          key: "zoneUuid",
          op: Op.eq,
          value: zone?.uuid,
        },
      ],
    },
  });

  useEffect(() => {
    if (visible) {
      getClusterSummary();
    }
  }, [visible, getClusterSummary]);

  const changeCluster = (values: string[]) => {
    form.setFields([
      {
        name: "physicalNicList",
        value: undefined,
      },
      {
        name: "physicalNicnNameList",
        value: undefined,
      },
      {
        name: "bondUuid",
        value: undefined,
      },
      {
        name: "bond",
        value: undefined,
      },
      {
        name: "clusterUuids",
        value: values,
      },
    ]);
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>
        <div className={styles.rect} />
        <div className={styles.text}>
          {intl.formatMessage({ id: "basic.info", defaultMessage: "Basic Info" })}
        </div>
      </div>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={[
          ...commonNameRules,
          validatorUniqName(
            ResourceQueryType.L2Network,
            undefined,
            intl.formatMessage({
              id: "l2Network.field.name.validator.duplicate",
              defaultMessage: "This name is already in use. Enter a different name.",
            }),
            true,
          ),
        ]}
      >
        <InputDebounce width={400} className={styles.baseFormItem} />
      </Item>

      <Item
        name="description"
        label={intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        })}
        rules={longDescriptionRules}
      >
        <TextArea
          rows={3}
          isShowLimit
          maxLength={2000}
          className={styles.baseFormItem}
        />
      </Item>
      <Item
        name="zone"
        label={intl.formatMessage({
          id: "virtualization.zone",
          defaultMessage: "Data Center",
        })}
      >
        {zone?.name}
      </Item>

      <Item
        name="clusterUuids"
        rules={[isRequired(IIsRequiredType.select)]}
        label={intl.formatMessage({
          id: "cluster",
          defaultMessage: "Cluster",
        })}
        className={styles["cluster-name"]}
      >
        {cluster?.name ? (
          <span>
            <Text>{cluster.name}</Text>
          </span>
        ) : (
          <ModalSelect
            style={MODAL_SELECT_STYLE}
            listClassName="list-height-240"
            selectType="checkbox"
            visible={visible}
            setVisible={setVisible}
            onChange={changeCluster}
            modalHeader={
              <Radio.Group
                value={clusterType}
                onChange={(e) => setClusterType(e.target.value)}
                style={RADIO_GROUP_STYLE}
              >
                <Radio.Button value="normal">
                  {intl.formatMessage(
                    {
                      id: "cluster.count",
                      defaultMessage: "Cluster ({clusterCount})",
                    },
                    {
                      clusterCount: data?.clusterSummary?.clusterCount ?? 0,
                    },
                  )}
                </Radio.Button>
                <Auth
                  resource="virtualization.bm.cluster"
                  authKey="list"
                  type="view"
                >
                  <Radio.Button value="baremetal">
                    {intl.formatMessage(
                      {
                        id: "baremetal.cluster.count",
                        defaultMessage: "Bare Metal Cluster ({clusterCount})",
                      },
                      {
                        clusterCount: data?.clusterSummary?.baremetalCount ?? 0,
                      },
                    )}
                  </Radio.Button>
                </Auth>
              </Radio.Group>
            }
            title={intl.formatMessage({
              id: "l2network.field.add.cluster",
              defaultMessage: "Add Cluster",
            })}
            label={intl.formatMessage({
              id: "l2network.field.add.cluster",
              defaultMessage: "Add Cluster",
            })}
          >
            <ClusterList
              view="select.l2.network.attach"
              defaultQuery={clusterDefaultQuery}
            />
          </ModalSelect>
        )}
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
