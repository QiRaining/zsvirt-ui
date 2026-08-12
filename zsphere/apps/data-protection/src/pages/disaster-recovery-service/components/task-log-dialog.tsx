import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeaderLarge,
  Button,
} from "@zstack/design";
import { useIntl } from "react-intl";

import type { DisasterRecoveryServiceTaskLog } from "../types";
import { getTaskLogMessage } from "./formatters";

interface TaskLogDialogProps {
  open: boolean;
  logs: DisasterRecoveryServiceTaskLog[];
  onOpenChange: (open: boolean) => void;
}

export function TaskLogDialog({
  open,
  logs,
  onOpenChange,
}: TaskLogDialogProps) {
  const intl = useIntl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[640px]">
        <DialogHeaderLarge
          title={intl.formatMessage({
            id: "disasterRecoveryService.taskLog.title",
            defaultMessage: "Task Logs",
          })}
          setVisible={onOpenChange}
        />
        <DialogDivider />
        <DialogBody className="max-h-[420px] overflow-auto px-6 py-5">
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                className="rounded-sm border border-solid border-neutral-200 bg-neutral-50 p-3"
                key={log.id}
              >
                <div className="text-sm text-neutral-800">
                  {getTaskLogMessage(log.code, intl)}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  {log.createdAt}
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogDivider />
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {intl.formatMessage({
              id: "disasterRecoveryService.action.close",
              defaultMessage: "Close",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
