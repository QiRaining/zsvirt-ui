import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useState, useMemo } from "react";
import { ZoneContext } from "zsv_data_protection_shared/backup-management/disaster-recovery-storage/mf-index";

import BackupStorageHeader from "./header";
import BackupStorageList from "./list";

const BackupStorage = () => {
  // 处理header切换zone
  const [selectedZone, setSelectedZone] = useState<IZone | undefined>();
  const defaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "type",
        op: Op.eq,
        value: "ImageStoreBackupStorage",
      },
      {
        key: "__systemTag__",
        op: Op.in,
        values: ["onlybackup", "allowbackup", "remotebackup"],
      },
    ];

    if (selectedZone?.uuid) {
      conditions.push({
        key: "zone.uuid",
        op: Op.eq,
        value: selectedZone?.uuid,
      });
    }

    return {
      conditions,
    };
  }, [selectedZone]);

  return (
    <ZoneContext.Provider value={{ selectedZone, setSelectedZone }}>
      <div className="main-list-header-tabs-container">
        <BackupStorageHeader
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />
        <div className="zsv-list-padding">
          <BackupStorageList
            view="main"
            defaultQuery={defaultQuery}
            selectedZone={selectedZone}
          />
        </div>
      </div>
    </ZoneContext.Provider>
  );
};

export default BackupStorage;
