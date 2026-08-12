import { useLazyQuery, useMutation, useQuery, gql } from "@apollo/client";
import {
  Alert,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Illustrations } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type {
  GetCurrentTime,
  AccountVO as IAccount,
} from "@zstack/zsphere-types/graphql";
import { useBoolean, useInterval } from "ahooks";
import dayjs from "dayjs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { getCurrentTime, logOut } from "../../../gql/user.gql";
import { PREDEFINED_OTHER_UUID, transformRoleName } from "../../constant";
import { useUserIdentity } from "../hooks/use-user-identity";
import ChangePasswordModal from "./actions/change-password";
import HostKeyModal from "./components/hot-key-modal";
import ToggleLanguage from "./components/toggle-language";
import { shouldRenderAccountLanguageMenuItem } from "./utils";

import style from "../style.module.less";

type IProps = Record<string, never>;

const ACCOUNT_LIST = gql`
  query accountList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: AccountQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    accountList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        description
        type
        state
        accountQuotaInfo {
          volumeNum
          usages {
            name
            total
            used
          }
        }
        vmNum
        volumeNum
        role {
          uuid
          name
          type
        }
        roleFromAccountGroup {
          uuid
          name
          type
        }
        createDate
        lastOpDate
      }
      total
    }
  }
`;

// 更新时间
const useUpdateTime = (startTime?: number) => {
  const [currentTime, setCurrentTime] = useState(startTime);
  const [interval, setIntervalValue] = useState<number | null>(null);
  const browserServerTimeDiff = useRef(0);
  const setCurrentTimeAndTimeDiff = useCallback((value?: number) => {
    setCurrentTime(value);
    browserServerTimeDiff.current = value ? Date.now() - value : 0;
  }, []);
  useInterval(
    () => {
      if (currentTime) {
        setCurrentTime(Date.now() - browserServerTimeDiff.current);
      }
    },
    interval,
    { immediate: true },
  );
  useEffect(() => {
    return () => {
      setIntervalValue(null);
    };
  }, []);
  return {
    currentTime,
    setCurrentTime: setCurrentTimeAndTimeDiff,
    setIntervalValue,
  };
};

const useRoleText = () => {
  const intl = useIntl();
  // 分开订阅，避免订阅整个 currentUser 对象
  const IAM1 = usePlatformStore((state) => state.currentUser?.IAM1);
  const systemRoles = IAM1?.systemRoles ?? [];

  const { isSystemAdmin, isPlatformAdmin } = useUserIdentity();
  const roleText = useMemo(() => {
    if (isSystemAdmin) {
      return intl.formatMessage({
        id: "superAccount",
        defaultMessage: "Super Admin",
      });
    }
    if (isPlatformAdmin) {
      const filterOther = systemRoles?.filter(
        (role: { uuid: string }) => role.uuid !== PREDEFINED_OTHER_UUID,
      );
      //三员的情况
      if (filterOther.length > 0) {
        return filterOther.map((role: { uuid: string; name: string }) =>
          transformRoleName(intl, role, false),
        );
      }
      return intl.formatMessage({
        id: "admin.user",
        defaultMessage: "Admin User",
      });
    }
    return intl.formatMessage({ id: "subAccount", defaultMessage: "Regular User" });
  }, [intl, systemRoles, isSystemAdmin, isPlatformAdmin]);

  return {
    roleText,
  };
};

// 提取到组件外部，避免每次渲染时重新创建 (rendering-hoist-jsx)
const useRoleAvatar = () => {
  const systemView = usePlatformStore((state) => state.systemView);
  try {
    return systemView === "Admin"
      ? Illustrations["admin2"]
      : Illustrations["account"];
  } catch (e) {
    console.warn("Failed to load avatar image:", e);
    return null;
  }
};

const User: React.FC<IProps> = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const avatar = useRoleAvatar();
  const [timeDiffOver1min, { toggle }] = useBoolean(false);

  // 分开订阅每个状态字段，避免订阅整个 store
  const currentUser = usePlatformStore((state) => state.currentUser);
  const systemView = usePlatformStore((state) => state.systemView);
  const userType = usePlatformStore((state) => state.userType);

  const { data: platformTime, refetch: refetchCurrentTime } = useQuery<{
    getCurrentTime: GetCurrentTime;
  }>(getCurrentTime);

  const { currentTime, setCurrentTime, setIntervalValue } = useUpdateTime();

  const [queryAccount, { data }] = useLazyQuery(ACCOUNT_LIST);
  const { list = [] } = data?.accountList ?? {};
  const currentAccount: IAccount = list?.[0] ?? {};
  const userUuid = currentUser?.userUuid;

  useEffect(() => {
    if (userUuid) {
      queryAccount({
        variables: {
          conditions: [
            {
              key: "uuid",
              value: userUuid,
            },
          ],
        },
      });
    }
  }, [userUuid, queryAccount]);

  const updatePlatformTime = useMemo(() => {
    return dayjs(currentTime).format("YYYY-MM-DD HH:mm:ss");
  }, [currentTime]);
  useEffect(() => {
    const time =
      platformTime?.getCurrentTime?.currentTime.MillionSeconds || Date.now();
    if (time) {
      toggle(Math.abs(Date.now() - time) >= 60 * 1000);
      setCurrentTime(time);
    }
  }, [platformTime, setCurrentTime, toggle]);

  const [_logOut] = useMutation(logOut);

  const [changePasswordVisible, setChangePasswordVisible] =
    useState<boolean>(false);
  const [hotKeyVisible, setHotKeyVisible] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const { roleText } = useRoleText();

  const isThirdPartyAccount = useMemo(
    () => currentAccount.type === "ThirdParty",
    [currentAccount],
  );

  return (
    <div className={style.user} ref={ref}>
      <DropdownMenu
        open={dropdownVisible}
        onOpenChange={(visible: boolean) => {
          if (!visible) {
            setIntervalValue(null);
          }
          if (visible) {
            refetchCurrentTime();
            setIntervalValue(1000);
          }
          setDropdownVisible(visible);
        }}
      >
        <DropdownMenuTrigger asChild>
          <div
            className={`${style.avatar} ${dropdownVisible ? style.hover : ""}`}
          >
            <div className="relative inline-flex">
              <img
                alt="admin"
                src={avatar ?? undefined}
                style={{ cursor: "pointer" }}
              />
              {timeDiffOver1min && systemView === "Admin" && (
                <span className="bg-danger-500 absolute top-0 right-0 h-2 w-2 rounded-full" />
              )}
            </div>
            <span className={style.username}>{currentUser?.username}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={style.dropdown}
          align="end"
          open={dropdownVisible}
        >
          <DropdownMenuLabel
            className={`${style.account} flex items-center`}
            style={{ marginBottom: "12px" }}
          >
            <img
              alt="admin"
              src={avatar ?? undefined}
              className="mr-2.5 h-10 w-10 shrink-0 rounded-full"
            />
            <div>
              <div className={style.username}>{currentUser?.username}</div>
              <div className={style.role}>{roleText}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuItem
            className={style.timer}
            style={{
              cursor: systemView === "Admin" ? "pointer" : "default",
            }}
            onSelect={(e) => {
              if (systemView === "Admin") {
                navigate("/virtualization-administration/time-server");
              } else {
                e.preventDefault();
              }
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                gap: "24px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <Icon style={{ marginRight: "8px" }} type="clock" />
                {intl.formatMessage({
                  id: "platform.time",
                  defaultMessage: "Platform Time",
                })}
              </span>
              <span className={style.timeText}>{updatePlatformTime}</span>
            </div>
          </DropdownMenuItem>
          {timeDiffOver1min && systemView === "Admin" && (
            <>
              <DropdownMenuLabel className={style.timer}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    gap: "24px",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <Icon style={{ marginRight: "8px" }} type="clock" />
                    {intl.formatMessage({
                      id: "browser.time",
                      defaultMessage: "Browser Time",
                    })}
                  </span>
                  <span className={style.timeText}>
                    {dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss")}
                  </span>
                </div>
              </DropdownMenuLabel>
              <div style={{ margin: "0 12px" }}>
                <Alert variant="danger" className={style.inDropdownAlert}>
                  {systemView === "Admin"
                    ? intl.formatMessage({
                        id: "time.different.admin.alert",
                        defaultMessage:
                          "The platform and browser time are not synchronized. To use the Cloud properly, synchronize the time and restart the browser as soon as possible.",
                      })
                    : intl.formatMessage({
                        id: "time.different.normal.alert",
                        defaultMessage:
                          "The platform and browser time are not synchronized. To use the Cloud properly, contact the administrator to synchronize the time and restart the browser as soon as possible.",
                      })}
                </Alert>
              </div>
            </>
          )}
          <DropdownMenuSeparator className={style.divider} />
          {shouldRenderAccountLanguageMenuItem() && (
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ToggleLanguage />
            </DropdownMenuItem>
          )}
          {userType !== "external" && !isThirdPartyAccount && (
            <DropdownMenuItem
              onSelect={() => {
                setChangePasswordVisible(true);
                setIntervalValue(null);
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <Icon style={{ marginRight: "8px" }} type="lock" />
                {intl.formatMessage({
                  id: "modify.password",
                  defaultMessage: "Change Password",
                })}
              </span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onSelect={() => {
              setHotKeyVisible(true);
              setIntervalValue(null);
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <Icon style={{ marginRight: "8px" }} type="grid" />
              {intl.formatMessage({
                id: "keyboard.shortcut",
                defaultMessage: "Keyboard Shortcuts",
              })}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className={style.divider} />
          <DropdownMenuItem
            onSelect={() => {
              _logOut({
                variables: {
                  input: {
                    sessionUuid: localStorage.getItem("sessionId"),
                  },
                },
              }).finally(() => {
                localStorage.removeItem("currentUser");
                localStorage.removeItem("currentZone");
                localStorage.removeItem("loginType");
                localStorage.removeItem("TOKEN");
                sessionStorage.clear();
                localStorage.removeItem("agentVoucher");
                window.g_main?.apolloClient?.resetStore();
                // 统一使用 window.location.replace 强制刷新页面，确保所有组件和微前端应用完全卸载
                // 使用 replace 而不是 href，避免在浏览器历史中留下记录
                window.location.replace("/login");
              });
            }}
          >
            <span style={{ display: "flex", alignItems: "center" }}>
              <Icon style={{ marginRight: "8px" }} type="log-out" />
              {intl.formatMessage({ id: "logout", defaultMessage: "Logout" })}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {changePasswordVisible && (
        <ChangePasswordModal
          visible={changePasswordVisible}
          setVisible={setChangePasswordVisible}
        />
      )}
      {hotKeyVisible && (
        <HostKeyModal visible={hotKeyVisible} setVisible={setHotKeyVisible} />
      )}
    </div>
  );
};

export default User;
