interface ReuploadAfterCleanupOptions {
  resetStatus: (options: { onFinish: () => void }) => void;
  openUpload: () => void;
}

export const openUploadAfterCleanup = ({
  resetStatus,
  openUpload,
}: ReuploadAfterCleanupOptions): void => {
  resetStatus({ onFinish: openUpload });
};
