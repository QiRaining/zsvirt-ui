import alova from "@zstack/alova-instance";
import { useCallback, useState } from "react";

type LogData = { data: string };

export default function useGetServerLog() {
  const [loading, setLoading] = useState(false);

  const fetchLog = useCallback(async (category: string, id: string) => {
    setLoading(true);
    try {
      const data = await alova
        .Get<LogData>(`/api/server-log/${category}/${id}`)
        .send();
      return data || "";
    } catch {
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  const getUiServerLog = (traceId: string) =>
    fetchLog("zstack-ui-server", traceId);
  const getNginxAccessLog = (traceId: string) =>
    fetchLog("nginx-access", traceId);
  const getMNLog = (apiID: string) => fetchLog("mn-log", apiID);
  const getDoubleMNLog = (apiID: string) => fetchLog("double-mn-log", apiID);

  return {
    loading,
    getUiServerLog,
    getNginxAccessLog,
    getMNLog,
    getDoubleMNLog,
  };
}
