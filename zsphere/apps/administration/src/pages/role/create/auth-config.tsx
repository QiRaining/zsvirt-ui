import { ZSVForm } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { getMenuTree } from "@zstack/zsphere-config";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import PrivilegeTree from "../components/privilege-tree";

import styles from "./style.module.less";

const { Card } = ZSVForm;
const { Item } = Form;

interface IAuthConfigProps {
  form: any;
}

const AuthConfig: React.FC<IAuthConfigProps> = () => {
  const intl = useIntl();
  const menu = useMemo(() => getMenuTree("root", intl), [intl]);

  return (
    <Card
      title={intl.formatMessage({
        id: "auth.config",
        defaultMessage: "Permission Configuration",
      })}
    >
      <div className={styles.card}>
        <Item name="uiPrivilege" noStyle>
          <PrivilegeTree treeStruct={menu} />
        </Item>
      </div>
    </Card>
  );
};

export default AuthConfig;
