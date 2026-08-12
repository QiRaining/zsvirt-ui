import { Text, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { ZSVForm } from "@zstack/zsphere-components";
import { Tabs } from "antd";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import SelectImage from "./components/SelectImage";
import SelectL2Network from "./components/SelectL2Network";
import SelectL3Network from "./components/SelectL3Network";
import SelectVm from "./components/SelectVm";
import SelectVmTemplate from "./components/SelectVmTemplate";

import style from "./style.module.less";

const { Card } = ZSVForm;

const STYLE_FLEX_CENTER = { display: "flex", alignItems: "center" } as const;

interface IShareResourceConfigProps {
  form: any;
  showInfo?: boolean;
  isGroup?: boolean;
  showSubTitle?: boolean;
}

const ShareResourceConfig: React.FC<IShareResourceConfigProps> = ({
  form,
  isGroup,
  showInfo,
  showSubTitle = true,
}) => {
  const intl = useIntl();

  const items = useMemo(
    () => [
      {
        key: "resource.vm",
        closable: false,
        label: intl.formatMessage({
          id: "vm",
          defaultMessage: "Virtual Machine",
        }),
        children: <SelectVm form={form} />,
      },
      {
        key: "resource.image",
        closable: false,
        label: intl.formatMessage({
          id: "image",
          defaultMessage: "Image",
        }),
        children: <SelectImage form={form} />,
      },
      ...(!isGroup
        ? [
            {
              key: "resource.template",
              closable: false,
              label: intl.formatMessage({
                id: "template",
                defaultMessage: "Template",
              }),
              children: <SelectVmTemplate form={form} />,
            },
          ]
        : []),
      {
        key: "resource.l2network",
        closable: false,
        label: intl.formatMessage({
          id: "l2",
          defaultMessage: "Distributed Switch",
        }),
        children: <SelectL2Network form={form} />,
      },
      {
        key: "resource.l3network",
        closable: false,
        label: intl.formatMessage({
          id: "l3network",
          defaultMessage: "Distributed Port Group",
        }),
        children: <SelectL3Network form={form} />,
      },
    ],
    [form, intl, isGroup],
  );

  const [activeKey, setActiveKey] = useState<string>(items[0].key);

  const title: string | React.ReactNode = useMemo(() => {
    if (showSubTitle) {
      return (
        <span style={STYLE_FLEX_CENTER}>
          {intl.formatMessage({
            id: "share.resource",
            defaultMessage: "Share Resource",
          })}
          {showInfo && (
            <Tooltip
              title={intl.formatMessage({
                id: "tooltip.share.resource",
                defaultMessage:
                  "Shared resources refer to resources that are shared with other users, who can create virtual machines, disks, and other resources based on these shared resources.,",
              })}
            >
              <Icon type="info" className={style["info-icon"]} />
            </Tooltip>
          )}
        </span>
      );
    }
    return intl.formatMessage({
      id: "resource.config",
      defaultMessage: "Resource Configuration",
    });
  }, [showSubTitle, intl, showInfo]);

  return (
    <Card title={title} className={style["share-resource-card"]}>
      <div className={style["tabs-container"]}>
        <Tabs
          hideAdd
          tabPosition="left"
          className={style.tab}
          activeKey={activeKey}
          onChange={setActiveKey}
        >
          {items.map((it) => (
            <Tabs.TabPane
              forceRender
              className={style.tabPane}
              tab={<Text>{it.label}</Text>}
              key={it.key}
            >
              {it.children}
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    </Card>
  );
};

export default ShareResourceConfig;
