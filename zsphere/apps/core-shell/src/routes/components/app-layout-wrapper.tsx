import { SubAppLayout } from "@zstack/zsphere-components";
import { Outlet } from "react-router";

import { SuspenseWrapper } from "./suspense-wrapper";

export default function AppLayoutWrapper() {
  return (
    <SuspenseWrapper>
      <SubAppLayout>
        <Outlet />
      </SubAppLayout>
    </SuspenseWrapper>
  );
}
