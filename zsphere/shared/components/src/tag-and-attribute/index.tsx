import { gql, useQuery } from "@apollo/client";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import {
  ResourceAttributeKeyResponse,
  ResourceAttributeValueResponse,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useAuth } from "../a-cloud-old-components/auth";
import DraggableCard from "../a-cloud-old-components/card/draggable-card";
import { Empty } from "../empty";
import List from "../list";
import TagList from "../tag-list";

const queryResourceAttributeKeyList = gql`
  query queryResourceAttributeKey($conditions: [Condition!]) {
    queryResourceAttributeKeyList(conditions: $conditions) {
      list {
        uuid
        name
      }
    }
  }
`;

const queryResourceAttributeValueList = gql`
  query queryResourceAttributeValue($conditions: [Condition!]) {
    queryResourceAttributeValueList(conditions: $conditions) {
      list {
        keyUuid
        value
      }
    }
  }
`;

export interface IProps {
  current?: any;
  showTag?: boolean;
}

export default function TagAndAttribute({
  current,
  showTag = true,
  ...props
}: IProps) {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasAttributeAuth = hasAuth({
    type: "block" as const,
    resource: "virtualization.tag.and.attribute",
    authKey: "resource.attribute",
  });

  const resourceType = current?.__typename?.endsWith("VO")
    ? current.__typename
    : `${current?.__typename}VO`;

  const { data: keyData, refetch: refetchKey } = useQuery<{
    queryResourceAttributeKeyList?: ResourceAttributeKeyResponse;
  }>(queryResourceAttributeKeyList, {
    variables: {
      conditions: [
        {
          key: "resourceType",
          op: Op.in,
          values: ["ResourceAttributeKeyVO", resourceType],
        },
      ],
    },
  });

  const { data: valueData, refetch: refetchValue } = useQuery<{
    queryResourceAttributeValueList?: ResourceAttributeValueResponse;
  }>(queryResourceAttributeValueList, {
    variables: {
      conditions: [
        { key: "resourceUuid", op: Op.eq, value: current?.uuid ?? "" },
      ],
    },
  });

  useActionSubscribe({
    resourceTypeList: ["ResourceAttributeKey", "ResourceAttributeValue"],
    onFinish: () => {
      refetchKey();
      refetchValue();
    },
  });

  const keyList = keyData?.queryResourceAttributeKeyList?.list;
  const valueList = valueData?.queryResourceAttributeValueList?.list;

  const attributeList = useMemo(() => {
    return (
      keyList?.map(({ uuid, name }) => {
        return {
          label: name,
          value: valueList?.find((item) => item.keyUuid === uuid)?.value,
        };
      }) ?? []
    );
  }, [keyList, valueList]);

  const list = useMemo(
    () =>
      showTag
        ? [
            {
              label: intl.formatMessage({ id: "tag", defaultMessage: "Tag" }),
              number: current?.tag?.length,
              value: current?.tag?.length ? (
                <TagList tags={current.tag} />
              ) : null,
            },
            {
              label: intl.formatMessage({
                id: "virtualization.resource.attribute",
                defaultMessage: "Custom Attribute",
              }),
              value: attributeList.length || null,
              show: hasAttributeAuth,
              children: attributeList,
            },
          ]
        : attributeList,
    [current, intl, attributeList, showTag, hasAttributeAuth],
  );

  if (!showTag && !hasAttributeAuth) {
    return null;
  }

  return (
    <DraggableCard
      title={
        showTag
          ? intl.formatMessage({
              id: "virtualization.tag.and.attribute",
              defaultMessage: "Tag and Attribute",
            })
          : intl.formatMessage({
              id: "virtualization.resource.attribute",
              defaultMessage: "Custom Attribute",
            })
      }
      isList
      {...props}
    >
      {!showTag && !attributeList.length ? (
        <Empty type="Select" />
      ) : (
        <List list={list} bordered={false} />
      )}
    </DraggableCard>
  );
}
