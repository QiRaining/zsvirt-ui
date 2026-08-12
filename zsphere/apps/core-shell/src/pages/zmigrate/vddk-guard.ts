import { gql, useQuery } from "@apollo/client";

const GET_ZMIGRATE_VDDK_UPLOADED = gql`
  query getZMigrateVddkUploaded {
    getZMigrateVddkUploaded
  }
`;

export type VddkGuardState = "loading" | "error" | "missing" | "ready";

interface VddkGuardInput {
  loading: boolean;
  error?: boolean;
  uploaded?: boolean;
}

export const getVddkGuardState = ({
  loading,
  error,
  uploaded,
}: VddkGuardInput): VddkGuardState => {
  if (loading) {
    return "loading";
  }
  if (error || typeof uploaded !== "boolean") {
    return "error";
  }
  return uploaded ? "ready" : "missing";
};

export const useVddkGuard = () => {
  const { data, error, loading, refetch } = useQuery(
    GET_ZMIGRATE_VDDK_UPLOADED,
    {
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  );

  return {
    state: getVddkGuardState({
      loading,
      error: Boolean(error),
      uploaded: data?.getZMigrateVddkUploaded,
    }),
    retry: refetch,
  };
};
