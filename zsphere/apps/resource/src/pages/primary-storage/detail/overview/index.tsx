import PrimaryStorageAttachClusterModal from "@zstack/virtualization-resource/src/pages/primary-storage/action/virtualization-primarystorage-attach-cluster-modal";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { Alert, useAuth } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  TagAndAttribute,
} from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";
import CapacityUsage from "./capacity-usage";
import RelativeResource from "./relative-object";
import Settings from "./settings";

interface IProps {
  current: IPrimaryStorage;
  refetch?: any;
}

const alertMarginBottomStyle = { marginBottom: "12px" } as const;

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const { hasAuth } = useAuth();

  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} detail={current} refetch={refetch} />
        ),
      },
      capacityUsage: {
        resourceKey: "capacityUsage",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <CapacityUsage {...props} detail={current} />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} {...props} />
        ),
      },
      settings: {
        resourceKey: "settings",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <Settings {...props} detail={current} />
        ),
      },
      ...(hasAuth({
        type: "block",
        resource: "virtualization.tag.and.attribute",
        authKey: "resource.attribute",
      }) && {
        tagAndAttribute: {
          resourceKey: "tagAndAttribute",
          x: 1,
          y: 2,
          node: (props: Omit<IDraggableCardProps, "detail">) => {
            return (
              <TagAndAttribute current={current} {...props} showTag={false} />
            );
          },
        },
      }),
    };

    return result;
  }, [current]);

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      {!current?.attachedClusterUuids ||
      current?.attachedClusterUuids?.length <= 0 ? (
        <Alert
          closable
          type="warning"
          display="blockStrong"
          message={intl.formatMessage({
            id: "primaryStorage.not.attached.cluster.alart",
            defaultMessage: "This data storage has not been attached to a cluster. Attach a cluster before using it. ",
          })}
          guideAction={{
            text: intl.formatMessage({
              id: "attach.cluster",
              defaultMessage: "Attach Cluster",
            }),
            onClick: () => setVisible(true),
          }}
          style={alertMarginBottomStyle}
        />
      ) : null}

      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-primary-storage"
        cols={2}
        dataSet={dataSet}
      />
      <PrimaryStorageAttachClusterModal
        visible={visible}
        setVisible={setVisible}
        source={current}
        selectedList={memoizedSelectedList}
        view=""
        position="header"
      />
    </>
  );
};

export default Overview;
