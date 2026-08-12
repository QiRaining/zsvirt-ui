import { gql, useQuery } from "@apollo/client";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type {
  GlobalConfig,
  BaremetalInstance as IBaremetalInstance,
} from "@zstack/zsphere-types/graphql";
import { get } from "lodash-es";
import qs from "qs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router";

import useModalOpenState from "../../../utils/use-modal-show-state";

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  cursor: "pointer",
  color: "var(--color-600)",
};

const deleteBaremetalInstance = gql`
  mutation deleteBaremetalInstance($input: DeleteBaremetalInstanceInput!) {
    deleteBaremetalInstance(input: $input) {
      actionId
    }
  }
`;

const globalConfigGql = gql`
  query globalConfig {
    globalConfig(category: "baremetalInstance", name: "deletionPolicy") {
      name
      category
      value
      uuid
    }
  }
`;

type DeletionPolicy = "Direct" | "Delay" | undefined;

const Action: React.FC<IActionWrapperProps<IBaremetalInstance>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const location = useLocation();
  const navigate = useNavigate();
  const { setTabMultiple } = useSetTab();
  const { data } = useQuery<{ globalConfig: GlobalConfig }>(globalConfigGql);
  const { open, afterClose } = useModalOpenState({ visible });

  const deletionPolicy: DeletionPolicy = useMemo(() => {
    return get(data, ["globalConfig", "value"]) as DeletionPolicy;
  }, [data]);

  const successMessage = useMemo(() => {
    let result: string | React.ReactNode;
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;
    if (deletionPolicy !== "Direct") {
      result = intl.formatMessage(
        {
          id: "baremetal.instance.delay.delete.success.message",
          defaultMessage:
            "The bare metal instance has been moved to the recycle bin. Check the file in {m}.",
        },
        {
          m: (
            <a
              style={linkStyle}
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

  const onOk = async () => {
    const payload = selectedList.map((item: IBaremetalInstance) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: deleteBaremetalInstance,
      payload,
      name: intl.formatMessage({
        id: "delete.baremetalInstance",
        defaultMessage: "Delete Bare Metal Instance",
      }),
      total: selectedList.length,
      type: "BaremetalInstance",
      onFinish: () => {
        refetch?.();
      },
      successMessage,
    });
    setSelectedList?.([]);
  };

  const alarmMsg = useMemo(() => {
    if (deletionPolicy === "Direct") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "baremetalInstance.modal.delete.direct.alert.danger",
            defaultMessage: `This action completely deletes the bare metal instance and powers off related bare metal chassis, which will affect your business continuity. Proceed with caution.`,
          })}
        </ReactMarkdown>
      );
    }
    // 语义上是一天就删除，但是后端没有实现，所以是永不删除。
    if (deletionPolicy === "Delay") {
      return (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "baremetalInstance.modal.delete.delay.alert.danger",
            defaultMessage: `1. Deleting a bare metal instance also powers off related bare metal chassis, which might affect your business continuity. Proceed with caution.

2. The system moves the deleted bare metal instance to the Recycle Bin and does not completely delete it automatically.`,
          })}
        </ReactMarkdown>
      );
    }
    return (
      <ReactMarkdown>
        {intl.formatMessage({
          id: "baremetalInstance.delete.action.alert.error",
          defaultMessage: `Deleting a bare metal instance also powers off related bare metal chassis, which might affect your business continuity. Proceed with caution.`,
        })}
      </ReactMarkdown>
    );
  }, [deletionPolicy]);

  if (!open) {
    return null;
  }

  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      bannerMessage={alarmMsg}
      title={intl.formatMessage({
        id: "baremetalInstance.modal.title.confirm.delete.baremetalInstance",
        defaultMessage: "Delete Bare Metal Instance?",
      })}
      resourceType={intl.formatMessage({
        id: "baremetalInstance",
        defaultMessage: "Bare Metal Instance",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      guide={intl.formatMessage({
        id: "delete",
        defaultMessage: "Delete",
      })}
      needValidate={needValidate}
      onConfirm={() => {
        onOk();
      }}
      afterClose={afterClose}
    />
  );
};

export default Action;
