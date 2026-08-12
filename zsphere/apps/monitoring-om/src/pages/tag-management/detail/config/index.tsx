import { useQuery, gql } from "@apollo/client";
import { DetailNavLayout } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import HostList from "zsv_resource/host/list";
import VmList from "zsv_resource/vm/list";

import style from "./style.module.less";

const getTagRelatedSummary = gql`
  query getTagRelatedSummary($uuid: String!) {
    getTagRelatedSummary(uuid: $uuid) {
      vm
      volume
      host
      baremetalInstance
      baremetal2Instance
      monitorGroup
      monitorTemplate
    }
  }
`;

export interface IProps {
  current: ITag;
  refetch: Function;
}

const Config: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const { data, refetch: queryRefetch } = useQuery(getTagRelatedSummary, {
    variables: {
      uuid: current.uuid,
    },
    fetchPolicy: "network-only",
  });
  const _summary = data?.getTagRelatedSummary || {};

  const summary = React.useMemo(() => {
    if (_summary) {
      return _summary;
    }
    return {
      vm: 0,
      host: 0,
    };
  }, [_summary]);

  useActionSubscribe({
    resourceTypeList: ["VmInstance", "HostVO", "Tag"],
    onFinish: () => {
      queryRefetch();
    },
  });

  const pageList = React.useMemo(
    () => [
      {
        key: "virtualization.vm",
        name: intl.formatMessage({
          id: "virtualization.vm",
          defaultMessage: "Virtual Machine",
        }),
        showTitle: true,
        count: summary.vm,
        auth: {
          type: "action" as const,
          resource: "vm",
          authKey: "virtualization.tag.management",
        } as any,
        page: (
          <VmList
            key={`${genUuid()}${summary.vm}`}
            view="sub.virtualization.tag"
            source={current}
            defaultQuery={{
              conditions: [
                { key: "__tagUuid__", op: Op.eq, value: current.uuid },
              ],
            }}
          />
        ),
      },
      {
        key: "virtualization.host",
        name: intl.formatMessage({
          id: "virtualization.host",
          defaultMessage: "Host",
        }),
        showTitle: true,
        count: summary.host,
        auth: {
          type: "action" as const,
          resource: "host",
          authKey: "tag.management",
        } as any,
        page: (
          <HostList
            key={`${genUuid()}${summary.host}`}
            view="sub.virtualization.tag"
            source={current}
            defaultQuery={{
              conditions: [
                { key: "__tagUuid__", op: Op.eq, value: current.uuid },
              ],
            }}
          />
        ),
      },
    ],
    [intl, summary, current],
  );

  return (
    <div className={style.container}>
      <DetailNavLayout pageList={pageList} />
    </div>
  );
};

export default Config;
