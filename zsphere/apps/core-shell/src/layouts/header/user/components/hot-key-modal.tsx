import { InfoPopover, RadioGroup, Text } from "@zstack/design";
import { useCommandInfoMap } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useBaremetalLicenseCheck } from "@zstack/zsphere-hooks";
import { Table } from "antd";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "../../style.module.less";

export interface IHotKeyModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
}

function useShortcutTable() {
  const intl = useIntl();

  const isBaremetalAbsent = useBaremetalLicenseCheck();

  const commandInfoMap = useCommandInfoMap();
  return useMemo(() => {
    return {
      global: [
        {
          name: intl.formatMessage({ id: "dashboard", defaultMessage: "Dashboard" }),
          keyLabel: commandInfoMap.get("navigate.virtualization.dashboard")
            ?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "resource",
            defaultMessage: "Inventory",
          }),
          keyLabel: commandInfoMap.get("navigate.virtualization.resource")
            ?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "business.reliability",
            defaultMessage: "Business Reliability",
          }),
          keyLabel: commandInfoMap.get("navigate.virtualization.reliability")
            ?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "data.protection",
            defaultMessage: "Data Protection",
          }),
          keyLabel: commandInfoMap.get(
            "navigate.virtualization.data.protection",
          )?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "monitoring.om",
            defaultMessage: "O&M Management",
          }),
          keyLabel: commandInfoMap.get("navigate.virtualization.monitoring.om")
            ?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "administration",
            defaultMessage: "System Management",
          }),
          keyLabel: commandInfoMap.get("navigate.virtualization.administration")
            ?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "virtualization.host.vm",
            defaultMessage: "VM and Host",
          }),
          keyLabel: commandInfoMap
            .get("navigate.virtualization.resource.submenu")
            ?.keyLabelMap.get("virtualization.cluster.host"),
        },
        {
          name: intl.formatMessage({
            id: "virtualization.image.storage.and.template",
            defaultMessage: "Image  and Template",
          }),
          keyLabel: commandInfoMap
            .get("navigate.virtualization.resource.submenu")
            ?.keyLabelMap.get("virtualization.template.vm"),
        },
        {
          name: intl.formatMessage({
            id: "virtualization.data.storage",
            defaultMessage: "Data Storage",
          }),
          keyLabel: commandInfoMap
            .get("navigate.virtualization.resource.submenu")
            ?.keyLabelMap.get("virtualization.data.storage"),
        },
        {
          name: intl.formatMessage({
            id: "virtualization.network.resource",
            defaultMessage: "Network Resource",
          }),
          keyLabel: commandInfoMap
            .get("navigate.virtualization.resource.submenu")
            ?.keyLabelMap.get("virtualization.network"),
        },
        ...(!isBaremetalAbsent
          ? [
              {
                name: intl.formatMessage({
                  id: "virtualization.bare.metal.management",
                  defaultMessage: "Bare Metal Management",
                }),
                keyLabel: commandInfoMap
                  .get("navigate.virtualization.resource.submenu")
                  ?.keyLabelMap.get("virtualization.bare.metal"),
              },
            ]
          : []),
        {
          name: intl.formatMessage({
            id: "recycle.bin",
            defaultMessage: "Recycle Bin",
          }),
          keyLabel: commandInfoMap.get("navigate.recycle")?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "alarm.message",
            defaultMessage: "Alarm Message",
          }),
          keyLabel: commandInfoMap.get("view.alarm.message")?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "global.search",
            defaultMessage: "Global Search",
          }),
          keyLabel: commandInfoMap.get("activate.global.search")?.keyLabel,
        },
        {
          name: intl.formatMessage({
            id: "expand.collapse.footer.panel",
            defaultMessage: "Expand/Collapse Window",
          }),
          keyLabel: commandInfoMap.get("expand.collapse.footer.panel")
            ?.keyLabel,
        },
      ],
      page: [
        {
          name: intl.formatMessage({
            id: "expand.collapse.left.nav.tree",
            defaultMessage: "Expand/Collapse All",
          }),
          keyLabel: commandInfoMap.get("expand.collapse.left.nav.tree")
            ?.keyLabel,
          position: intl.formatMessage({
            id: "resource",
            defaultMessage: "Inventory",
          }),
        },
        {
          name: intl.formatMessage({
            id: "move.search.item",
            defaultMessage: "Move Search Option",
          }),
          keyLabel: commandInfoMap.get("move.global.search.selected.item")
            ?.keyLabel,
          position: intl.formatMessage({
            id: "global.search.panel",
            defaultMessage: "Search Field",
          }),
        },
        {
          name: intl.formatMessage({
            id: "switch.search.type",
            defaultMessage: "Switch Search Type",
          }),
          keyLabel: commandInfoMap.get("switch.global.search.result.type")
            ?.keyLabel,
          position: intl.formatMessage({
            id: "global.search.panel",
            defaultMessage: "Search Field",
          }),
        },
        {
          name: intl.formatMessage({
            id: "select.search.result",
            defaultMessage: "Select Search Result",
          }),
          keyLabel: commandInfoMap.get("select.global.search.result")?.keyLabel,
          position: intl.formatMessage({
            id: "global.search.panel",
            defaultMessage: "Search Field",
          }),
        },
        {
          name: intl.formatMessage({
            id: "exit.search",
            defaultMessage: "Exit Search",
          }),
          keyLabel: commandInfoMap.get("exit.global.search")?.keyLabel,
          position: intl.formatMessage({
            id: "global.search.panel",
            defaultMessage: "Search Field",
          }),
        },
      ],
    };
  }, [intl, commandInfoMap, isBaremetalAbsent]);
}

export default function HostKeyModal({
  visible,
  setVisible,
}: IHotKeyModalProps) {
  const intl = useIntl();
  const [tableType, setTableType] = useState("global");
  const { global, page } = useShortcutTable();

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: intl.formatMessage({
          id: "hotkey.function",
          defaultMessage: "Function Description",
        }),
        render: (current: any) => <Text>{current.name}</Text>,
      },
      {
        key: "keyLabel",
        title: intl.formatMessage({ id: "hotkey", defaultMessage: "Shortcut" }),
        render: (current: any) => <Text>{current.keyLabel}</Text>,
      },
      {
        key: "position",
        title: (
          <>
            {intl.formatMessage({
              id: "hotkey.position",
              defaultMessage: "Applicable Area",
            })}
            <InfoPopover
              content={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "hotkey.position.tooltip",
                    defaultMessage:
                      "### Applicable Area\n\nPress the shortcut key in the corresponding spot to swiftly perform the related action or navigate to the desired page.\n- Global shortcuts apply to all areas except pop-up windows and input scenarios.\n- Page shortcuts are only effective on specific pages or in certain scenarios.",
                  })}
                </ReactMarkdown>
              }
            />
          </>
        ),
        render: (current: any) => (
          <Text>
            {tableType !== "global"
              ? current.position
              : intl.formatMessage({
                  id: "hotkey.global",
                  defaultMessage: "Global",
                })}
          </Text>
        ),
      },
    ],
    [intl, tableType],
  );
  return (
    <DialogBase
      widthClassName="w-150"
      title={intl.formatMessage({
        id: "keyboard.shortcut",
        defaultMessage: "Keyboard Shortcuts",
      })}
      visible={visible}
      setVisible={setVisible}
      hideCancelButton
      onOk={() => setVisible(false)}
    >
      <div className={style.hotKeyModalContent}>
        <div className={style.hotKeyModalHeader}>
          <RadioGroup
            variant="button"
            value={tableType}
            onValueChange={(value) => setTableType(value)}
            options={[
              {
                value: "global",
                label: (
                  <>
                    {intl.formatMessage({
                      id: "global.hotkey",
                      defaultMessage: "Global Shortcuts",
                    })}{" "}
                    ({global.length})
                  </>
                ),
              },
              {
                value: "page",
                label: (
                  <>
                    {intl.formatMessage({
                      id: "page.hotkey",
                      defaultMessage: "Page Shortcuts",
                    })}{" "}
                    ({page.length})
                  </>
                ),
              },
            ]}
          />
        </div>
        <Table
          tableLayout="fixed"
          className="zsv-table zsv-table-height-400"
          dataSource={tableType === "global" ? global : page}
          columns={columns}
          pagination={false}
          rowKey="name"
        />
      </div>
    </DialogBase>
  );
}
