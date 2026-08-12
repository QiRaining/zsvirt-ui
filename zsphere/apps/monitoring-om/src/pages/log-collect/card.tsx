import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import {
  Action,
  DraggableCard,
  Alert,
  useAuth,
} from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { LogCollectState } from "@zstack/zsphere-types";
import type {
  LogCollect,
  ReCreateLogCollectPayload,
} from "@zstack/zsphere-types/graphql";
import { formatTime } from "@zstack/zsphere-utils";
import cls from "classnames";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { reCreateLogCollect } from "../../gql/collect-log.gql";
import DeleteModal from "./action/delete";
import { useActionConfig } from "./config";
import { getStateMap, getTypeMap } from "./constant";
import { useDownloadLogFile } from "./utils";

import style from "./style.module.less";

interface IProps {
  list: LogCollect[];
  refetch: () => void;
  setInterval: (interval: number | null) => void;
}

const CardList: React.FC<IProps> = ({ list, refetch, setInterval }) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedList, setSelectedList] = useState<LogCollect[]>([]);
  const { list: menuList, viewMap } = useActionConfig();
  const { handleDownloadFunc } = useDownloadLogFile();
  const stateMap = getStateMap(intl);
  const typeMap = getTypeMap(intl);

  const hasAllDeleteAuth = hasAuth({
    type: "action",
    authKey: "delete.all.log",
    resource: "log.collect",
  });

  const getLogType = (type: string): string => {
    const typeList = type?.split(",");
    if (typeList?.length === typeMap.size) {
      return intl.formatMessage({ id: "all.log", defaultMessage: "All Logs" });
    }
    const typeTextList = typeList?.map((_type: string) => typeMap.get(_type));
    return `${intl.formatMessage({
      id: "specified.log",
      defaultMessage: "Specific Log",
    })}（${typeTextList?.join("，")}）`;
  };

  const onReCreate = async (uuid: string) => {
    const payload: ReCreateLogCollectPayload = { uuid };
    doAction({
      mutation: reCreateLogCollect,
      payload,
      name: intl.formatMessage({
        id: "recollect.log",
        defaultMessage: "Recollect Log",
      }),
      total: 1,
      type: "LogCollect",
      onFinish: () => {
        setInterval(null);
        refetch?.();
      },
    });
    setInterval(1000);
  };

  //需过滤掉Running状态
  const showAlert: boolean = useMemo(
    () =>
      list.filter((item) => item.state !== LogCollectState.RUNNING).length >= 3,
    [list],
  );

  const getBasicInfoList = (item: LogCollect): ListItem[] => {
    const { state, createDate, uuid, url, type, startTime, endTime } =
      item ?? {};
    return [
      {
        label: intl.formatMessage({
          id: "collect.state",
          defaultMessage: "Collection Status",
        }),
        value: (
          <div className={style.textItem}>
            <span>{stateMap.get(state)}</span>
            {state === LogCollectState.FAILED && (
              <span className={style.btn} onClick={() => onReCreate(uuid!)}>
                {intl.formatMessage({
                  id: "recreate.collect",
                  defaultMessage: "Recollect",
                })}
              </span>
            )}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "log.type",
          defaultMessage: "Log Type",
        }),
        value: getLogType(type!),
      },
      {
        label: intl.formatMessage({
          id: "timeRange",
          defaultMessage: "Time Range",
        }),
        value: `${formatTime(Number(startTime))} ~ ${formatTime(Number(endTime))}`,
      },
      {
        label: intl.formatMessage({
          id: "download.url",
          defaultMessage: "Download URL",
        }),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "download.url.tip",
              defaultMessage: "### Download URL\n\nTo download collected logs via URL, make sure the download environment has network access to the platform management network.",
            })}
          </ReactMarkdown>
        ),
        value: url ? (
          <div className={style.textItem}>
            <CopyableText>{url}</CopyableText>
            <span
              onClick={() => handleDownloadFunc(url!)}
              className={style.btn}
            >
              {intl.formatMessage({ id: "download", defaultMessage: "Download" })}
            </span>
          </div>
        ) : (
          intl.formatMessage({ id: "none", defaultMessage: "None" })
        ),
      },
      {
        label: "UUID",
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "createTime",
          defaultMessage: "Creation Time",
        }),
        value: formatTime(Number(createDate)),
      },
    ];
  };

  return (
    <>
      <div className={cls("zsv-list-padding", style.main)}>
        <div className={`flex flex-col gap-3 ${style.container}`}>
          {/* 横幅 */}
          {showAlert && (
            <Alert
              className={style.alert}
              message={intl.formatMessage({
                id: "log.exceed.limit.info",
                defaultMessage:
                  "The platform supports a maximum of three collected logs. To collect new logs, delete existing ones as needed.",
              })}
              type="warning"
              display="blockStrong"
              closable
              guideAction={
                hasAllDeleteAuth
                  ? {
                      text: intl.formatMessage({
                        id: "delete.all.log",
                        defaultMessage: "Delete All Logs",
                      }),
                      onClick: () => {
                        setDeleteModalVisible(true);
                        setSelectedList(list);
                      },
                    }
                  : undefined
              }
            />
          )}
          {/* 操作 */}
          <Action
            menuList={menuList}
            viewMap={viewMap}
            view="virtualization.main"
            position="toolbar"
            selectedList={list}
            refetch={refetch}
            source={{ setInterval }}
          />
          {/* 卡片 */}
          {list?.map((item: LogCollect) => {
            return (
              <DraggableCard
                isList={true}
                title={item?.name}
                key={item?.uuid}
                className={style.card}
                titleActions={[
                  {
                    icon: "download",
                    tooltip: intl.formatMessage({
                      id: "download",
                      defaultMessage: "Download",
                    }),
                    authKey: "download",
                    resource: "log.collect",
                    onClick: () => handleDownloadFunc(item?.url ?? ""),
                    disabled: item?.state !== LogCollectState.SUCCESS,
                  },
                  {
                    icon: "trash",
                    tooltip: intl.formatMessage({
                      id: "delete",
                      defaultMessage: "Delete",
                    }),
                    authKey: "delete",
                    resource: "log.collect",
                    onClick: () => {
                      setDeleteModalVisible(true);
                      setSelectedList([item]);
                    },
                    disabled: item?.state === LogCollectState.RUNNING,
                  },
                ]}
              >
                <List list={getBasicInfoList(item)} bordered={false} />
              </DraggableCard>
            );
          })}
        </div>
      </div>
      <DeleteModal
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        refetch={refetch}
      />
    </>
  );
};

export default CardList;
