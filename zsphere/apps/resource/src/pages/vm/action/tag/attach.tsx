import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type {
  IActionWrapperProps,
  Condition as ICondition,
} from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  Tag as ITag,
  VmInstance as IVmInstance,
} from "@zstack/zsphere-types/graphql";
import { isEmpty } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

import VmList from "../../list";

export const _vmInstanceList = gql`
  query vmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        state
        cpuNum
        memorySize
        hostUuid
        host
        clusterUuid
        cluster
        owner
        createDate
      }
    }
  }
`;

const ADMINUUID = "36c27e8ff05c4780bf6d2fa65700f22e";

const attachTag = gql`
  mutation attachTag($input: AttachTagInput!) {
    attachTag(input: $input) {
      actionId
    }
  }
`;

export interface IProps {}

const Action: React.FC<IActionWrapperProps<IVmInstance, ITag> & IProps> = ({
  visible,
  setVisible,
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const title = intl.formatMessage({
    id: "virtualization.vm.action.attach.tag.modal.title",
    defaultMessage: "Attach Virtual Machine",
  });

  const [value, onChange] = React.useState<Array<IVmInstance>>([]);

  const ownerConditions = React.useMemo<Array<ICondition>>(() => {
    if (source?.owner?.uuid !== ADMINUUID) {
      return [
        {
          key: "ownerName",
          op: Op.eq,
          value: source?.owner?.name,
        },
      ];
    }

    return [];
  }, [source]);

  const defalutQuery = React.useMemo(
    () => ({
      conditions: [
        {
          key: "state",
          op: Op.ne,
          value: "Destroyed",
        },
        {
          key: "__tagUuid__",
          op: Op.notIn,
          values: [source?.uuid ?? ""],
        },
        ...ownerConditions,
      ],
    }),
    [source, ownerConditions],
  );

  const onOk = React.useCallback(async () => {
    const payload = [
      {
        tagUuid: source?.uuid,
        resourceUuids: value?.map((it) => it.uuid),
      },
    ];

    doAction({
      mutation: attachTag,
      payload,
      name: title,
      total: 1,
      type: "VmInstance",
      onProgress: () => {
        setSelectedList?.([]);
      },
    });
  }, [doAction, setSelectedList, source, title, value]);

  const footerEle = React.useMemo<JSX.Element>(() => {
    return (
      <>
        <Button key="cancel" onClick={() => setVisible(false)} variant="link">
          {intl.formatMessage({ id: "bottun.cancel", defaultMessage: "Cancel" })}
        </Button>
        <Button
          key="ok"
          variant="primary"
          onClick={() => onOk()}
          disabled={isEmpty(value)}
        >
          {intl.formatMessage({ id: "button.ok", defaultMessage: "OK" })}
        </Button>
      </>
    );
  }, [intl, onOk, setVisible, value]);

  React.useEffect(() => {
    if (visible) {
      onChange([]);
    }
  }, [visible]);

  return (
    <DialogBase
      title={title}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      widthClassName="w-[800px]"
      footer={footerEle}
    >
      <VmList
        view="select.virtualization"
        value={value}
        onChange={onChange}
        defaultQuery={defalutQuery}
        gql={_vmInstanceList}
      />
    </DialogBase>
  );
};

export default Action;
