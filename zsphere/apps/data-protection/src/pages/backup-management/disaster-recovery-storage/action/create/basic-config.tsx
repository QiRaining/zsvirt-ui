import { gql, useQuery } from "@apollo/client";
import {
  ZSVForm,
  TextArea,
  Form,
  Input,
  Select,
} from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import type { FC } from "react";
import { useContext, useMemo } from "react";
import { useIntl } from "react-intl";

import BackupStorageCreateContext from "./context";

import styles from "../style.module.less";

const { Card } = ZSVForm;

const getZoneList = gql`
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

const BasicConfig = () => {
  const intl = useIntl();
  const { source = {} } = useContext(BackupStorageCreateContext);
  const { createWay, selectedZone } = source;
  const { commonNameRules, commonDescriptionRules, longDescriptionRules } =
    useValidator(intl);

  const addMethod = useMemo(() => {
    switch (createWay) {
      case "localFromImageStorage":
        return intl.formatMessage({
          id: "local.from.image.storage",
          defaultMessage: "Reuse Image Storage",
        });
      case "localFromHost":
        return intl.formatMessage({
          id: "local.from.host",
          defaultMessage: "Reuse Host",
        });
      case "localCreate":
      case "remoteCreate":
        return intl.formatMessage({
          id: "dedicated.backup.storage",
          defaultMessage: "Dedicated Backup Storage",
        });
    }
  }, [createWay, intl]);

  const ZoneSelect: FC<{
    zone: IZone;
  }> = ({ zone: _zone }) => {
    const { loading, data } = useQuery(getZoneList, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: {
        sortBy: "createDate",
        sortDirection: "asc",
      },
    });

    const zoneList = _.get(data, "zoneList.list", []) as IZone[];

    const options = useMemo(() => {
      const _options = zoneList.map((item) => ({
        label: item.name,
        value: item.uuid,
      }));
      return _options;
    }, [zoneList]);

    return (
      <Form.Item
        label={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
        name="zoneUuid"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "remote.disaster.backup.storage.form.zone.validator.required",
              defaultMessage: "Select a data center.",
            }),
          },
        ]}
        hideRequiredMessage
      >
        <Select width="l" loading={loading} options={options} />
      </Form.Item>
    );
  };
  return (
    <Card
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
    >
      {createWay !== "localFromImageStorage" && (
        <>
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
        </>
      )}
      {createWay === "remoteCreate" ? (
        <ZoneSelect zone={selectedZone} />
      ) : (
        <Form.Item
          name="zoneUuid"
          label={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
          textFormItem
        >
          {selectedZone?.name}
        </Form.Item>
      )}

      <Form.Item
        name="addMethod"
        label={intl.formatMessage({
          id: "addMethod",
          defaultMessage: "Addition Method",
        })}
        rules={commonDescriptionRules}
      >
        {addMethod}
      </Form.Item>
    </Card>
  );
};

export default BasicConfig;
