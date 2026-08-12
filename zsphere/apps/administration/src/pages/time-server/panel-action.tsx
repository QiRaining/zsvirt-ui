import { useQuery } from "@apollo/client";
import type { TimeServerResult } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";

import { getTimeServers } from "../../gql/time-server.gql";
import ActionList from "./action/list";

const STYLE_MARGIN_BOTTOM_12 = { marginBottom: "12px" } as const;

const PanelAction: FC = () => {
  const { data, refetch } = useQuery<{ timeServers: TimeServerResult }>(
    getTimeServers,
  );
  const serversData = data?.timeServers;
  return (
    <div style={STYLE_MARGIN_BOTTOM_12}>
      <ActionList data={serversData} refetch={refetch} />
    </div>
  );
};
export default PanelAction;
