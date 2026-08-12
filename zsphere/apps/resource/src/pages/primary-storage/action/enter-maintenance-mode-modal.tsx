import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";
import _ from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const maintainPrimaryStorageList = gql`
  mutation maintainPrimaryStorageList($input: MaintainPrimaryStorageInput!) {
    maintainPrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = () => {
    const payload = selectedList.map((item: IPrimaryStorage) => {
      return { uuid: item?.uuid };
    });
    doAction({
      mutation: maintainPrimaryStorageList,
      payload,
      name: intl.formatMessage({
        id: "enter.maintenanceMode",
        defaultMessage: "Enter Maintenance Mode",
      }),
      total: selectedList.length,
      type: "PrimaryStorageVO",
      onFinish: () => {
        setSelectedList?.([]);
        // 进入维护模式会停止关联的虚拟机，需要刷新虚拟机列表 @see ZSV-8179
        bus.emit("action:refetch:VmInstance");
      },
    });
  };

  const vmInstanceCount = _.sumBy(selectedList, "vmInstanceCount");

  const modalProps = React.useMemo(() => {
    return {
      bannerMessage: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "virtualization.primaryStorage.modal.enter.maintenanceMode.alert.danger",
            defaultMessage: `1. Entering maintenance mode also stops associated resources such as virtual machines on the data storage.
2. After you place a data storage into maintenance mode, you could not use the disks on the data storage.`,
          })}
        </ReactMarkdown>
      ),
      resourceType: intl.formatMessage({
        id: "virtualization.dataStorage",
        defaultMessage: "Data Storage",
      }),
    };
  }, [intl]);

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.enter.maintenanceMode",
        defaultMessage: "Enter Maintenance Mode?",
      })}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      bannerMessage={modalProps.bannerMessage}
      resourceType={modalProps.resourceType}
      relatedResources={
        vmInstanceCount > 0
          ? [
              {
                name: intl.formatMessage({
                  id: "virtualization.vm.unit",
                  defaultMessage: "VM",
                }),
                count: vmInstanceCount,
              },
            ]
          : undefined
      }
      onConfirm={() => onOk()}
    />
  );
};

export default Action;
