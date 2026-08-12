import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeaderLarge,
} from "@zstack/design";
import { useIntl } from "react-intl";

import type { DisasterRecoveryServiceBlocker } from "../types";
import { getBlockerLabel } from "./formatters";

interface ClearServiceDialogProps {
  open: boolean;
  blockers: DisasterRecoveryServiceBlocker[];
  onOpenChange: (open: boolean) => void;
  onConfirmClear: () => void;
}

export function ClearServiceDialog({
  open,
  blockers,
  onOpenChange,
  onConfirmClear,
}: ClearServiceDialogProps) {
  const intl = useIntl();
  const hasBlockers = blockers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[600px]">
        <DialogHeaderLarge
          title={intl.formatMessage({
            id: "disasterRecoveryService.clear.title",
            defaultMessage: "Clear ZLR Service Registration",
          })}
          setVisible={onOpenChange}
        />
        <DialogDivider />
        <DialogBody className="px-6 py-5">
          <div className="space-y-4">
            <div className="text-sm text-neutral-700">
              {intl.formatMessage({
                id: "disasterRecoveryService.clear.description",
                defaultMessage:
                  "Clearing only uninstalls the ZLR Appliance and removes the platform-side service registration. After clearing, the service entry returns to Step 1. Replicated data, PITs, report archives, and audit archives are retained.",
              })}
            </div>
            {hasBlockers && (
              <div className="border-danger-200 bg-danger-50 rounded-sm border border-solid p-3">
                <div className="text-danger-700 text-sm font-medium">
                  {intl.formatMessage({
                    id: "disasterRecoveryService.clear.blockerTitle",
                    defaultMessage: "Current blockers",
                  })}
                </div>
                <ul className="text-danger-700 mt-2 list-disc pl-5 text-sm">
                  {blockers.map((blocker) => (
                    <li key={blocker.code}>{getBlockerLabel(blocker, intl)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogDivider />
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {intl.formatMessage({
              id: "common.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button variant="danger" onClick={onConfirmClear}>
            {intl.formatMessage({
              id: "disasterRecoveryService.clear.confirm",
              defaultMessage: "Confirm Clear",
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
