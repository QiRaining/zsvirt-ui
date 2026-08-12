import { gql, useApolloClient } from "@apollo/client";
import { usePlatformStore } from "@zstack/zsphere-platform-store";

export const useGetRole = () => {
  // 分开订阅，避免订阅整个 store
  const setCurrentUser = usePlatformStore((state) => state.setCurrentUser);
  const apolloClient = useApolloClient();

  const getRole = async () => {
    const { data } = await apolloClient.query({
      query: gql`
        query zsvUiPrivileges {
          zsvUiPrivileges {
            systemRoles {
              name
              uuid
            }
            customRoles {
              name
              uuid
            }
            customUIPrivilege
          }
        }
      `,
    });

    const { systemRoles, customRoles, customUIPrivilege } =
      data?.zsvUiPrivileges || {};
    setCurrentUser((v) => {
      return {
        ...v,
        IAM1: {
          systemRoles,
          customRoles,
          customUIPrivilege,
        },
      };
    });
  };
  return {
    getRole,
  };
};
