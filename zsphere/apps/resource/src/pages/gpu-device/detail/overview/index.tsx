import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React from "react";

import BasicInfo from "./basic-info";

import style from "./style.module.less";

interface IProps {
  current: IPciDevice;
  refetch: any;
}

const Overview: FC<IProps> = ({ current }) => {
  return (
    <div className={style.container}>
      <div>
        <BasicInfo detail={current} />
      </div>
    </div>
  );
};

export default Overview;
