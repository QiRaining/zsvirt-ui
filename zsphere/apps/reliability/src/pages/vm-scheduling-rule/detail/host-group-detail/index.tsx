import { Op, HostQueryType } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import HostList from "zsv_resource/host/list";

import BasicInfo from "./basic-info";

import style from "./style.module.less";

interface IProps {
  current: VmSchedulingRule;
}

const Overview: FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hostGroup } = current;
  const defaultQueryHostList = useMemo(() => {
    return {
      extraConditions: [
        { key: "hostGroupUuid", op: Op.eq, value: hostGroup?.uuid },
      ],
      type: HostQueryType.GetHostByHostGroup,
    };
  }, [hostGroup?.uuid]);

  return (
    <>
      <div className={`flex gap-5 ${style.container}`}>
        <div className="w-[100%]">
          <BasicInfo detail={hostGroup!} />
        </div>
        <div className="w-[100%]">
          <div className={style.resourceTitle}>
            {intl.formatMessage({ id: "host", defaultMessage: "Host" })}
          </div>
          <HostList
            view="sub.host-group"
            defaultQuery={defaultQueryHostList}
            source={current}
          />
        </div>
      </div>
    </>
  );
};

export default Overview;
