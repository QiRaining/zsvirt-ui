import { gql, useQuery } from "@apollo/client";
import { Alert, Button, Checkbox, Tooltip } from "@zstack/design";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogBase, DialogSelectedResource } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LeftNavType, NavView, VmInstanceState } from "@zstack/zsphere-types";
import type {
  DeleteVmInstancePayload,
  GlobalConfigList as IGlobalConfigList,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import { find, get, max } from "lodash-es";
import qs from "qs";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate, useSearchParams } from "react-router";

const DELETE_VM_INSTANCE = gql`
  mutation deleteVmInstance($input: DeleteVmInstanceInput!) {
    deleteVmInstance(input: $input) {
      actionId
    }
  }
`;

const GET_GLOBAL_CONFIG = gql`
  query globalConfigList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: GlobalConfigQueryType
    $sortBy: String
  ) {
    globalConfigList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
    ) {
      total
      list {
        category
        defaultValue
        description
        name
        value
        uuid
        isValid
      }
    }
  }
`;

const STYLE_LINK = {
  display: "inline-block",
  cursor: "pointer",
  color: "var(--color-600)",
} as const;

export type DeletionPolicy = "Direct" | "Delay" | "Never" | undefined;

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTabMultiple } = useSetTab();

  const { data } = useQuery<{ globalConfigList: IGlobalConfigList }>(
    GET_GLOBAL_CONFIG,
    {
      variables: {
        conditions: [
          {
            key: "category",
            value: "vm",
          },
          {
            key: "name",
            op: "in",
            values: ["deletionPolicy", "expungeInterval", "expungePeriod"],
          },
        ],
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    },
  );

  const deletionPolicy = useMemo(() => {
    const list = get(data, ["globalConfigList", "list"], []);
    const _deletionPolicy = find(list, {
      name: "deletionPolicy",
      category: "vm",
    });
    const expungeInterval = find(list, {
      name: "expungeInterval",
      category: "vm",
    });
    const expungePeriod = find(list, { name: "expungePeriod", category: "vm" });
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
  }, [data, intl]);

  const alarmMsg = useMemo(() => {
    // 直接删除
    if (deletionPolicy?.policy === "Direct") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.action.direct.delete.alert.error",
            defaultMessage: `This action completely deletes the VMs and releases the associated CPU, memory, and IP address. Proceed with caution.`,
          })}
        </ReactMarkdown>
      );
    }
    // 延时删除
    if (deletionPolicy?.policy === "Delay") {
      return (
        <ReactMarkdown>
          {intl.formatMessage(
            {
              id: "vm.action.delay.delete.alert.error",
              defaultMessage: `1. This action releases the associated CPU, memory, and IP address.

2. The system moves the deleted VMs to the recycle bin and completely deletes VMs after {time}.`,
            },
            {
              time: deletionPolicy?.time,
            },
          )}
        </ReactMarkdown>
      );
    }
    // 永不删除
    if (deletionPolicy?.policy === "Never") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "vm.action.never.delete.alert.error",
            defaultMessage: `1. This action releases the associated CPU, memory, and IP address.
2. The system moves the deleted VMs to the recycle bin and does not completely delete VMs automatically.`,
          })}
        </ReactMarkdown>
      );
    }
    return (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "vm.action.delete.alert.error",
          defaultMessage: `1. Deleting a virtual machine releases the associated CPU, memory, and IP address. The deleted virtual machine is displayed on the Recycle Bin tab.
2. By default, a virtual machine in the recycle bin is expunged 7 days after the deletion. The Cloud provides 3 deletion policies: Direct, Delay, and Never. You can modify the setting in Global Setting based on your business needs.`,
        })}
      </ReactMarkdown>
    );
  }, [deletionPolicy, intl]);

  const successMessage = useMemo(() => {
    let result: string | React.ReactNode;
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;
    if (deletionPolicy?.policy !== "Direct") {
      result = intl.formatMessage(
        {
          id: "vm.delay.delete.success.message",
          defaultMessage:
            "The virtual machine has been moved to the recycle bin. Check the file in {m}.",
        },
        {
          m: (
            <a
              style={STYLE_LINK}
              href={url}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTabMultiple([
                  {
                    contentId: "main-tab",
                    newKey: "recycle",
                    newPath: "/root-node/detail",
                  },
                  {
                    contentId: "recycle",
                    newKey: "vm",
                    newPath: "/root-node/detail",
                  },
                ]);
                navigate(url);
              }}
            >
              {intl.formatMessage({
                id: "recycleBin",
                defaultMessage: "Recycle Bin",
              })}
            </a>
          ),
        },
      );
    }
    return result;
  }, [deletionPolicy, location, intl, selectedList]);

  const [deleteVolume, setDeleteVolume] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDeleteVolume(false);
    }
  }, [visible]);

  const onOk = async () => {
    const payload: DeleteVmInstancePayload[] = selectedList.map((item) => {
      return {
        uuid: item.uuid,
        deleteVolume,
      };
    });
    await doAction({
      mutation: DELETE_VM_INSTANCE,
      payload,
      name: intl.formatMessage({
        id: "delete.vm",
        defaultMessage: "Move VM to Recycle Bin",
      }),
      total: selectedList.length,
      type: "VmInstance",
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Destroying },
        uuids: selectedList.map((item) => item.uuid),
      },
      onFinish: () => {
        if (
          location.pathname?.includes("vm/detail") &&
          !searchParams.get("leftnav")
        ) {
          navigate(-1);
        }
      },
      successMessage,
    });

    setVisible(false);
    refetch?.();
    setSelectedList?.([]);
  };

  return (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "delete.vm.modal.tital.confirm",
        defaultMessage: "Move VM to Recycle Bin?",
      })}
      footer={
        <>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onOk();
            }}
          >
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </>
      }
    >
      <Alert variant="warning" className="mb-4">
        {alarmMsg}
      </Alert>
      <DialogSelectedResource
        names={selectedList.map((item) => item.name ?? item.uuid)}
      />
      <Tooltip
        content={intl.formatMessage({
          id: "vm.field.deleteVolume.tips",
          defaultMessage:
            "Selecting this checkbox will delete all data disks (except for shared disks) attached to the selected VMs.",
        })}
      >
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={deleteVolume}
            onCheckedChange={(v) => setDeleteVolume(v === true)}
          />
          {intl.formatMessage({
            id: "vm.modal.delete.extra.volume",
            defaultMessage: "Also delete attached disks",
          })}
        </label>
      </Tooltip>
    </DialogBase>
  );
};

export default Action;
