import { DraggableCard, useAuth } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import ResourceConfigModal from "../../action/modify-resource-config";
import { useAdvancedSettings } from "../../action/useAdvanceSettings";

interface IProps {
  detail: IPrimaryStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const Settings: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const [visible, setVisible] = useState<boolean>(false);
  const { hasAuth } = useAuth();

  const { list, refetch } = useAdvancedSettings(detail);

  const memoizedSelectedList = useMemo(() => [detail], [detail]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "advancedSetting",
        defaultMessage: "Advanced Settings",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      titleActions={
        hasAuth({
          resource: "primary.storage",
          authKey: "setting",
          type: "action",
        })
          ? [
              {
                icon: "edit",
                tooltip: intl.formatMessage({
                  id: "modify.advance.settings",
                  defaultMessage: "Modify Advanced Settings",
                }),
                onClick: () => setVisible(true),
              },
            ]
          : []
      }
    >
      <List list={list} bordered={false} />
      <ResourceConfigModal
        view="main"
        position="header"
        visible={visible}
        refetch={refetch}
        setVisible={setVisible}
        selectedList={memoizedSelectedList}
      />
    </DraggableCard>
  );
};

export default Settings;
