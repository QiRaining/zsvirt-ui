import { useAuth } from "@zstack/zsphere-components";
import { Tabs } from "antd"; // 这里需要 antd 的 Tabs 组件
import React from "react";
import { useIntl } from "react-intl";

import { LeftNavType, NavView } from "./types";
import { getMenuName } from "./utils";

import style from "./style.module.less";

interface IProps {
  leftNav: LeftNavType; // 主机与虚机、镜像存储、数据存储、网络
  navView: NavView;
  onNavViewChange: (newNavView: NavView) => void;
}

const TreeViewName: React.FC<IProps> = ({
  leftNav,
  navView,
  onNavViewChange,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  if (leftNav === LeftNavType.ClusterHost) {
    const items = [
      {
        key: NavView.Resource,
        label: intl.formatMessage({
          id: "vm.director.by.host",
          defaultMessage: "Host View",
        }),
      },
    ];

    if (
      hasAuth({
        type: "block",
        resource: "vm",
        authKey: "vm.directory.tree",
      })
    ) {
      items.push({
        key: NavView.Group,
        label: intl.formatMessage({
          id: "vm.director.by.group",
          defaultMessage: "Group View",
        }),
      });
    }

    return (
      <Tabs
        className={style.tabs}
        activeKey={navView}
        onChange={(value) => onNavViewChange(value as NavView)}
        items={items}
      />
    );
  }

  if (leftNav === LeftNavType.TemplateVm) {
    const items = [
      {
        key: NavView.Resource,
        label: intl.formatMessage({
          id: "template.director.image",
          defaultMessage: "Image File",
        }),
      },
    ];

    if (
      hasAuth({
        type: "block",
        resource: "templatedvm",
        authKey: "templatedvm.directory.tree",
      })
    ) {
      items.push({
        key: NavView.Template,
        label: intl.formatMessage({
          id: "template.director.template",
          defaultMessage: "Template File",
        }),
      });
    }

    return (
      <Tabs
        className={style.tabs}
        activeKey={navView}
        onChange={(value) => onNavViewChange(value as NavView)}
        items={items}
      />
    );
  }

  return (
    <span className={style.treeViewName}>{getMenuName(leftNav, intl)}</span>
  );
};

TreeViewName.displayName = "TreeViewName";

export default React.memo(TreeViewName);
