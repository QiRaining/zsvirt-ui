import { Card, CardContent, CardHeader, CardTitle } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useIntl } from "react-intl";

import type { DisasterRecoveryServiceStatus } from "../types";
import type { SetupStepState } from "../utils";
import { getSetupStepState } from "../utils";

interface DeploymentStepsCardProps {
  status: DisasterRecoveryServiceStatus;
}

function getStepClassName(state: SetupStepState): string {
  switch (state) {
    case "done":
      return "border-positive-200 bg-positive-50 text-positive-700";
    case "active":
      return "border-theme-200 bg-theme-50 text-theme-700";
    case "pending":
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
  }
}

export function DeploymentStepsCard({ status }: DeploymentStepsCardProps) {
  const intl = useIntl();
  const steps = [
    {
      index: 1 as const,
      title: intl.formatMessage({
        id: "disasterRecoveryService.step.upload.title",
        defaultMessage: "Upload Package",
      }),
      description: intl.formatMessage({
        id: "disasterRecoveryService.step.upload.description",
        defaultMessage:
          "Upload the ZLR Appliance offline package and complete integrity verification.",
      }),
    },
    {
      index: 2 as const,
      title: intl.formatMessage({
        id: "disasterRecoveryService.step.install.title",
        defaultMessage: "Deploy Service",
      }),
      description: intl.formatMessage({
        id: "disasterRecoveryService.step.install.description",
        defaultMessage:
          "Create the system VM by specification and let the platform host the ZLR Appliance lifecycle.",
      }),
    },
    {
      index: 3 as const,
      title: intl.formatMessage({
        id: "disasterRecoveryService.step.initialize.title",
        defaultMessage: "Initialize Local Site",
      }),
      description: intl.formatMessage({
        id: "disasterRecoveryService.step.initialize.description",
        defaultMessage:
          "Open ZLR to confirm the local site identity and complete registration self-checks.",
      }),
    },
  ];

  return (
    <Card className="bg-neutral-0">
      <CardHeader>
        <CardTitle>
          {intl.formatMessage({
            id: "disasterRecoveryService.step.cardTitle",
            defaultMessage: "Installation and Deployment",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 px-5 lg:grid-cols-3">
        {steps.map((step) => {
          const state = getSetupStepState(status, step.index);
          return (
            <div
              className={`rounded-sm border border-solid p-4 ${getStepClassName(
                state,
              )}`}
              key={step.index}
            >
              <div className="flex items-center gap-2">
                <span className="bg-neutral-0 flex size-7 items-center justify-center rounded-full text-sm font-semibold">
                  {state === "done" ? <Icon type="checkmark" /> : step.index}
                </span>
                <div className="text-sm font-semibold">{step.title}</div>
              </div>
              <div className="mt-3 text-sm text-neutral-600">
                {step.description}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
