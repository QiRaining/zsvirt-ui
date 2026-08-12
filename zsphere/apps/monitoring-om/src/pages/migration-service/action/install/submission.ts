interface SubmitInstallActionOptions {
  onActionStart?: () => void;
  submitAction: () => Promise<unknown>;
}

export const submitInstallAction = async ({
  onActionStart,
  submitAction,
}: SubmitInstallActionOptions): Promise<void> => {
  onActionStart?.();
  await submitAction();
};
