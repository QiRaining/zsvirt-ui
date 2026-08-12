import { usePlatformStore } from "@zstack/zsphere-platform-store";

export function useLicenseAndTime() {
  const currentUser = usePlatformStore((state) => state.currentUser);

  return {
    currentUser,
    license: undefined,
    platformTimeMillionSeconds: undefined,
  };
}
