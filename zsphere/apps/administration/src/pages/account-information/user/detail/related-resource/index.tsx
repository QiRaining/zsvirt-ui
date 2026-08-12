import { DetailNavLayout } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op, VmQueryType, VolumeQueryType } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import VmList from "zsv_resource/vm/list";
import VolumeList from "zsv_resource/volume/list";

import style from "./style.module.less";

interface IProps {
  current: IAccount;
  refetch: () => void;
}

const RelatedResource: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();

  useActionSubscribe({
    resourceTypeList: ["VmInstance", "Volume", "Owner"],
    onFinish: () => {
      refetch?.();
    },
  });

  const pageList = React.useMemo(
    () => [
      {
        key: "vm",
        name: intl.formatMessage({
          id: "vm",
          defaultMessage: "Virtual Machine",
        }),
        showTitle: true,
        count: current.vmNum,
        page: (
          <VmList
            view="sub.virtualization.account"
            defaultQuery={{
              extraConditions: [
                { key: "accountUuid", op: Op.eq, value: current.uuid },
              ],
              type: VmQueryType.Account,
            }}
          />
        ),
      },
      {
        key: "volume",
        name: intl.formatMessage({
          id: "volume",
          defaultMessage: "Disk",
        }),
        showTitle: true,
        count: current?.volumeNum,
        page: (
          <VolumeList
            view="sub.virtualization.account"
            defaultQuery={{
              conditions: [
                {
                  key: "status",
                  op: Op.ne,
                  value: "Deleted",
                },
              ],
              extraConditions: [
                {
                  key: "accountUuid",
                  op: Op.eq,
                  value: current.uuid,
                },
              ],
              type: VolumeQueryType.GET_VOLUME_BY_ACCOUNT,
            }}
          />
        ),
      },
    ],
    [current, intl],
  );

  return (
    <div className={style.layout}>
      <DetailNavLayout
        pageList={pageList}
        cacheConfig={{ contentId: "settings" }}
      />
    </div>
  );
};

export default RelatedResource;
