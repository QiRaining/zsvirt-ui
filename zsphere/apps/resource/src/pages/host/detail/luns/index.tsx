import { useLazyQuery, gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { nvmeLunCount } from "@zstack/virtualization-resource/src/gql/nvme-lun.gql";
import { scsiLunCount } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import NVMeLunList from "@zstack/virtualization-resource/src/pages/nvme-lun/list";
import NvmeLunDetail from "@zstack/virtualization-resource/src/pages/nvme-lun/tree-detail";
import ScsiLunList from "@zstack/virtualization-resource/src/pages/scsi-lun/list";
import {
  useAuth,
  AuthHander,
  usePersistTabState,
} from "@zstack/zsphere-components";
import { Detail as ZSVDetail } from "@zstack/zsphere-components";
import { Op, NVMeLunType } from "@zstack/zsphere-types";
import type { HostVO as IHost, NVMeLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

const SPACE_STYLE = { width: "100%" } as const;

const scsiLunList = gql`
  query scsiLunList(
    $hostUuid: String!
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: ScsiLunQueryType
  ) {
    scsiLunList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
    ) {
      total
      list {
        uuid
        name
        wwid
        wwn
        vendor
        model
        serial
        type
        path
        state
        source
        size
        createDate
        lastOpDate
        scsiLunHostRefs {
          hostUuid
          scsiLunUuid
        }
        scsiLunVmInstanceRefs {
          vmInstanceUuid
        }
        healthState(hostUuid: $hostUuid)
      }
    }
  }
`;

export interface IProps {
  current: IHost;
  getDetailContainer: () => HTMLElement;
}

export enum LunTypeEnum {
  Scsi = "Scsi",
  NVMe = "NVMe",
}

export const ScsiLunSupport = {
  type: "block" as const,
  authKey: "scsi.lun",
  resource: "host",
};

export const NVMeLunSupport = {
  type: "block" as const,
  authKey: "nvme.lun",
  resource: "host",
};

const Luns: React.FC<IProps> = ({ current, getDetailContainer }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { activeKey, onChange } = usePersistTabState("host.lun", [
    LunTypeEnum.Scsi,
    LunTypeEnum.NVMe,
  ]);

  const hasScsiLunSupport = hasAuth(ScsiLunSupport);
  const hasNVMeLunSupport = hasAuth(NVMeLunSupport);

  const scsiLunDefaultQuery = useMemo(() => {
    return {
      hostUuid: current?.uuid,
      conditions: [
        {
          key: "scsiLunHostRef.hostUuid",
          op: Op.eq,
          value: current?.uuid,
        },
      ],
    };
  }, [current?.uuid]);

  const nVMeLunDefaultQuery = useMemo(() => {
    return {
      type: NVMeLunType.TransportNotPcie,
      conditions: [
        {
          key: "nvmeLunHostRef.hostUuid",
          op: Op.eq,
          value: current?.uuid,
        },
      ],
    };
  }, [current?.uuid]);

  const [getScsiLunCount, { data: scsiLunData }] = useLazyQuery(scsiLunCount, {
    variables: scsiLunDefaultQuery,
  });

  const [getNvmeLunCount, { data: nvmeLunData }] = useLazyQuery(nvmeLunCount, {
    variables: nVMeLunDefaultQuery,
  });

  useEffect(() => {
    getScsiLunCount();
    getNvmeLunCount();
  }, [current?.uuid]);

  const lunsEle = React.useMemo(() => {
    if (activeKey === LunTypeEnum.Scsi && hasScsiLunSupport) {
      return (
        <ScsiLunList
          gql={scsiLunList}
          view="sub.host"
          defaultQuery={scsiLunDefaultQuery}
          hostUuid={current?.uuid}
          zoneUuid={current.zone?.uuid}
          getDetailContainer={getDetailContainer}
        />
      );
    }

    if (activeKey === LunTypeEnum.NVMe && hasNVMeLunSupport) {
      return (
        <NVMeLunList
          pagination
          view="sub.host"
          defaultQuery={nVMeLunDefaultQuery}
          renderRowDetail={(
            record: NVMeLun,
            visible: boolean,
            onClose: () => void,
          ) => (
            <ZSVDetail.Drawer
              visible={visible}
              onClose={onClose}
              getContainer={getDetailContainer}
            >
              <NvmeLunDetail
                uuid={record?.uuid}
                zoneUuid={current?.zone?.uuid}
              />
            </ZSVDetail.Drawer>
          )}
        />
      );
    }

    return null;
  }, [
    activeKey,
    hasScsiLunSupport,
    hasNVMeLunSupport,
    scsiLunDefaultQuery,
    current?.zone?.uuid,
    getDetailContainer,
    nVMeLunDefaultQuery,
  ]);

  return (
    <div>
      <div className="flex flex-col gap-3" style={SPACE_STYLE}>
        <RadioGroup
          onValueChange={(value) => {
            onChange(value);
          }}
          value={activeKey}
          variant="outline"
          options={[
            ...(hasScsiLunSupport
              ? [
                  {
                    value: LunTypeEnum.Scsi,
                    label: (
                      <AuthHander {...ScsiLunSupport}>
                        {intl.formatMessage(
                          {
                            id: "host.detail.config.luns.scsiLun.count",
                            defaultMessage: "SCSI Device ({count})",
                          },
                          {
                            count: scsiLunData?.scsiLunList?.total || 0,
                          },
                        )}
                      </AuthHander>
                    ),
                  },
                ]
              : []),
            ...(hasNVMeLunSupport
              ? [
                  {
                    value: LunTypeEnum.NVMe,
                    label: (
                      <AuthHander {...NVMeLunSupport}>
                        {intl.formatMessage(
                          {
                            id: "host.detail.config.luns.nvmeLun.count",
                            defaultMessage: "NVMe Device ({count})",
                          },
                          {
                            count: nvmeLunData?.nvmeLunList?.total || 0,
                          },
                        )}
                      </AuthHander>
                    ),
                  },
                ]
              : []),
          ]}
        />

        {lunsEle}
      </div>
    </div>
  );
};

export default Luns;
