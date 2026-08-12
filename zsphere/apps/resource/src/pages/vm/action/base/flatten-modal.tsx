import { gql, useLazyQuery } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  VmInstance,
  VmOccupyCapacity,
  Volume,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getFlattenVmInstanceOccupyCapacity } from "../../../../gql/vm.gql";

const flattenVmInstance = gql`
  mutation ($input: FlattenVmInstanceInput!) {
    flattenVmInstance(input: $input) {
      actionId
    }
  }
`;

const FlattenAction: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  // 当前选中所有云主机的所有云盘所占容量
  const [currentOccupyCapacity, setCurrentOccupyCapacity] = useState("0B");
  // 当前选中云主机的所有云盘，做【扁平合并】操作之后将会占用的容量
  const [flattenedOccupyCapacity, setFlattenedOccupyCapacity] = useState("0B");

  useEffect(() => {
    if (visible) {
      // 获取当前选中所有云主机的所有云盘所占容量
      const allVolumes = selectedList?.reduce(
        (arr: Volume[], it: VmInstance) => {
          arr = it?.allVolumes?.concat(arr) as Volume[];
          return arr;
        },
        [],
      );
      const _currentOccupyCapacity = allVolumes?.reduce(
        (total: number, it: Volume) => {
          total += it?.actualSize || 0;
          return total;
        },
        0,
      );
      setCurrentOccupyCapacity(formatStorage(_currentOccupyCapacity, 2));
      // 获取所有云主机的所有云盘在【扁平合并】将会占用的容量
      const uuids = selectedList?.map((it) => it?.uuid);
      _getFlattenVmInstanceOccupyCapacity({
        variables: {
          input: {
            uuids,
          },
        },
      });
    }
  }, [visible]);

  const [_getFlattenVmInstanceOccupyCapacity] = useLazyQuery(
    getFlattenVmInstanceOccupyCapacity,
    {
      onCompleted: (res) => {
        const _flattenedOccupyCapacity =
          res?.getFlattenVmInstanceOccupyCapacity?.list?.reduce(
            (total: number, it: VmOccupyCapacity) => {
              total += it?.actualSize || 0;
              return total;
            },
            0,
          );
        setFlattenedOccupyCapacity(formatStorage(_flattenedOccupyCapacity, 2));
      },
    },
  );

  const onOk = () => {
    doAction({
      mutation: flattenVmInstance,
      // full 代表云主机包含根盘和数据盘，整机【扁平合并】
      payload: selectedList.map((item) => {
        return { uuid: item.uuid, full: true };
      }),
      name: intl.formatMessage({
        id: "vm.flatten",
        defaultMessage: "Flatten",
      }),
      total: selectedList.length,
      type: "VmInstance",
      onFinish: () => {
        setVisible?.(false);
      },
    });
  };

  return (
    <DialogP1
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage(
            {
              id: "flatten.vm.alert.message.warning",
              defaultMessage: `1. Flatten refers to merging multiple snapshots of selected resources to achieve data independence and improve resource performance and data security.
2. The selected resources occupy {currentOccupyCapacity} of the primary storage. After flattened, the estimated capacity occupation is {flattenedOccupyCapacity}.`,
            },
            {
              currentOccupyCapacity,
              flattenedOccupyCapacity,
            },
          )}
        </ReactMarkdown>
      }
      setVisible={setVisible}
      visible={visible}
      title={intl.formatMessage({
        id: "vm.flatten",
        defaultMessage: "Flatten",
      })}
      resourceType={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default FlattenAction;
