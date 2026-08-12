import { useLazyQuery } from "@apollo/client";
import { Detail } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { accessControlRule } from "../../../gql/access-control-rule.gql";
import AuditList from "./audit";
import Overview from "./overview";

export interface IProps {
  detail: any;
  visible: boolean;
  onClose: () => void;
  getContainer?: () => HTMLElement;
}

export default function AccessControlRuleDetail({
  detail,
  visible,
  onClose,
  getContainer,
}: IProps) {
  const intl = useIntl();

  const [query, { data, refetch }] = useLazyQuery(accessControlRule);

  React.useEffect(() => {
    if (visible && detail?.uuid) {
      query({
        variables: {
          uuid: detail.uuid,
        },
      });
    }
  }, [visible, detail?.uuid, query]);

  useActionSubscribe({
    resourceTypeList: ["AccessControlRule"],
    // todo： 为啥这里是onProgress的时候refetch？，不应该是onFinish吗？
    onProgress: () => {
      refetch?.();
    },
  });

  const tabPanes = useMemo(() => {
    return [
      {
        key: "overview",
        tab: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        children: <Overview current={data?.accessControlRule ?? ({} as any)} />,
      },
      {
        key: "auditing",
        tab: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        children: (
          <AuditList current={data?.accessControlRule ?? ({} as any)} />
        ),
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "auditing",
        },
      },
    ];
  }, [data, intl]);

  return (
    <Detail.Drawer
      visible={visible}
      onClose={onClose}
      getContainer={getContainer}
      tabTabPanes={tabPanes}
    />
  );
}
