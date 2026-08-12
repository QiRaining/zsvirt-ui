import { Text } from "@zstack/design";
import type {
  ResourceAttributeKey,
  ResourceAttributeValue,
} from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

export function useDefaultResourceAttributeConfig() {
  return useMemo(() => {
    return {
      auth: {
        type: "block" as const,
        resource: "virtualization.tag.and.attribute",
        authKey: "resource.attribute",
      },
      width: 200,
      render: (
        current: { resourceAttributeValues?: ResourceAttributeValue[] },
        currentKey: ResourceAttributeKey,
      ) => {
        const currentValue = current?.resourceAttributeValues?.find(
          ({ keyUuid }) => keyUuid === currentKey.uuid,
        )?.value;
        if (!currentValue) {
          return null;
        }
        return <Text>{currentValue}</Text>;
      },
    };
  }, []);
}
