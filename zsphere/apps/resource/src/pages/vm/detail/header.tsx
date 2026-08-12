import { Text } from "@zstack/design";
import {
  DetailBreadcrumb,
  Header,
  Action,
  Alert,
  Tag,
  useAuth,
  useShare,
} from "@zstack/zsphere-components";
import { VmInstanceState } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
import useListenVncDisconnect from "../hooks/use-listen-vnc-disconnect";
import { ConsoleScreenshot } from "./console-screenshot";

import styles from "./style.module.less";

const STYLE_MARGIN_TOP_15 = { margin: "15px 24px 0" } as const;

interface IProps {
  current: IVM;
  refetch: any;
}

const DetailHeader: React.FC<IProps> = ({ current, refetch }) => {
  const { name = "" } = current ?? {};
  const intl = useIntl();
  const { hasAuth } = useAuth();
  useListenVncDisconnect();

  const showAlert = useMemo(
    () => current.state === VmInstanceState.VolumeRecovering,
    [current],
  );

  const hasOpenConsoleAuth = hasAuth({
    authKey: "virtualization.console",
    resource: "vm",
    type: "action",
  });

  const { list: menuList, viewMap } = useActionConfig();
  const { isShareResource } = useShare();

  const memoizedSelectedList = useMemo(() => [current], [current]);

  const acionEl = useMemo(
    () => (
      <Header.Detail
        icon={hasOpenConsoleAuth ? <></> : "monitor"}
        title={
          <div className="flex items-center gap-2">
            <Text>{name}</Text>
            {isShareResource([current]) ? (
              <Tag
                round
                size="small"
                level="weak"
                className={styles.tag}
                style={{ verticalAlign: "text-bottom" }}
              >
                {intl.formatMessage({
                  id: "sharedResource",
                  defaultMessage: "Share Resource",
                })}
              </Tag>
            ) : null}
          </div>
        }
        actions={
          <Action
            view="virtualization.main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            selectedList={memoizedSelectedList}
          />
        }
      />
    ),
    [
      hasOpenConsoleAuth,
      name,
      viewMap,
      current,
      menuList,
      refetch,
      intl,
      memoizedSelectedList,
    ],
  );

  return (
    <>
      {showAlert && (
        <Alert
          type="info"
          display="blockStrong"
          style={STYLE_MARGIN_TOP_15}
          message={intl.formatMessage({
            id: "volumerecovering.vm.tooltip",
            defaultMessage:
              "Restoring CDP data now. Only the Launch Console operation is supported.",
          })}
        />
      )}
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <div className={styles.headerDetail}>
        {hasOpenConsoleAuth && <ConsoleScreenshot current={current} />}
        {acionEl}
      </div>
    </>
  );
};

export default DetailHeader;
