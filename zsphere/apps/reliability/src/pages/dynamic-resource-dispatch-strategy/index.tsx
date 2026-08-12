import { Op } from "@zstack/zsphere-types";
import { useState, useMemo } from "react";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";

import Header from "./header";
import List from "./list";

import styles from "./style.module.less";

const Index = () => {
  // 处理header切换zone
  const [selectedZoneUuid, setSelectedZoneUuid] = useState<
    string | undefined
  >();
  const defaultQuery = useMemo(() => {
    const conditions = [];

    if (selectedZoneUuid) {
      conditions.push({
        key: "zoneUuid",
        op: Op.eq,
        value: selectedZoneUuid,
      });
    }

    return {
      conditions,
    };
  }, [selectedZoneUuid]);

  return (
    <ZoneUuidContext.Provider value={{ zoneUuid: selectedZoneUuid }}>
      <div className="main-list-header-tabs-container">
        <Header
          selectedZoneUuid={selectedZoneUuid}
          setSelectedZoneUuid={setSelectedZoneUuid}
        />
        <div className={styles.main}>
          <List view="main" defaultQuery={defaultQuery} />
        </div>
      </div>
    </ZoneUuidContext.Provider>
  );
};

export default Index;
