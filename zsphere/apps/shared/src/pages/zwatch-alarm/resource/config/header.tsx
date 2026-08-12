import { Action } from "@zstack/zsphere-components";

import useActionConfig from "./useActionConfig";

export default function HeaderAction(props: any) {
  const { list: menuList, viewMap, getItemName } = useActionConfig();

  return (
    <Action
      view="main.virtualization"
      resource="zwatch.alarm.resource"
      position="header"
      menuList={menuList}
      viewMap={viewMap}
      getItemName={getItemName}
      {...props}
    />
  );
}
