import { gql, useQuery } from "@apollo/client";
import type { AlertType } from "@zstack/zsphere-components";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogP1, DialogP0Smart } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LeftNavType, NavView, VolumeStatus } from "@zstack/zsphere-types";
import type {
  DeleteDataVolumePayload,
  Volume as IVolume,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import { max, get, uniq, flatten, map, every } from "lodash-es";
import qs from "qs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router";

const _deleteDataVolume = gql`
  mutation deleteDataVolume($input: DeleteDataVolumeInput!) {
    deleteDataVolume(input: $input) {
      actionId
    }
  }
`;

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

type DeletionPolicy = "Direct" | "Delay" | "Never" | undefined;

const DeleteDataVolume: React.FC<IActionWrapperProps<IVolume>> = ({
  source,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const { setTabMultiple } = useSetTab();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: deletionPolicyData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "deletionPolicy",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const { data: expungeIntervalData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "expungeInterval",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const { data: expungePeriodData } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volume",
      name: "expungePeriod",
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const deletionPolicy = useMemo(() => {
    const _deletionPolicy = deletionPolicyData?.globalConfig;
    const expungeInterval = expungeIntervalData?.globalConfig;
    const expungePeriod = expungePeriodData?.globalConfig;
    const time = formatSecToPeriod(
      Number(
        max([Number(expungeInterval?.value), Number(expungePeriod?.value)]),
      ),
      intl,
    );

    return {
      policy: get(_deletionPolicy, "value") as DeletionPolicy,
      time,
    };
  }, [deletionPolicyData, expungeIntervalData, expungePeriodData, intl]);

  const vmInstance = selectedList?.[0]?.vmInstance?.[0];
  // 详情页tab所带source正确，详情页套详情页source是不对的（有时候是不存在的），所以要从自身挂载的VM来判断是否为弹性裸金属。
  const isbareMetal2Instance: boolean =
    source?.hypervisorType === "baremetal2" ||
    vmInstance?.hypervisorType === "baremetal2";

  const showCdpAlert = React.useMemo(
    () => selectedList?.some(({ cdpTaskStatus }) => !!cdpTaskStatus),
    [selectedList],
  );

  const successMessage = useMemo(() => {
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;

    return intl.formatMessage(
      {
        id: "disk.delay.delete.success.message",
        defaultMessage: "The disk has been moved to the recycle bin. Check the file in {m}.",
      },
      {
        m: (
          <a
            style={{
              display: "inline-block",
              cursor: "pointer",
              color: "var(--color-600)",
            }}
            href={url}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const pathname = url.split("?")[0];
              setTabMultiple([
                { contentId: "main-tab", newKey: "recycle", newPath: pathname },
                { contentId: "recycle", newKey: "disk", newPath: pathname },
              ]);
              navigate(url);
            }}
          >
            {intl.formatMessage({ id: "recycleBin", defaultMessage: "Recycle Bin" })}
          </a>
        ),
      },
    );
  }, [intl, selectedList, location]);

  const actionTitle = useMemo(() => {
    return deletionPolicy.policy === "Direct"
      ? intl.formatMessage({
          id: "delete.volume",
          defaultMessage: "Delete Disk",
        })
      : intl.formatMessage({
          id: "move_volume.to.trash",
          defaultMessage: "Move Disk to Recycle Bin",
        });
  }, [deletionPolicy.policy, intl]);

  const onOk = () => {
    const payload: DeleteDataVolumePayload[] = selectedList?.map((volume) => {
      return {
        uuid: volume.uuid,
        status: volume?.status,
      };
    });
    doAction({
      mutation: _deleteDataVolume,
      payload,
      name: actionTitle,
      total: selectedList?.length ?? 1,
      type: "Volume",
      successMessage,
      onFinish: (_result: IActionResult) => {
        if (location.pathname?.includes("volume/detail")) {
          navigate(-1);
        }
        setSelectedList?.([]);
        setVisible(false);
        refetch?.();
      },
    });
  };

  const _linkedResourceMessage = isbareMetal2Instance
    ? intl.formatMessage(
        {
          id: "associatedCount.bareMetal2Instance.and.volume",
          defaultMessage: "{vmInstanceCount} Elastic Baremetal Instances",
        },
        {
          vmInstanceCount: get(
            uniq(
              flatten(
                map(selectedList, (volume) =>
                  map(get(volume, ["vmInstance"], []), (it) => it.uuid),
                ),
              ),
            ),
            "length",
            0,
          ),
        },
      )
    : intl.formatMessage(
        {
          id: "associatedCount.instance",
          defaultMessage: "{vmInstanceCount} Instances",
        },
        {
          vmInstanceCount: get(
            uniq(
              flatten(
                map(selectedList, (volume) =>
                  map(get(volume, ["vmInstance"], []), (it) => it.uuid),
                ),
              ),
            ),
            "length",
            0,
          ),
        },
      );

  const isNotInstantiatedVolume = every(
    selectedList || [],
    (volume) => volume.status === VolumeStatus.NotInstantiated,
  );

  const _snapMemoryMessage = intl.formatMessage({
    id: "volume.modal.delete.alert.warning.with.snap.memory",
    defaultMessage:
      "The volume was used to create a VM memory snapshot. Delete the snapshot and try again.",
  });

  const _selectMessage = intl.formatMessage({
    id: "volume.modal.delete.following.snapshot.first",
    defaultMessage: "Delete the following snapshots first:",
  });

  const _snapMemoryTitle = intl.formatMessage({
    id: "volume.modal.title.confirm.delete.snap.memory.volume",
    defaultMessage: "Cannot Delete Disk",
  });

  const commonPropsInZsv = useMemo(() => {
    // 默认直接删除
    const props = {
      alertType: "error" as AlertType,
      title: intl.formatMessage({
        id: "virtualization.volume.modal.title.confirm.delete.volume.direct",
        defaultMessage: "Expunge Disk?",
      }),
      bannerMessage: intl.formatMessage({
        id: "virtualization.volume.modal.direct.delete.alert.warning.data_storage",
        defaultMessage: "This operation will completely delete the hard drive, please exercise caution when operating...",
      }),
    };

    switch (deletionPolicy.policy) {
      // 延时删除
      case "Delay":
        props.alertType = "warning";
        props.title = intl.formatMessage({
          id: "virtualization.volume.modal.title.confirm.delete.volume.delay",
          defaultMessage: "Move Disk to Recycle Bin?",
        });
        props.bannerMessage = intl.formatMessage(
          {
            id: "virtualization.volume.modal.delay.delete.alert.warning.data_storage",
            defaultMessage:
              "This action moves the disk to the recycle bin and completely deletes it after {time}.",
          },
          {
            time: deletionPolicy?.time,
          },
        );
        break;

      // 永不删除
      case "Never":
        props.alertType = "warning";
        props.title = intl.formatMessage({
          id: "virtualization.volume.modal.title.confirm.delete.volume.delay",
          defaultMessage: "Move Disk to Recycle Bin?",
        });
        props.bannerMessage = intl.formatMessage({
          id: "virtualization.volume.modal.never.delete.alert.warning.data_storage",
          defaultMessage: "This action moves the disk to the recycle bin, but it will not be automatically deleted.",
        });
        break;

      default:
    }

    if (isbareMetal2Instance) {
      props.bannerMessage = intl.formatMessage({
        id: "virtualization.volume.modal.delete.bareMetal2Instance.alert.warning",
        defaultMessage:
          "Deleting a volume also detaches the volume from the associated elastic baremetal instance and interrupts data reads/writes of the instance from/to the volume. Please exercise caution.",
      });
    }

    if (isNotInstantiatedVolume) {
      props.bannerMessage = intl.formatMessage({
        id: "virtualization.volume.modal.delete.notInstantiated.alert.warning",
        defaultMessage: "Uninstantiated volumes will be deleted immediately.",
      });
    }

    if (showCdpAlert) {
      props.bannerMessage = intl.formatMessage({
        id: "virtualization.volume.modal.delete.alert.warning.with.cdp",
        defaultMessage: `Deleting volumes interrupts data reads/writes of associated virtual machines from/to the volumes. The volumes become unavailable. You need to resume the volumes before you can attach them to virtual machines.`,
      });
    }

    return props;
  }, [
    deletionPolicy,
    isbareMetal2Instance,
    isNotInstantiatedVolume,
    showCdpAlert,
    intl,
  ]);

  const isDirectDelete = commonPropsInZsv.alertType === "error";

  if (isDirectDelete) {
    return (
      <DialogP0Smart
        visible={visible}
        setVisible={setVisible}
        bannerMessage={
          <ReactMarkdown>{commonPropsInZsv.bannerMessage}</ReactMarkdown>
        }
        title={commonPropsInZsv.title}
        resourceType={intl.formatMessage({
          id: "volume",
          defaultMessage: "Disk",
        })}
        resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
        onConfirm={onOk}
        needValidate={true}
      />
    );
  }

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>{commonPropsInZsv.bannerMessage}</ReactMarkdown>
      }
      title={commonPropsInZsv.title}
      resourceType={intl.formatMessage({
        id: "volume",
        defaultMessage: "Disk",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default DeleteDataVolume;
