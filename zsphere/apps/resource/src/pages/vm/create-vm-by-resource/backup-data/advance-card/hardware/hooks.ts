import { useQuery } from "@apollo/client";
import { scsiLunListForZSVInstanceOverView as _scsiLunList } from "@zstack/virtualization-resource/src/gql/scsi-lun.gql";
import { volumeList } from "@zstack/virtualization-resource/src/gql/volume.gql";
import { Op } from "@zstack/zsphere-types";
import type { VolumeList } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import { useMemo } from "react";

const useQueryReleatedResource = (vmUuid: string, volumeUuids: string[]) => {
  const { data: volumeData, loading: volumeLoading } = useQuery<{
    volumeList: VolumeList;
  }>(volumeList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.in,
          values: volumeUuids,
        },
      ],
      vmInstanceUuid: vmUuid,
      limit: 100,
    },
  });

  const { data: lunData, loading: lunDataLaoding } = useQuery(_scsiLunList, {
    variables: {
      conditions: [
        {
          key: "scsiLunVmInstanceRef.vmInstanceUuid",
          op: Op.eq,
          value: vmUuid,
        },
      ],
      limit: 100,
    },
  });

  const result = useMemo(() => {
    if (volumeLoading || lunDataLaoding) {
      return {
        volumeList: [],
      };
    }

    const _lunDataList = lunData?.scsiLunList?.list ?? [];
    const _volumeList = volumeData?.volumeList?.list ?? [];
    const formatedVolumeData = _volumeList.map((t: any) => {
      return {
        ...t,
        diskType: "volume",
      };
    });

    const formatedLunData = _lunDataList.map((t: any) => {
      return {
        ...t,
        lastAttachDate: t.scsiLunVmInstanceRefs.filter(
          (it: any) => it.vmInstanceUuid === vmUuid,
        )?.lastOpDate,
        deviceId: t.scsiLunVmInstanceRefs.filter(
          (cv: any) => cv.vmInstanceUuid === vmUuid,
        )?.deviceId,
        diskType: "rdm",
      };
    });

    const formatedDiskData = formatedVolumeData.concat(formatedLunData);

    return {
      volumeList: _.sortBy(formatedDiskData, [
        (volume) => new Date(volume.lastAttachDate!).valueOf(),
        "deviceId",
      ]),
    };
  }, [volumeLoading, lunDataLaoding, lunData, volumeData, vmUuid]);

  return result;
};

export { useQueryReleatedResource };
