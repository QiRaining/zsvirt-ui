import { Text, Link as DesignLink } from "@zstack/design";
import { useLinkAuth } from "@zstack/zsphere-components";
import React from "react";
import { useNavigate } from "react-router";
export type ILinkResource = string | { path: string; microAppName: string };

interface ILinkProps {
  to: ILinkResource;
  uuid: string;
  children: React.ReactNode;
}

const Link: React.FC<ILinkProps> = (props) => {
  const { to, uuid, children } = props;

  const { hasAuth } = useLinkAuth();
  const navigate = useNavigate();

  if (
    !hasAuth(
      typeof to === "string"
        ? { to: `/${to}/detail?uuid=${uuid}` }
        : { ...to, to: `/${to.path}/detail?uuid=${uuid}` },
    )
  ) {
    return <Text>{children}</Text>;
  }

  if (typeof to === "string") {
    return (
      <DesignLink
        onClick={(e) => {
          e.preventDefault();
          navigate(`/${to}/detail?uuid=${uuid}`);
        }}
      >
        {children}
      </DesignLink>
    );
  }

  return (
    <DesignLink
      onClick={(e) => {
        e.preventDefault();
        navigate(`/${to.microAppName}/${to.path}/detail?uuid=${uuid}`);
      }}
    >
      {children}
    </DesignLink>
  );
};

export { Link };
