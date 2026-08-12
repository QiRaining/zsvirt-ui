import { useLazyQuery, gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import {
  useAuth,
  usePersistTabState,
  useSetTab,
} from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import DirGroupList from "./group";

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

const instanceCount = gql`
  query instanceCount(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
      count: true
    ) {
      total
    }
  }
`;

const vmGroupCount = gql`
  query vmGroupCount($conditions: [Condition!], $type: DirectoryQueryType) {
    vmGroupCount(conditions: $conditions, type: $type) {
      total
    }
  }
`;

interface IProps {
  current: IZone;
}

const Instance: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const location = useLocation();
  const hasVmAuth = hasAuth({
    type: "view",
    authKey: "list",
    resource: "virtualization.vm",
  });

  const { activeKey, onChange } = usePersistTabState(
    "instance",
    hasVmAuth ? ["vm", "group"] : ["group"],
  );

  const { setTab } = useSetTab();

  useEffect(() => {
    const { state } = location;
    const tabType = (state as any)?.tabType;
    if (tabType) {
      setTab("instance", tabType);
    }
  }, [location, location.state]);

  const vmDefaultQuery = {
    conditions: [
      { key: "state", op: Op.ne, value: "Destroyed" },
      { key: "zoneUuid", value: current?.uuid, op: Op.eq },
    ],
  };
  const [getVmCount, { data: vmData }] = useLazyQuery(instanceCount, {
    variables: vmDefaultQuery,
  });

  const [getVmGroupCount, { data: vmGroupData }] = useLazyQuery(vmGroupCount, {
    variables: {
      conditions: [
        {
          key: "zoneUuid",
          value: current?.uuid,
          op: Op.eq,
        },
      ],
    },
  });

  useMount(() => {
    getVmCount();
    getVmGroupCount();
  });

  useSubscribeOrgTreeChange({
    resourceTypeList: ["DirectoryGroup", "VmInstance"],
    onFinish: (e: any) => {
      if (["VmInstance"].indexOf(e?.type) !== -1 && e.state === "success") {
        getVmCount();
      }
      if (["DirectoryGroup"].indexOf(e?.type) !== -1 && e.state === "success") {
        getVmGroupCount();
      }
    },
  });

  return (
    <AuthCheck resourceTypes={["virtualization.vm", "virtual.directory"]}>
      <div className={style.container}>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={MARGIN_BOTTOM_12_STYLE}
          onValueChange={onChange}
          options={[
            ...(hasVmAuth
              ? [
                  {
                    value: "vm",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.instance.instance.tab.n",
                        defaultMessage: "VM ({n})",
                      },
                      {
                        n: vmData?.vmInstanceList?.total || 0,
                      },
                    ),
                  },
                ]
              : []),
            ...(hasAuth({
              resource: "virtual.directory",
              type: "view",
              authKey: "list",
            })
              ? [
                  {
                    value: "group",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.instance.group.tab.n",
                        defaultMessage: "VM Group ({n})",
                      },
                      {
                        n: vmGroupData?.vmGroupCount?.total || 0,
                      },
                    ),
                  },
                ]
              : []),
          ]}
        />

        {current?.uuid && activeKey === "vm" && (
          <VMList
            view="sub.virtualization.zone"
            source={current}
            customView="virtualization.custom"
            withResourceAttribute
            defaultQuery={{
              conditions: [
                { key: "state", op: Op.ne, value: "Destroyed" },
                { key: "zoneUuid", value: current?.uuid, op: Op.eq },
              ],
            }}
          />
        )}
        {current?.uuid && activeKey === "group" && (
          <DirGroupList current={current} />
        )}
      </div>
    </AuthCheck>
  );
};

export default Instance;
