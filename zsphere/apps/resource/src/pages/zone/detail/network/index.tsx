import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { l2NetworkCount } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import { l3NetworkCount } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import L2NetworkList from "@zstack/virtualization-resource/src/pages/l2-network/list";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import SecurityList from "@zstack/virtualization-resource/src/pages/security-group/list";
import { DetailNavLayout } from "@zstack/zsphere-components";
import { useAuth, usePersistTabState } from "@zstack/zsphere-components";
import type { IDetailNavLayoutPage } from "@zstack/zsphere-components/dist/detail-nav-layout/type";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { genUuid } from "@zstack/zsphere-utils";
import { useMount } from "ahooks";
import { merge } from "lodash-es";
import React, { useMemo, useState, useReducer } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

const CONTAINER_STYLE = { height: "100%" } as const;

interface IProps {
  current: IZone;
}

const Network: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const hasL2NetworkAuth = hasAuth({
    resource: "virtualization.l2.network",
    authKey: "list",
    type: "view",
  });

  const { activeKey, onChange } = usePersistTabState(
    "network",
    hasL2NetworkAuth ? ["l2", "l3"] : ["l3"],
  );

  const l2DefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zone.uuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "type",
          op: Op.ne,
          value: "portGroup",
        },
      ],
    };
  }, [current.uuid]);

  const l3DefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zone.uuid",
          value: current.uuid,
          op: Op.eq,
        },
      ],
    };
  }, [current.uuid]);

  const [l3Query, setl3Query] = useState<IQuery>(() =>
    merge({}, l3DefaultQuery),
  );

  const [getL2Count, { data: l2Data }] = useLazyQuery(l2NetworkCount, {
    variables: l2DefaultQuery,
  });

  const [getL3Count, { data: l3Data }] = useLazyQuery(l3NetworkCount, {
    variables: l3DefaultQuery,
  });

  useMount(() => {
    getL2Count();
    getL3Count();
  });

  useActionSubscribe({
    resourceTypeList: ["L2Network"],
    onProgress: () => {
      getL2Count();
      getL3Count();
    },
    onFinish: () => {
      setl3Query(merge({}, l3Query, { random: genUuid() })); // refetch L3列表
    },
  });

  useActionSubscribe({
    resourceTypeList: ["L3Network"],
    onProgress: () => {
      getL3Count();
    },
  });

  const [securityGroupKey, updateKey] = useReducer((x) => x + 1, 1);

  useActionSubscribe({
    resourceTypeList: ["SecurityGroup"],
    onProgress: () => {
      updateKey();
    },
  });

  const pageList: IDetailNavLayoutPage[] = [
    {
      key: "network.resource",
      name: intl.formatMessage({
        id: "virtualization.network.resource",
        defaultMessage: "Network Resource",
      }),
      page: (
        <AuthCheck
          resourceTypes={[
            "virtualization.l3.network",
            "virtualization.l2.network",
          ]}
        >
          <div className={style.container}>
            <RadioGroup
              variant="outline"
              value={activeKey}
              style={MARGIN_BOTTOM_12_STYLE}
              onValueChange={onChange}
              options={[
                ...(hasL2NetworkAuth
                  ? [
                      {
                        value: "l2",
                        label: intl.formatMessage(
                          {
                            id: "virtualization.zone.detail.l2.tab.n",
                            defaultMessage: "Distributed Switch ({n})",
                          },
                          { n: l2Data?.l2NetworkList?.total ?? 0 },
                        ),
                      },
                    ]
                  : []),
                ...(hasAuth({
                  resource: "virtualization.l3.network",
                  authKey: "list",
                  type: "view",
                })
                  ? [
                      {
                        value: "l3",
                        label: intl.formatMessage(
                          {
                            id: "virtualization.zone.detail.l3.tab.n",
                            defaultMessage: "Distributed Port Group ({n})",
                          },
                          { n: l3Data?.getL3NetworkCount?.total ?? 0 },
                        ),
                      },
                    ]
                  : []),
              ]}
            />

            {activeKey === "l2" && (
              <L2NetworkList
                source={current}
                view="sub.virtualization.zone"
                customView="custom"
                withResourceAttribute
                defaultQuery={l2DefaultQuery}
              />
            )}
            {activeKey === "l3" && (
              <L3NetworkList
                source={current}
                view="sub.virtualization.zone"
                customView="custom"
                withResourceAttribute
                defaultQuery={l3Query}
              />
            )}
          </div>
        </AuthCheck>
      ),
    },
    {
      key: "security.group",
      name: intl.formatMessage({
        id: "virtualization.security.group",
        defaultMessage: "Security Group",
      }),
      auth: {
        type: "view",
        authKey: "list",
        resource: "virtualization.security.group",
      },
      page: (
        <div className={style.securityGroupContainer}>
          <div className={style.title}>
            {intl.formatMessage({
              id: "virtualization.security.group",
              defaultMessage: "Security Group",
            })}
          </div>
          <SecurityList
            key={securityGroupKey}
            view="sub.virtualization.zone"
            source={current}
          />
        </div>
      ),
    },
  ];

  return (
    <AuthCheck
      resourceTypes={[
        "virtualization.l3.network",
        "virtualization.l2.network",
        "virtualization.security.group",
      ]}
    >
      <div style={CONTAINER_STYLE}>
        <DetailNavLayout pageList={pageList} />
      </div>
    </AuthCheck>
  );
};

export default Network;
