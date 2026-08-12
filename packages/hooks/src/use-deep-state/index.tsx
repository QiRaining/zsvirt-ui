import { isEqual } from "lodash-es";
import { useMemo, useRef } from "react";

export function useDeepState<T extends any>(
  state: T,
  { deep = true }: { deep?: boolean } = {},
): T {
  const stateRef = useRef<T>(state);
  const isChange = useMemo(
    () => !deep || !isEqual(stateRef.current, state),
    [state, deep],
  );

  if (isChange) {
    stateRef.current = state;
  }

  return stateRef.current;
}
