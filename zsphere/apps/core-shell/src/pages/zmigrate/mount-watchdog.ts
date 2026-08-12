export const MOUNT_SLOW_WARNING_MS = 30_000;
export const MOUNT_HARD_TIMEOUT_MS = 180_000;

export interface MountWatchdog {
  cancel: () => void;
}

interface CreateMountWatchdogOptions {
  onSlow: () => void;
  onTimeout: () => void;
}

export function createMountWatchdog({
  onSlow,
  onTimeout,
}: CreateMountWatchdogOptions): MountWatchdog {
  let slowWarningTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(
    () => {
      slowWarningTimer = undefined;
      onSlow();
    },
    MOUNT_SLOW_WARNING_MS,
  );
  let hardTimeoutTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(
    () => {
      hardTimeoutTimer = undefined;
      onTimeout();
    },
    MOUNT_HARD_TIMEOUT_MS,
  );

  return {
    cancel: () => {
      if (slowWarningTimer !== undefined) {
        clearTimeout(slowWarningTimer);
        slowWarningTimer = undefined;
      }
      if (hardTimeoutTimer !== undefined) {
        clearTimeout(hardTimeoutTimer);
        hardTimeoutTimer = undefined;
      }
    },
  };
}
