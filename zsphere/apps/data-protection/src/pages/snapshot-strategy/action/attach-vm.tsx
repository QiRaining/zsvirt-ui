import { gql, useLazyQuery } from "@apollo/client";
import { ModalSelect } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, VmQueryType } from "@zstack/zsphere-types";
import type {
  VmInstance,
  SnapshotStrategy,
  AddVmToSnapshotStrategyPayload,
} from "@zstack/zsphere-types/graphql";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import style from "../components/style.module.less";

const addVmToSnapshotStrategy = gql`
  mutation addVmToSnapshotStrategy($input: AddVmToSnapshotStrategyInput!) {
    addVmToSnapshotStrategy(input: $input) {
      actionId
    }
  }
`;

const snapshotStrategyList = gql`
  query snapshotStrategyList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    snapshotStrategyList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        state
        jobsUuid
        jobs {
          uuid
          name
          jobData
          targetResourceUuid
          schedulerJobGroupUuids
          lastOpDate
          createDate
        }
        jobData
        triggersUuid
        triggers {
          uuid
          name
          cron
          startTime
          stopTime
          lastOpDate
          createDate
        }
        owner {
          uuid
          name
          type
        }
        lastOpDate
        createDate
      }
    }
  }
`;

export default function AttachVm({
  visible,
  setVisible,
  source,
}: IActionWrapperProps<VmInstance, SnapshotStrategy>) {
  const intl = useIntl();
  const doAction = useAction();

  const defaultQuery = useMemo(() => {
    return { type: VmQueryType.GetCandidatesForSnapshotStrategy };
  }, []);

  const [refreshVmCount] = useLazyQuery(snapshotStrategyList, {
    variables: {
      conditions: [{ key: "uuid", value: source?.uuid ?? "", op: Op.eq }],
    },
  });

  const onOk = useCallback(
    (values: VmInstance[]) => {
      const payload: AddVmToSnapshotStrategyPayload = {
        rootVolumeUuids: values.map((item) => item.rootVolumeUuid!),
        snapshotGroupMaxNumber:
          JSON.parse(source?.jobData ?? "{}").snapshotGroupMaxNumber ?? 0,
        schedulerJobGroupUuid: source?.uuid ?? "",
      };

      doAction({
        mutation: addVmToSnapshotStrategy,
        payload,
        type: "VmInstance",
        name: intl.formatMessage({
          id: "add.vm",
          defaultMessage: "Add Virtual Machine",
        }),
        total: 1,
        onFinish: (result) => {
          if (result.success > 0) {
            refreshVmCount();
          }
        },
      });
    },
    [doAction, intl, source, refreshVmCount],
  );

  return (
    <ModalSelect
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      showSelect={false}
      wrapClassName={style.selectVm}
      selectType="checkbox"
      alertType="info"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "snapshot.strategy.add.vm.alert",
            defaultMessage:
              "1. A virtual machine can have only one snapshot policy associated. A virtual machine that already has an associated snapshot policy cannot be associated again.\n2. If a virtual machine has shared disks or RDM disks attached, it cannot be associated with a snapshot policy.\n3. Make sure the virtual machine uses ZCE distributed storage, otherwise it cannot be associated with a snapshot policy.",
          })}
        </ReactMarkdown>
      }
      label={intl.formatMessage({
        id: "add.vm",
        defaultMessage: "Add Virtual Machine",
      })}
      title={intl.formatMessage({
        id: "add.vm",
        defaultMessage: "Add Virtual Machine",
      })}
    >
      <VmPlainList view="select" defaultQuery={defaultQuery} />
    </ModalSelect>
  );
}
