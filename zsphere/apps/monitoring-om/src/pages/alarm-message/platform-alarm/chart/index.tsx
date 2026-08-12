import { useTime } from "@zstack/hooks";
import { useMemo } from "react";

import Chart from "./bar";
import PieChart from "./pie";

import styles from "./style.module.less";

const Charts = () => {
  const ONE_DAY = 60 * 60 * 1000 * 24;

  const { getCurrentServerTimeMillionSeconds } = useTime();

  const [startTime, MillionSeconds] = useMemo(() => {
    const MillionSeconds = getCurrentServerTimeMillionSeconds();
    const startTime = MillionSeconds - ONE_DAY * 7;
    return [startTime, MillionSeconds];
  }, [ONE_DAY]);

  return (
    <div className={styles.chartsWrap}>
      <div className={styles.Charts}>
        <Chart
          startTime={startTime}
          endTime={MillionSeconds}
          intervalHours={8}
        />
        <PieChart startTime={startTime} endTime={MillionSeconds} />
      </div>
    </div>
  );
};

export default Charts;
