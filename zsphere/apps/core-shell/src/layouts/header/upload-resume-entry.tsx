import { Button, InfoPopover } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import { openZsvUploadConfirmModal } from "@zstack/zsphere-components";
import { useResume, useResumableUploadSessions } from "@zstack/zsphere-hooks";
import type {
  UploadSession,
  UploadSessionStatus,
  UploadSessionType,
} from "@zstack/zsphere-hooks";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import {
  buildUploadResumeOperationLog,
  getHeaderResumableUploadSessions,
  getUploadSessionDisplayName,
  getUploadSessionProgressLabel,
  getUploadSessionProgressPercent,
} from "./upload-resume-entry-utils";

import style from "./style.module.less";

const MAX_VISIBLE_SESSIONS = 3;

const UPLOAD_TYPE_MESSAGE: Record<
  UploadSessionType,
  { id: string; defaultMessage: string }
> = {
  image: {
    id: "header.uploadResume.type.image",
    defaultMessage: "Image",
  },
  storagePackage: {
    id: "header.uploadResume.type.storagePackage",
    defaultMessage: "Package",
  },
  migrationServicePackage: {
    id: "header.uploadResume.type.migrationServicePackage",
    defaultMessage: "Migration Service Package",
  },
};

const UPLOAD_STATUS_MESSAGE: Partial<
  Record<UploadSessionStatus, { id: string; defaultMessage: string }>
> = {
  WAITING_FOR_FILE: {
    id: "header.uploadResume.status.waitingForFile",
    defaultMessage: "Waiting to Resume",
  },
  PAUSED: {
    id: "header.uploadResume.status.paused",
    defaultMessage: "Paused",
  },
};

const UploadResumeEntry: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const resume = useResume({ openConfirmModal: openZsvUploadConfirmModal });
  const { sessions: resumableSessions, refreshUploadSessions } =
    useResumableUploadSessions();
  const [open, setOpen] = useState(false);
  const sessions = useMemo(
    () => getHeaderResumableUploadSessions(resumableSessions),
    [resumableSessions],
  );

  const visibleSessions = useMemo(
    () => sessions.slice(0, MAX_VISIBLE_SESSIONS),
    [sessions],
  );
  const hiddenSessionCount = Math.max(
    0,
    sessions.length - visibleSessions.length,
  );

  const tooltipTitle = intl.formatMessage(
    {
      id: "header.uploadResume.tooltip",
      defaultMessage: "There are {count} upload tasks pending",
    },
    { count: sessions.length },
  );

  const handleContinue = (session: UploadSession) => {
    resume(buildUploadResumeOperationLog(session)).goingOn();
    void refreshUploadSessions({ force: true });
    setOpen(false);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/virtualization-monitoring-om/operation-log");
  };

  if (sessions.length === 0) {
    return null;
  }

  const content = (
    <div className={style.uploadResumePopover}>
      <div className={style.uploadResumeSummary}>
        {intl.formatMessage(
          {
            id: "header.uploadResume.summary",
            defaultMessage:
              "{count} tasks need attention. Reselect the local file before resuming upload.",
          },
          { count: sessions.length },
        )}
      </div>
      <div className={style.uploadResumeList}>
        {visibleSessions.map((session) => {
          const progress = getUploadSessionProgressPercent(session);
          const progressLabel = getUploadSessionProgressLabel(session);
          const progressBarPercent =
            progress === undefined
              ? 0
              : progress === 0 && (session.offset || 0) > 0
                ? 1
                : progress;
          const typeMessage = UPLOAD_TYPE_MESSAGE[session.uploadType];
          const statusMessage = UPLOAD_STATUS_MESSAGE[session.status];

          return (
            <div className={style.uploadResumeItem} key={session.longJobUuid}>
              <div className={style.uploadResumeItemMain}>
                <div className={style.uploadResumeTitleRow}>
                  {statusMessage ? (
                    <span className={style.uploadResumeStatus}>
                      {intl.formatMessage({
                        id: statusMessage.id,
                        defaultMessage: statusMessage.defaultMessage,
                      })}
                    </span>
                  ) : null}
                  <div
                    className={style.uploadResumeFileName}
                    title={getUploadSessionDisplayName(session)}
                  >
                    {getUploadSessionDisplayName(session)}
                  </div>
                </div>
                <div className={style.uploadResumeMeta}>
                  <span>
                    {intl.formatMessage({
                      id: typeMessage.id,
                      defaultMessage: typeMessage.defaultMessage,
                    })}
                  </span>
                  {session.fileSize ? (
                    <>
                      <span className={style.uploadResumeDot} />
                      <span>
                        {intl.formatMessage(
                          {
                            id: "header.uploadResume.size",
                            defaultMessage: "Uploaded {uploaded} / {total}",
                          },
                          {
                            uploaded: formatBytesToSize(session.offset || 0),
                            total: formatBytesToSize(session.fileSize),
                          },
                        )}
                      </span>
                    </>
                  ) : null}
                  {progressLabel ? (
                    <>
                      <span className={style.uploadResumeDot} />
                      <span>{progressLabel}</span>
                    </>
                  ) : null}
                </div>
                {session.fileSize ? (
                  <div aria-hidden className={style.uploadResumeProgressTrack}>
                    <span
                      className={style.uploadResumeProgressBar}
                      style={{ width: `${progressBarPercent}%` }}
                    />
                  </div>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className={style.uploadResumeAction}
                onClick={() => handleContinue(session)}
              >
                {intl.formatMessage({
                  id: "operationLog.upload.selectFileToContinue",
                  defaultMessage: "Select File to Continue",
                })}
              </Button>
            </div>
          );
        })}
      </div>
      {hiddenSessionCount > 0 ? (
        <div className={style.uploadResumeMore}>
          {intl.formatMessage(
            {
              id: "header.uploadResume.more",
              defaultMessage: "{count} more upload tasks",
            },
            { count: hiddenSessionCount },
          )}
        </div>
      ) : null}
      <Button
        className={style.uploadResumeFooter}
        onClick={handleViewAll}
        type="button"
      >
        {intl.formatMessage({
          id: "header.uploadResume.viewAll",
          defaultMessage: "Go to Task List to View Upload Records",
        })}
      </Button>
    </div>
  );

  const trigger = (
    <Button
      aria-label={tooltipTitle}
      className={cn(
        style.uploadResumeTrigger,
        open && style.uploadResumeTriggerActive,
      )}
      title={tooltipTitle}
      type="button"
    >
      <Icon className={style.uploadResumeIcon} type="cloud-upload" />
      <span>
        {intl.formatMessage({
          id: "header.uploadResume.trigger",
          defaultMessage: "Pending Uploads",
        })}
      </span>
      <span className={style.uploadResumeCount}>{sessions.length}</span>
    </Button>
  );

  return (
    <InfoPopover
      align="end"
      content={content}
      contentClassName={style.uploadResumePopoverContent}
      maxWidth={420}
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      showArrow={false}
      title={intl.formatMessage({
        id: "header.uploadResume.title",
        defaultMessage: "Pending Upload Tasks",
      })}
      trigger={trigger}
      triggerAriaLabel={tooltipTitle}
      triggerMode="click"
    />
  );
};

export default UploadResumeEntry;
