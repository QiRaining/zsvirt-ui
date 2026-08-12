import { Tooltip } from "@zstack/design";
import { InfoPopover } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard, useAuth } from "@zstack/zsphere-components";
import type {
  AccountQuotaUsage,
  AccountVO as IAccount,
} from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import type { FC } from "react";
import { useMemo, useState, useCallback } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import type { QuotaConfig } from "../../../quota";
import { useQuota } from "../../../quota";
import SetQuotaModal from "../../action/set-quota";

import style from "./style.module.less";

interface IProps {
  detail: IAccount;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch: any;
}

const QuotaInfo: FC<IProps> = ({
  detail,
  refetch,
  onCollapseChange,
  collapsed,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const quotaConfig: QuotaConfig = useQuota();

  const quota = detail?.accountQuotaInfo?.usages ?? [];

  const [visible, setVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(0);

  const quotaMap = useMemo(() => {
    const map: Record<string, AccountQuotaUsage & { percent: number }> = {};
    quota.forEach((item: AccountQuotaUsage) => {
      map[item.name] = {
        ...item,
        percent: (item.used! / item.total!) * 100,
      };
    });
    return map;
  }, [quota]);

  const detailInfo = useMemo(
    () => [
      {
        name: intl.formatMessage({
          id: "computingResource",
          defaultMessage: "Compute Resource",
        }),
        list: [
          "vm.totalNum",
          "vm.num",
          "vm.cpuNum",
          "vm.memorySize",
          "affinitygroup.num",
          "gpu.num",
          "pci.num",
        ],
      },
      {
        name: intl.formatMessage({
          id: "image.storage",
          defaultMessage: "Image Storage",
        }),
        list: ["image.num", "image.size"],
      },
      {
        name: intl.formatMessage({
          id: "data.storage",
          defaultMessage: "Data Storage",
        }),
        list: ["volume.data.num", "volume.capacity"],
      },
      {
        name: intl.formatMessage({
          id: "networkResource",
          defaultMessage: "Network Resource",
        }),
        list: ["l3.num", "securityGroup.num"],
      },
      {
        name: intl.formatMessage({ id: "other", defaultMessage: "Other" }),
        list: [
          "snapshot.volume.num",
          "volume.backup.num",
          "scheduler.num",
          "scheduler.trigger.num",
          "zwatch.alarm.num",
          "zwatch.event.num",
          "sns.endpoint.num",
          "tag2.tag.num",
        ],
      },
    ],
    [intl],
  );

  const filteredDetailInfo = useMemo(
    () =>
      detailInfo.filter((item) => {
        item.list = item.list.filter((it) => {
          const auth = _.get(quotaConfig, [it, "auth"]);
          return !auth || hasAuth(auth);
        });
        return item.list.length > 0;
      }),
    [detailInfo, quotaConfig, hasAuth],
  );

  const editQuota = useCallback((index: number) => {
    setEditIndex(index);
    setVisible(true);
  }, []);

  const list: ListItem[] = useMemo(() => {
    return filteredDetailInfo.map((item, index) => ({
      label: item.name,
      defaultVisible: index === 0,
      value: (
        <>
          {intl.formatMessage(
            { id: "resource.quota.num", defaultMessage: "Quota Items: {num}" },
            { num: item.list.length },
          )}
          <Tooltip
            className={style.tootlip}
            title={intl.formatMessage({ id: "modify", defaultMessage: "Edit" })}
          >
            <Icon
              id={item.name}
              className={style["edit-icon"]}
              type="edit"
              onClick={(e) => {
                e.stopPropagation();
                editQuota(index);
              }}
            />
          </Tooltip>
        </>
      ),
      children: item.list.map((_quota) => {
        const { unit = "count", name, info } = quotaConfig[_quota] ?? {};
        const value = quotaMap[_quota];
        return {
          label: (
            <>
              {name}
              {info && (
                <InfoPopover content={<ReactMarkdown>{info}</ReactMarkdown>} />
              )}
            </>
          ),
          value: value
            ? unit === "byte"
              ? `${formatBytesToSize(value?.used)}/${formatBytesToSize(value?.total)}`
              : `${value.used} / ${value.total}`
            : "-",
        };
      }),
    }));
  }, [intl, filteredDetailInfo, quotaMap, editQuota, quotaConfig]);

  const memoizedSelectedList = useMemo<[IAccount]>(() => [detail], [detail]);

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "subAccountQuota",
          defaultMessage: "User Quota",
        })}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <SetQuotaModal
        visible={visible}
        setVisible={setVisible}
        refetch={refetch}
        quotaList={filteredDetailInfo[editIndex]?.list}
        typeName={filteredDetailInfo[editIndex]?.name}
        selectedList={memoizedSelectedList}
        position="header"
        view="detail"
      />
    </>
  );
};

export default QuotaInfo;
