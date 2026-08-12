import type { FC, PropsWithChildren } from "react";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";

interface ITabWrapperProps {
  uuid: string;
}
export const TabWrapper: FC<PropsWithChildren<ITabWrapperProps>> = React.memo(
  ({ children }) => {
    const [showChildren, setShowChildren] = useState(true);
    const location = useLocation();
    useEffect(() => {
      setShowChildren(false);
      setTimeout(() => {
        setShowChildren(true);
      }, 0);
    }, [location]);
    return <>{showChildren && children}</>;
  },
);

TabWrapper.displayName = "TabWrapper";
