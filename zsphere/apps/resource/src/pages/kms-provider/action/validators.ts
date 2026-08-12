import { gql, useApolloClient } from "@apollo/client";
import type { Item } from "@zstack/zsphere-types";

export function validateSetDefault(current: Item) {
  return !current.isDefault;
}

export function validateNKP(current: Item) {
  return current?.type === "NKP";
}

const countKmsProviders = gql`
  query countKmsProviders {
    countKmsProviders
  }
`;

export function useValidateDelete() {
  const apollo = useApolloClient();
  return async (current: Item) => {
    if (!current.isDefault) {
      return true;
    }
    const res = await apollo
      .query({ query: countKmsProviders, fetchPolicy: "no-cache" })
      .catch(() => null);
    const cnt = res?.data?.countKmsProviders ?? 0;
    return cnt <= 1;
  };
}
