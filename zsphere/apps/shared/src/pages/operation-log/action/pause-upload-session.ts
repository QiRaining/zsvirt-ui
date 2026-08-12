import {
  refreshResumableUploadSessions,
  updateUploadSession,
} from "@zstack/zsphere-hooks";

interface PausableUpload {
  pause: () => void;
}

export const pauseUploadSession = async (
  longJobUuid: string | undefined,
  file: PausableUpload | null | undefined,
) => {
  file?.pause();
  await updateUploadSession(longJobUuid, { status: "PAUSED" }).catch(
    () => null,
  );
  void refreshResumableUploadSessions({ force: true });
};
