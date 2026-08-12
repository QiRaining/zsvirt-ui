import { gql, useQuery } from "@apollo/client";
import type { ISelectOption } from "@zstack/zsphere-components";
import { Form, Select } from "@zstack/zsphere-components";
import type { Zone } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IZoneSelect {
  initialZoneUuid?: string;
  form: FormInstance;
}

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

export default function ZoneSelect({ form, initialZoneUuid }: IZoneSelect) {
  const intl = useIntl();

  const { data: zoneData } = useQuery(zoneList, {
    variables: {
      sortBy: "createDate",
      sortDirection: "asc",
    },
    onCompleted: (result) => {
      if (initialZoneUuid) {
        form.setFieldsValue({ zoneUuid: initialZoneUuid });
      } else {
        const value = result?.zoneList?.list?.[0]?.uuid;
        if (value) {
          form.setFieldsValue({ zoneUuid: value });
        }
      }
    },
  });

  const options = useMemo<ISelectOption[]>(() => {
    const list: Zone[] | undefined = zoneData?.zoneList?.list;
    if (!list) {
      return [];
    }
    return list.map((item) => ({ label: item.name, value: item.uuid }));
  }, [zoneData]);

  return (
    <Form.Item
      name="zoneUuid"
      label={intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}
    >
      <Select width={400} options={options} />
    </Form.Item>
  );
}
