import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Empty, Auth } from "@zstack/zsphere-components";
import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";

import CreateModal from "../create";

import style from "./style.module.less";

const EMPTY_LIST: never[] = [];

const EmptyCard: React.FC = () => {
  const intl = useIntl();

  const [visible, setVisible] = useState<boolean>(false);

  const handleOpenClick = useCallback(() => {
    setVisible(true);
  }, []);

  return (
    <div>
      <div className={style["empty-card"]}>
        <Empty type="Table" />
        <Auth
          type="action"
          authKey="virtualization.create"
          resource="account.third.party.auth"
        >
          <Button
            className={style.btn}
            variant="primary"
            icon={<Icon type="plus" />}
            onClick={handleOpenClick}
          >
            {intl.formatMessage({
              id: "create.account.third.party.auth",
              defaultMessage: "Add SSO Server",
            })}
          </Button>
        </Auth>
      </div>
      <CreateModal
        visible={visible}
        setVisible={setVisible}
        selectedList={EMPTY_LIST}
        position="header"
        view="virtualization.main"
      />
    </div>
  );
};

export default EmptyCard;
