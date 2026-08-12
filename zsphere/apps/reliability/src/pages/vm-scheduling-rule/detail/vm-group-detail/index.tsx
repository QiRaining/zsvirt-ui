import { Op, VmInstanceState, VmQueryType } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import VmList from "zsv_resource/vm/list";

import BasicInfo from "./basic-info";

import style from "./style.module.less";

interface IProps {
  current: VmSchedulingRule;
}

const Overview: FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { vmGroup } = current;
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid");
  const defaultQueryVmList = useMemo(() => {
    return {
      conditions: [
        { key: "state", op: Op.ne, value: VmInstanceState.Destroyed },
      ],
      extraConditions: [
        { key: "vmGroupUuid", op: Op.eq, value: vmGroup?.uuid },
        { key: "vmSchedulingRuleUuid", op: Op.eq, value: uuid },
      ],
      type: VmQueryType.GetVmByVmGroup,
    };
  }, [vmGroup?.uuid]);

  return (
    <>
      <div className={`flex gap-5 ${style.container}`}>
        <div className="w-[100%]">
          <BasicInfo detail={vmGroup!} />
        </div>
        <div className="w-[100%]">
          <div className={style.resourceTitle}>
            {intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
          </div>
          <VmList
            view="sub.virtualization.vm-scheduling-rule"
            defaultQuery={defaultQueryVmList}
            source={current}
          />
        </div>
      </div>
    </>
  );
};

export default Overview;
