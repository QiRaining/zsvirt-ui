import { List, ResourceName } from "@zstack/zsphere-components";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  detail: IVM;
}

const LoginAuth: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "ssh.public.key",
          defaultMessage: "SSH Public Key",
        }),
        value: (
          <ResourceName copyable canModify value={detail?.systemTag?.sshkey} />
        ),
      },
    ];
  }, [intl, detail]);

  return <List list={list} />;
};

export default LoginAuth;
