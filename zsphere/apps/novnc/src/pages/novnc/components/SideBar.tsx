// import ForceStopVMModal from '@zstack/resource-pool/src/pages/vm/action/base/force-stop-modal'
import { gql, useLazyQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import keymap from "@novnc/novnc/core/input/keysym";
import { Form, Tooltip } from "@zstack/design";
import { TextareaField, useDialogHookFormAdapter } from "@zstack/form";
import { Icon, type IconTypes } from "@zstack/icon";
import { Auth, Field, Switch } from "@zstack/zsphere-components";
import { DialogForm, DialogWeak } from "@zstack/zsphere-design-biz";
import { VmInstanceState } from "@zstack/zsphere-types";
import { Layout, Menu, Popover } from "antd";
import cs from "classnames";
import _ from "lodash-es";
import type { MenuClickEventHandler } from "rc-menu/lib/interface";
import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

const PauseVModal = React.lazy(
  () => import("zsv_resource/vm/action/base/pause-modal"),
);
const PowerOffVMModal = React.lazy(
  () => import("zsv_resource/vm/action/base/poweroff-modal"),
);
const RebootVMModal = React.lazy(
  () => import("zsv_resource/vm/action/base/reboot-modal"),
);
const ResumeVMModal = React.lazy(
  () => import("zsv_resource/vm/action/base/resume-modal"),
);
const StopVMModal = React.lazy(
  () => import("zsv_resource/vm/action/base/stop-vm-instance"),
);

import NoVncContext, { keyTable, type KeyTableItem } from "../context";
import { createNoVncPasteSchema, type NoVncPasteFormValues } from "./schema";

import style from "./style.module.less";

const vmStateQuery = gql`
  query vmInstance($uuid: String!) {
    vmInstance(uuid: $uuid) {
      uuid
      state
    }
  }
`;

const { Sider } = Layout;

const fieldProps = {
  colon: false,
  className: style.field,
};

const SettingPopContent: React.FC = () => {
  const intl = useIntl();
  const { store } = useContext(NoVncContext);

  return (
    <div className={style.settingPopContent}>
      <Field
        label={intl.formatMessage({
          id: "readonly",
          defaultMessage: "Read Only",
        })}
        {...fieldProps}
        className={cs(style.field, style.switch)}
      >
        <Switch
          defaultChecked={store?.rfbOptions?.viewOnly}
          onChange={(checked: boolean) => {
            store?.rfbControl?.viewOnly(checked);
          }}
        />
      </Field>
      {/* <Field
        label={intl.formatMessage({
          id: 'quality',
          defaultMessage: '画质'
        })}
        {...fieldProps}
      >
        <Slider
          min={0}
          max={9}
          defaultValue={store?.rfbOptions?.quality}
          onChange={(value: number) => {
            store?.rfbControl?.qualityLevel(value)
          }}
          className={style.slider}
        />
      </Field>

      <Field
        label={intl.formatMessage({
          id: 'compressionLevel',
          defaultMessage: '压缩等级'
        })}
        {...fieldProps}
      >
        <Slider
          min={0}
          max={9}
          defaultValue={store?.rfbOptions?.compressionLevel}
          onChange={(value: number) => {
            store?.rfbControl?.compressionLevel(value)
          }}
          className={style.slider}
        />
      </Field> */}
    </div>
  );
};

interface ConfirmCtrlAltDelModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const ConfirmCtrlAltDelModal: React.FC<ConfirmCtrlAltDelModalProps> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();

  const { store } = React.useContext(NoVncContext);

  return (
    <DialogWeak
      title={intl.formatMessage({
        id: "ctrl.alt.del.tip",
        defaultMessage: "Press Ctrl+Alt+Del?",
      })}
      type="warning"
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        setVisible(false);
        store?.rfbControl?.sendCtrlAltDel();
      }}
      description={
        <div className={style.confirmContent}>
          {intl.formatMessage({
            id: "ctrl.alt.del.tip.message",
            defaultMessage:
              "Rebooting the VM system will temporarily interrupt business. Proceed with caution.",
          })}
        </div>
      }
    />
  );
};

const PowerPopContent: React.FC = () => {
  const intl = useIntl();
  const [vmState, setVmState] = useState("Running");
  const { store, setStore } = React.useContext(NoVncContext);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [rebootModalVisible, setRebootModalVisible] = useState(false);
  const [recoverModalVisible, setRecoverModalVisible] = useState(false);
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [powerOffModalVisible, setPoverOffModalVisible] = useState(false);
  const { options } = store ?? {};

  const [queryVM, { data: vmData }] = useLazyQuery(vmStateQuery, {
    variables: {
      uuid: options?.uuid,
    },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    queryVM({
      variables: {
        uuid: options?.uuid,
      },
    });
  }, []);

  useEffect(() => {
    setVmState(vmData?.vmInstance?.state);
  }, [vmData]);

  const data = [
    {
      title: options?.desktopName,
      name: options?.desktopName,
      uuid: options?.uuid,
      ip: options?.ip,
      platform: options?.platform?.toLowerCase() ?? "file",
    },
  ];

  const actionList = useMemo(() => {
    //   const vmState = vmData?.vmInstance?.state ?? 'Running'
    return [
      {
        title: intl.formatMessage({
          id: "novnc.stop",
          defaultMessage: "Shut down",
        }),
        onClick: () => {
          setStopModalVisible(true);
        },
        enable: ["Running", "Crashed"].indexOf(vmState || "") >= 0,
      },
      {
        title: intl.formatMessage({
          id: "novnc.reboot",
          defaultMessage: "Restart",
        }),
        onClick: () => setRebootModalVisible(true),
        enable: _.includes(
          [
            VmInstanceState.Running,
            VmInstanceState.Crashed,
            VmInstanceState.NoState,
          ],
          vmState,
        ),
      },
      {
        title: intl.formatMessage({
          id: "novnc.resume",
          defaultMessage: "Recovery",
        }),
        onClick: () => setRecoverModalVisible(true),
        enable: ["paused", "Paused"].indexOf(vmState || "") >= 0,
      },
      {
        title: intl.formatMessage({
          id: "novnc.pause",
          defaultMessage: "Pause",
        }),
        onClick: () => setPauseModalVisible(true),
        enable: ["Running", "Crashed"].indexOf(vmState || "") >= 0,
      },
      {
        title: intl.formatMessage({
          id: "novnc.poweroff",
          defaultMessage: "Power off",
        }),
        onClick: () => setPoverOffModalVisible(true),
        enable: _.includes(
          [
            VmInstanceState.Running,
            VmInstanceState.Paused,
            VmInstanceState.Crashed,
          ],
          vmState,
        ),
      },
    ];
  }, [vmState, intl]);

  return (
    <>
      <div className={style.wrenchPopContent}>
        {actionList.map((item) => {
          const { title, onClick, enable } = item;
          return (
            <div
              key={title}
              className={enable ? style.menuItem : style.menuItemDisable}
              onClick={() => {
                if (!enable) {
                  return;
                }
                onClick();
                setStore?.((pre: any) => {
                  return { ...pre, actionModalVisible: true };
                });
              }}
            >
              {title}
            </div>
          );
        })}
      </div>
      <Suspense fallback={null}>
        <StopVMModal
          visible={stopModalVisible}
          setVisible={setStopModalVisible}
          selectedList={data as any}
          refetch={() =>
            queryVM({
              variables: {
                uuid: options?.uuid,
              },
            })
          }
          view=""
          position="row"
        />
        <RebootVMModal
          visible={rebootModalVisible}
          setVisible={setRebootModalVisible}
          selectedList={data as any}
          refetch={() =>
            queryVM({
              variables: {
                uuid: options?.uuid,
              },
            })
          }
          view=""
          position="row"
        />
        <ResumeVMModal
          visible={recoverModalVisible}
          setVisible={setRecoverModalVisible}
          selectedList={data as any}
          refetch={() =>
            queryVM({
              variables: {
                uuid: options?.uuid,
              },
            })
          }
          view=""
          position="row"
        />
        <PauseVModal
          visible={pauseModalVisible}
          setVisible={setPauseModalVisible}
          selectedList={data as any}
          refetch={() =>
            queryVM({
              variables: {
                uuid: options?.uuid,
              },
            })
          }
          view=""
          position="row"
        />
        <PowerOffVMModal
          visible={powerOffModalVisible}
          setVisible={setPoverOffModalVisible}
          selectedList={data as any}
          view=""
          refetch={() =>
            queryVM({
              variables: {
                uuid: options?.uuid,
              },
            })
          }
          position="row"
        />
      </Suspense>
    </>
  );
};

const WrenchPopContent: React.FC = () => {
  const { store, setStore } = React.useContext(NoVncContext);
  const [visible, setVisible] = React.useState(false);
  const onClick =
    ({ down, key }: KeyTableItem) =>
    () => {
      const keyItem = keyTable.find((k) => k.key === key)!;
      const rfbPressedKeys = store?.rfbPressedKeys ?? [];
      let _down;
      if (down) {
        const index = rfbPressedKeys.indexOf(key);
        _down = !(index > -1);

        if (index > -1) {
          rfbPressedKeys.splice(index, 1);
        } else {
          rfbPressedKeys.push(key);
        }
      }

      if (key === "ctrlaltdel") {
        if (store?.options?.platform?.toLocaleLowerCase() !== "windows") {
          setVisible(true);
        } else {
          store?.rfbControl?.sendCtrlAltDel();
        }
      } else {
        store?.rfbControl?.keyClick(keyItem.keysym, keyItem.code, _down);

        setStore?.((pre) => ({
          ...pre,
          rfbPressedKeys,
        }));
      }
    };

  return (
    <>
      <ConfirmCtrlAltDelModal visible={visible} setVisible={setVisible} />
      <div className={style.wrenchPopContent}>
        {keyTable.map((item) => {
          const { key, text } = item;
          const selected = store?.rfbPressedKeys?.includes(key);
          return (
            <div
              key={key}
              className={cs(selected && style.selected, style.menuItem)}
              onClick={onClick(item)}
            >
              {text}
              {selected && (
                <Icon type="checkmark" className={style.checkmark} size={14} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export const PastePopUp: React.FC<{
  onOk?: any;
  visible: any;
  setVisible?: any;
  onCancel?: any;
}> = ({ onOk, visible, setVisible, onCancel }) => {
  const intl = useIntl();
  const defaultValues = useMemo<NoVncPasteFormValues>(
    () => ({
      text: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createNoVncPasteSchema(intl), [intl]);
  const form = useForm<NoVncPasteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const _onOk = (values: NoVncPasteFormValues) => {
    onOk(values.text);
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "vnc.paste",
        defaultMessage: "Paste command",
      })}
      alertType="warning"
      alertMessage={intl.formatMessage({
        id: "vnc.paste.info",
        defaultMessage:
          "The command you paste must be 1 to 2,000 characters in length. Note that Chinese characters and other non-standard keycode values.",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={_onOk}
      onCancel={onCancel}
    >
      <Form {...form}>
        <TextareaField
          form={form}
          name="text"
          required
          label={intl.formatMessage({
            id: "vnc.paste.content",
            defaultMessage: "Command text content",
          })}
          rows={8}
          className={style["height-200"]}
          limit={2000}
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export const PastePopContent: React.FC<{ children?: any; onOk?: Function }> = ({
  children,
}) => {
  const [visible, setVisible] = React.useState(false);
  const { store } = React.useContext(NoVncContext);

  const onOk = async (text: any) => {
    store?.rfbControl?.keyClick(
      keymap.XK_Shift_L as number,
      "XK_Shift_L",
      false,
    );
    const sleep = (milliseconds: number) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    const send = async (letter: string) => {
      const keynum = keymap[`XK_${letter}`] as number;
      if (letter.match(/[0-9a-zA-Z]/)) {
        store?.rfbControl?.keyClick(keynum, letter);
      } else if (letter.match(/\n/)) {
        store?.rfbControl?.keyClick(keymap.XK_Return);
      } else if (letter.match(/[`[\]\\;',./\-= ]/)) {
        store?.rfbControl?.keyClick(letter.charCodeAt(0), letter);
      } else if (letter.match(/[~`!@#$%^&*()-_+={}[\]|\\/:;"'<>,.?]/)) {
        store?.rfbControl?.keyClick(
          keymap.XK_Shift_L as number,
          "XK_Shift_L",
          true,
        );
        await sleep(30);
        store?.rfbControl?.keyClick(letter.charCodeAt(0), letter);
        await sleep(30);
        store?.rfbControl?.keyClick(
          keymap.XK_Shift_L as number,
          "XK_Shift_L",
          false,
        );
      }
    };
    let count = 0;
    for (const letter of text) {
      await sleep(30);
      await send(letter);
      if (count >= 50) {
        count = 0;
        await sleep(1000);
      }
      count += 1;
    }
    store?.rfbControl?.focus();
  };

  const onCancel = () => {};

  return (
    <>
      {children && (
        <div
          style={{ width: "100%", height: "100%" }}
          onClick={() => setVisible(!visible)}
        >
          {children}
        </div>
      )}
      <PastePopUp
        onCancel={onCancel}
        onOk={onOk}
        visible={visible}
        setVisible={setVisible}
      />
    </>
  );
};

const NoVncSideBar: React.FC = () => {
  const { store } = React.useContext(NoVncContext);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [contentOpen, setContentOpen] = useState<boolean>(false);

  const intl = useIntl();

  const menus: {
    iconType: IconTypes;
    popContent?: React.FC;
    modelContent?: React.FC;
    toolTip?: string;
    isActionsItem?: boolean;
    authKey?: string;
  }[] = [
    // {
    //   iconType: 'move',
    //   toolTip: intl.formatMessage({
    //     id: 'drag',
    //     defaultMessage: '拖拽'
    //   })
    // },
    {
      iconType: "file-paste",
      modelContent: PastePopContent,
      toolTip: intl.formatMessage({
        id: "paste.tools",
        defaultMessage: "Local Command Paster",
      }),
      authKey: "virtualization.console.shortcut.paste",
    },
    {
      iconType: "wrench",
      popContent: WrenchPopContent,
      toolTip: intl.formatMessage({
        id: "exec.tools",
        defaultMessage: "Tools",
      }),
      authKey: "virtualization.console.shortcut.command",
    },
    {
      iconType: "power",
      popContent: PowerPopContent,
      toolTip: intl.formatMessage({
        id: "power.management",
        defaultMessage: "Power Management",
      }),
      isActionsItem: true,
      authKey: "virtualization.console.shortcut.power",
    },
    {
      iconType: "settings",
      popContent: SettingPopContent,
      toolTip: intl.formatMessage({
        id: "settings",
        defaultMessage: "Settings",
      }),
      authKey: "virtualization.console.shortcut.settings",
    },
  ];

  const onSelect = useCallback<MenuClickEventHandler>(
    ({ key }) => {
      if (key === "move") {
        store?.rfbControl?.dragViewport(true);
      }

      setSelectedKeys([key as string]);
    },
    [store?.rfbControl],
  );
  const onDeselect = useCallback<MenuClickEventHandler>(
    ({ key }) => {
      if (key === "move") {
        store?.rfbControl?.dragViewport(false);
      }

      setSelectedKeys([]);
    },
    [store?.rfbControl],
  );

  useEffect(() => {
    if (store?.actionModalVisible) {
      setContentOpen(false);
    }
  }, [store]);

  return (
    <Sider className={style.noVncSideBar} width={48}>
      <Menu
        selectable
        className={style.menu}
        multiple
        selectedKeys={selectedKeys}
        onSelect={onSelect}
        onDeselect={onDeselect}
      >
        {menus.map(
          ({
            iconType,
            popContent,
            toolTip,
            modelContent,
            isActionsItem = false,
            authKey,
          }) => {
            const IconButton = (
              <Tooltip title={toolTip} placement="right">
                <div className={style.iconBtn}>
                  <Icon
                    type={iconType}
                    color="neutral"
                    colorNumber={0}
                    size={20}
                  />
                </div>
              </Tooltip>
            );

            let Content: React.ReactNode;

            if (modelContent) {
              Content = <PastePopContent>{IconButton}</PastePopContent>;
            } else if (isActionsItem) {
              Content = (
                <Popover
                  placement="rightTop"
                  overlayClassName={style.overlayClassName}
                  content={popContent}
                  trigger="click"
                  visible={contentOpen}
                  onVisibleChange={(e) => setContentOpen(e)}
                >
                  <div style={{ width: "100%", height: "100%" }}>
                    {IconButton}
                  </div>
                </Popover>
              );
            } else if (popContent) {
              Content = (
                <Popover
                  placement="rightTop"
                  overlayClassName={style.overlayClassName}
                  content={popContent}
                  trigger="click"
                >
                  <div style={{ width: "100%", height: "100%" }}>
                    {IconButton}
                  </div>
                </Popover>
              );
            } else {
              Content = IconButton;
            }

            const menuItem = <Menu.Item key={iconType}>{Content}</Menu.Item>;

            if (authKey) {
              return (
                <Auth
                  key={iconType}
                  resource="vm"
                  type="action"
                  authKey={authKey}
                >
                  {menuItem}
                </Auth>
              );
            }

            return menuItem;
          },
        )}
      </Menu>
    </Sider>
  );
};

export default NoVncSideBar;
