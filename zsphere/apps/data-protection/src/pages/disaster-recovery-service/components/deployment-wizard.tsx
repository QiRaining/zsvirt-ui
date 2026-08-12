import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeaderLarge,
  Form,
} from "@zstack/design";
import {
  FieldStack,
  InputField,
  RadioGroupField,
  SelectField,
} from "@zstack/form";
import { Icon } from "@zstack/icon";
import { Upload } from "@zstack/zsphere-components";
import { memo, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";
import { z } from "zod";

import type {
  DeployServiceFormValues,
  DisasterRecoveryServiceState,
  InitializeSiteFormValues,
  SetupStepType,
  UploadPackageMethod,
  UploadPackageFormValues,
} from "../types";
import {
  getCurrentSetupStep,
  getSetupStepIndex,
  isServiceBusy,
} from "../utils";
import { StatusBadge } from "./status-badge";

const DIALOG_LABEL_CLASS = "w-40 min-w-40";
const DIALOG_MANUAL_LABEL_CLASS = `mt-[5px] flex ${DIALOG_LABEL_CLASS} shrink-0 text-neutral-700`;
const DIALOG_FIELD_SIZE_CLASS = "w-[400px]";

interface DeploymentWizardProps {
  service: DisasterRecoveryServiceState;
  onPrepareUpload: () => Promise<void>;
  onUploadPackage: (values: UploadPackageFormValues) => Promise<void>;
  onInstallService: (values: DeployServiceFormValues) => Promise<void>;
  onInitializeSite: (values: InitializeSiteFormValues) => Promise<void>;
  onViewTasks: () => void;
}

interface SetupStepCardProps {
  service: DisasterRecoveryServiceState;
  step: SetupStepType;
  reuploading: boolean;
  onPrimaryClick: () => void;
  onReupload: () => void;
  onTaskLogClick: () => void;
}

interface StepFormDialogProps {
  openStep: SetupStepType | null;
  service: DisasterRecoveryServiceState;
  onOpenChange: (open: boolean) => void;
  onUploadPackage: (values: UploadPackageFormValues) => Promise<void>;
  onInstallService: (values: DeployServiceFormValues) => Promise<void>;
  onInitializeSite: (values: InitializeSiteFormValues) => Promise<void>;
}

function getRequiredMessage(intl: IntlShape): string {
  return intl.formatMessage({
    id: "disasterRecoveryService.validation.required",
    defaultMessage: "This field is required.",
  });
}

function requiredString(message: string) {
  return z.string().trim().min(1, message);
}

function createUploadPackageSchema(intl: IntlShape) {
  const requiredMessage = getRequiredMessage(intl);
  const absolutePathMessage = intl.formatMessage({
    id: "disasterRecoveryService.validation.absolutePath",
    defaultMessage: "Enter an absolute path.",
  });

  return z
    .object({
      uploadMethod: z.union([z.literal("url"), z.literal("local")]),
      storagePath: requiredString(requiredMessage).refine(
        (value) => value.startsWith("/"),
        absolutePathMessage,
      ),
      packageUrl: z.string().optional(),
      localFileName: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (values.uploadMethod === "url" && !values.packageUrl?.trim().length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ["packageUrl"],
        });
      }

      if (
        values.uploadMethod === "local" &&
        !values.localFileName?.trim().length
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: requiredMessage,
          path: ["localFileName"],
        });
      }
    });
}

function createDeployServiceSchema(intl: IntlShape) {
  const requiredMessage = getRequiredMessage(intl);

  return z.object({
    clusterName: requiredString(requiredMessage),
    hostName: requiredString(requiredMessage),
    storageName: requiredString(requiredMessage),
    managementNetwork: requiredString(requiredMessage),
    spec: z.union([z.literal("Light"), z.literal("Standard")]),
    managementAddress: requiredString(requiredMessage),
  });
}

function createInitializeSiteSchema(intl: IntlShape) {
  const requiredMessage = getRequiredMessage(intl);

  return z.object({
    siteName: requiredString(requiredMessage),
    siteId: requiredString(requiredMessage),
    managementNodeAddress: requiredString(requiredMessage),
    certificateFingerprint: requiredString(requiredMessage),
    bootstrapToken: requiredString(requiredMessage),
  });
}

function getStepTitle(step: SetupStepType, intl: IntlShape): string {
  switch (step) {
    case "upload":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.upload.title",
        defaultMessage: "Upload Package",
      });
    case "install":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.install.title",
        defaultMessage: "Deploy Service",
      });
    case "initialize":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.initialize.title",
        defaultMessage: "Initialize Local Site",
      });
  }
}

function getStepDescription(step: SetupStepType, intl: IntlShape): string {
  switch (step) {
    case "upload":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.upload.description",
        defaultMessage:
          "Upload the ZLR Appliance offline package and complete integrity verification.",
      });
    case "install":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.install.description",
        defaultMessage:
          "Create the system VM by specification and let the platform host the ZLR Appliance lifecycle.",
      });
    case "initialize":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.initialize.description",
        defaultMessage:
          "Open ZLR to confirm the local site identity and complete registration self-checks.",
      });
  }
}

function getPrimaryButtonText(step: SetupStepType, intl: IntlShape): string {
  switch (step) {
    case "upload":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.upload.button",
        defaultMessage: "Upload",
      });
    case "install":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.install.button",
        defaultMessage: "Deploy",
      });
    case "initialize":
      return intl.formatMessage({
        id: "disasterRecoveryService.step.initialize.button",
        defaultMessage: "Initialize",
      });
  }
}

function getManagementNodeDisplayAddress(address: string): string {
  try {
    return new URL(address).hostname;
  } catch {
    return address.replace(/^https?:\/\//, "").split("/")[0] || address;
  }
}

function SectionTitle({
  children,
  className = "mb-3",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-sm leading-6 font-medium text-neutral-800 ${className}`}
    >
      {children}
    </div>
  );
}

function SetupStepCard({
  service,
  step,
  reuploading,
  onPrimaryClick,
  onReupload,
  onTaskLogClick,
}: SetupStepCardProps) {
  const intl = useIntl();
  const stepIndex = getSetupStepIndex(step);
  const busy = isServiceBusy(service.status);
  const canReupload = step !== "upload" && !busy;

  return (
    <div className="bg-neutral-0 min-h-[120px] rounded-sm border border-solid border-neutral-300 p-4">
      <div className="flex items-start">
        <div className="mr-3 flex size-14 shrink-0 items-center justify-center rounded-sm bg-neutral-200">
          <span className="border-theme-600 text-theme-600 flex size-6 items-center justify-center rounded-full border-2 border-solid text-sm font-medium">
            {stepIndex}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-normal text-neutral-700">
            {getStepTitle(step, intl)}
          </div>
          <div className="mt-2 text-sm text-neutral-600">
            {getStepDescription(step, intl)}
          </div>

          {busy ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>
                  {intl.formatMessage({
                    id: "disasterRecoveryService.step.taskStatus",
                    defaultMessage: "Task Status",
                  })}
                  :
                </span>
                <StatusBadge
                  label={intl.formatMessage({
                    id: "disasterRecoveryService.step.status.ongoing",
                    defaultMessage: "Ongoing",
                  })}
                  className="bg-info-50 text-info-600"
                />
              </div>
              <Button variant="link" onClick={onTaskLogClick}>
                {intl.formatMessage({
                  id: "disasterRecoveryService.action.taskLog",
                  defaultMessage: "Task Logs",
                })}
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-1">
              <Button
                icon={<Icon type="arrow-right" size={12} />}
                variant="primary"
                onClick={onPrimaryClick}
              >
                {getPrimaryButtonText(step, intl)}
              </Button>
              {canReupload && (
                <Button
                  loading={reuploading}
                  variant="link"
                  onClick={onReupload}
                >
                  {intl.formatMessage({
                    id: "disasterRecoveryService.step.reupload.button",
                    defaultMessage: "Re-upload",
                  })}
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center text-sm text-neutral-500">
          {intl.formatMessage({
            id: "disasterRecoveryService.step.number",
            defaultMessage: "Step",
          })}
          &nbsp;{stepIndex}&nbsp;/&nbsp;3
          {busy && (
            <>
              <div className="mx-2 h-3 w-px bg-neutral-300" />
              <Button className="p-0" variant="link" onClick={onTaskLogClick}>
                {intl.formatMessage({
                  id: "disasterRecoveryService.step.taskLog",
                  defaultMessage: "Task Logs",
                })}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FunctionIntroductionSection() {
  const intl = useIntl();

  return (
    <section>
      <SectionTitle>
        {intl.formatMessage({
          id: "disasterRecoveryService.functionIntroduction.title",
          defaultMessage: "Function Introduction",
        })}
      </SectionTitle>
      <div className="text-sm leading-6 text-neutral-700">
        {intl.formatMessage({
          id: "disasterRecoveryService.functionIntroduction.content",
          defaultMessage:
            "The disaster recovery service provides the ZLR service entry for cross-site disaster recovery, replication, switchover, drills, and local site initialization.",
        })}
      </div>
    </section>
  );
}

function InstallationGuide() {
  const intl = useIntl();
  const steps: SetupStepType[] = ["upload", "install", "initialize"];

  return (
    <div className="mb-2 rounded-sm bg-neutral-100 px-4 py-3">
      <div className="text-sm leading-6 text-neutral-700">
        {intl.formatMessage({
          id: "disasterRecoveryService.guide.title",
          defaultMessage: "Deploy the disaster recovery service in three steps",
        })}
      </div>
      <div className="flex items-center py-2">
        {steps.map((step, index) => (
          <div className="flex flex-1 items-center" key={step}>
            <div className="flex items-center gap-2 text-neutral-600">
              <span className="border-theme-600 text-theme-600 flex size-4 items-center justify-center rounded-full border border-solid text-xs">
                {index + 1}
              </span>
              <span className="text-sm whitespace-nowrap">
                {getStepTitle(step, intl)}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-10 h-px flex-1 border-t border-dashed border-neutral-300" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm text-neutral-600">
        {intl.formatMessage({
          id: "disasterRecoveryService.guide.prerequisites",
          defaultMessage:
            "Prepare the ZLR Appliance package, target cluster, system storage, management network, and local site registration information before deployment.",
        })}
      </div>
    </div>
  );
}

function UploadPackageForm({
  service,
  onCancel,
  onSubmit,
}: {
  service: DisasterRecoveryServiceState;
  onCancel: () => void;
  onSubmit: (values: UploadPackageFormValues) => Promise<void>;
}) {
  const intl = useIntl();
  const [localFile, setLocalFile] = useState<File | undefined>();
  const defaultValues = useMemo<UploadPackageFormValues>(
    () => ({
      uploadMethod: service.uploadMethod ?? "url",
      storagePath: service.storagePath ?? "/var/lib/zstack/zlr/packages",
      packageUrl:
        service.packageUrl ??
        "https://downloads.example.local/zlr/zlr-appliance-1.0.0.ova",
      localFileName: service.localFileName ?? "",
    }),
    [
      service.localFileName,
      service.packageUrl,
      service.storagePath,
      service.uploadMethod,
    ],
  );
  const form = useForm<UploadPackageFormValues>({
    resolver: zodResolver(createUploadPackageSchema(intl)),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(defaultValues);
    setLocalFile(undefined);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(
      values.uploadMethod === "url"
        ? {
            uploadMethod: "url",
            storagePath: values.storagePath,
            packageUrl: values.packageUrl,
          }
        : {
            uploadMethod: "local",
            storagePath: values.storagePath,
            localFileName: values.localFileName,
          },
    );
  });
  const uploadMethod = form.watch("uploadMethod");
  const localFileError = form.formState.errors.localFileName?.message;

  const uploadMethodOptions = useMemo<
    Array<{ label: string; value: UploadPackageMethod }>
  >(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.form.uploadMethod.url",
          defaultMessage: "URL",
        }),
        value: "url",
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.form.uploadMethod.local",
          defaultMessage: "Local Upload",
        }),
        value: "local",
      },
    ],
    [intl],
  );

  const handleLocalFileChange = (file: File | null) => {
    setLocalFile(file ?? undefined);
    form.setValue("localFileName", file?.name ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <DialogBody className="max-h-[520px] overflow-auto px-6 py-5">
          <FieldStack>
            <div className="flex min-h-8 flex-row gap-2 text-sm">
              <div className={DIALOG_MANUAL_LABEL_CLASS}>
                {intl.formatMessage({
                  id: "disasterRecoveryService.form.managementNode",
                  defaultMessage: "Management Node",
                })}
              </div>
              <div className="mt-[5px] text-neutral-700">
                {getManagementNodeDisplayAddress(
                  service.platformContext.managementNodeAddress,
                )}
              </div>
            </div>
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.storagePath",
                defaultMessage: "Storage Path",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="storagePath"
              placeholder="/var/lib/zstack/zlr/packages"
              required
              size="l"
            />
            <RadioGroupField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.uploadMethod",
                defaultMessage: "Upload Method",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="uploadMethod"
              options={uploadMethodOptions}
            />
            {uploadMethod === "url" ? (
              <InputField
                form={form}
                label={intl.formatMessage({
                  id: "disasterRecoveryService.form.packageUrl",
                  defaultMessage: "URL",
                })}
                labelClassName={DIALOG_LABEL_CLASS}
                name="packageUrl"
                placeholder="https://downloads.example.local/zlr/zlr-appliance.ova"
                required
                size="l"
              />
            ) : (
              <div className="flex min-h-8 flex-row gap-2 text-sm">
                <div className={DIALOG_MANUAL_LABEL_CLASS}>
                  {intl.formatMessage({
                    id: "disasterRecoveryService.form.localFileName",
                    defaultMessage: "Installation Package",
                  })}
                  <span className="text-danger-500 ml-0.5">*</span>
                </div>
                <div className="flex flex-col">
                  <Upload.Select
                    accept=".ova,.tar,.tgz,.gz,.zip"
                    className={DIALOG_FIELD_SIZE_CLASS}
                    value={localFile}
                    onChange={handleLocalFileChange}
                  />
                  {localFileError && (
                    <div className="text-danger-600 mt-1 text-xs leading-5">
                      {localFileError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </FieldStack>
        </DialogBody>
        <DialogDivider />
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: "common.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button loading={form.formState.isSubmitting} type="submit">
            {intl.formatMessage({
              id: "disasterRecoveryService.action.confirm",
              defaultMessage: "Confirm",
            })}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function DeployServiceForm({
  service,
  onCancel,
  onSubmit,
}: {
  service: DisasterRecoveryServiceState;
  onCancel: () => void;
  onSubmit: (values: DeployServiceFormValues) => Promise<void>;
}) {
  const intl = useIntl();
  const defaultValues = useMemo<DeployServiceFormValues>(
    () => ({
      clusterName: service.target.clusterName,
      hostName: service.target.hostName,
      storageName: service.target.storageName,
      managementNetwork: service.target.managementNetwork,
      spec: service.target.spec,
      managementAddress: service.managementAddress,
    }),
    [
      service.managementAddress,
      service.target.clusterName,
      service.target.hostName,
      service.target.managementNetwork,
      service.target.spec,
      service.target.storageName,
    ],
  );
  const form = useForm<DeployServiceFormValues>({
    resolver: zodResolver(createDeployServiceSchema(intl)),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const specOptions = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.form.spec.light",
          defaultMessage: "Light",
        }),
        value: "Light",
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.form.spec.standard",
          defaultMessage: "Standard",
        }),
        value: "Standard",
      },
    ],
    [intl],
  );

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <DialogBody className="max-h-[520px] overflow-auto px-6 py-5">
          <FieldStack>
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.clusterName",
                defaultMessage: "Target Cluster",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="clusterName"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.hostName",
                defaultMessage: "Target Host",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="hostName"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.storageName",
                defaultMessage: "System Storage",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="storageName"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.managementNetwork",
                defaultMessage: "Management Network",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="managementNetwork"
              required
              size="l"
            />
            <SelectField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.spec",
                defaultMessage: "Deployment Spec",
              })}
              className={DIALOG_FIELD_SIZE_CLASS}
              labelClassName={DIALOG_LABEL_CLASS}
              name="spec"
              options={specOptions}
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.managementAddress",
                defaultMessage: "Management Address",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="managementAddress"
              placeholder="https://zlr.example.local"
              required
              size="l"
            />
          </FieldStack>
        </DialogBody>
        <DialogDivider />
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: "common.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button loading={form.formState.isSubmitting} type="submit">
            {intl.formatMessage({
              id: "disasterRecoveryService.action.confirm",
              defaultMessage: "Confirm",
            })}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function InitializeSiteForm({
  service,
  onCancel,
  onSubmit,
}: {
  service: DisasterRecoveryServiceState;
  onCancel: () => void;
  onSubmit: (values: InitializeSiteFormValues) => Promise<void>;
}) {
  const intl = useIntl();
  const defaultValues = useMemo<InitializeSiteFormValues>(
    () => ({
      siteName: service.platformContext.suggestedSiteName,
      siteId: service.platformContext.siteId,
      managementNodeAddress: service.platformContext.managementNodeAddress,
      certificateFingerprint: service.platformContext.certificateFingerprint,
      bootstrapToken:
        service.platformContext.bootstrapTokenState === "MISSING"
          ? ""
          : "zlr-bootstrap-token",
    }),
    [
      service.platformContext.bootstrapTokenState,
      service.platformContext.certificateFingerprint,
      service.platformContext.managementNodeAddress,
      service.platformContext.siteId,
      service.platformContext.suggestedSiteName,
    ],
  );
  const form = useForm<InitializeSiteFormValues>({
    resolver: zodResolver(createInitializeSiteSchema(intl)),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <DialogBody className="max-h-[520px] overflow-auto px-6 py-5">
          <FieldStack>
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.siteName",
                defaultMessage: "Site Name",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="siteName"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.siteId",
                defaultMessage: "Site ID",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="siteId"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.managementNodeAddress",
                defaultMessage: "Management Node Address",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="managementNodeAddress"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.certificateFingerprint",
                defaultMessage: "Certificate Fingerprint",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="certificateFingerprint"
              required
              size="l"
            />
            <InputField
              form={form}
              label={intl.formatMessage({
                id: "disasterRecoveryService.form.bootstrapToken",
                defaultMessage: "Bootstrap Token",
              })}
              labelClassName={DIALOG_LABEL_CLASS}
              name="bootstrapToken"
              required
              size="l"
            />
          </FieldStack>
        </DialogBody>
        <DialogDivider />
        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {intl.formatMessage({
              id: "common.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>
          <Button loading={form.formState.isSubmitting} type="submit">
            {intl.formatMessage({
              id: "disasterRecoveryService.action.confirm",
              defaultMessage: "Confirm",
            })}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

function StepFormDialog({
  openStep,
  service,
  onOpenChange,
  onUploadPackage,
  onInstallService,
  onInitializeSite,
}: StepFormDialogProps) {
  const intl = useIntl();
  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={!!openStep} onOpenChange={onOpenChange}>
      {openStep && (
        <DialogContent className="w-[640px]">
          <DialogHeaderLarge
            title={getStepTitle(openStep, intl)}
            setVisible={onOpenChange}
          />
          <DialogDivider />
          {openStep === "upload" && (
            <UploadPackageForm
              service={service}
              onCancel={handleCancel}
              onSubmit={onUploadPackage}
            />
          )}
          {openStep === "install" && (
            <DeployServiceForm
              service={service}
              onCancel={handleCancel}
              onSubmit={onInstallService}
            />
          )}
          {openStep === "initialize" && (
            <InitializeSiteForm
              service={service}
              onCancel={handleCancel}
              onSubmit={onInitializeSite}
            />
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

export const DeploymentWizard = memo(function DeploymentWizard({
  service,
  onPrepareUpload,
  onUploadPackage,
  onInstallService,
  onInitializeSite,
  onViewTasks,
}: DeploymentWizardProps) {
  const [openStep, setOpenStep] = useState<SetupStepType | null>(null);
  const [reuploading, setReuploading] = useState(false);
  const [isGuideVisible, setIsGuideVisible] = useState(true);
  const intl = useIntl();
  const currentStep = getCurrentSetupStep(service.status);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setOpenStep(null);
    }
  };

  const handlePrepareUpload = async () => {
    setReuploading(true);
    try {
      await onPrepareUpload();
      setOpenStep("upload");
    } finally {
      setReuploading(false);
    }
  };

  const handleUploadPackage = async (values: UploadPackageFormValues) => {
    await onUploadPackage(values);
    setOpenStep(null);
  };

  const handleInstallService = async (values: DeployServiceFormValues) => {
    await onInstallService(values);
    setOpenStep(null);
  };

  const handleInitializeSite = async (values: InitializeSiteFormValues) => {
    await onInitializeSite(values);
    setOpenStep(null);
  };

  return (
    <div className="space-y-6 p-6">
      <FunctionIntroductionSection />
      <section>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle className="mb-0">
            {intl.formatMessage({
              id: "disasterRecoveryService.step.cardTitle",
              defaultMessage: "Installation and Deployment",
            })}
          </SectionTitle>
          <Button
            className="p-0"
            variant="link"
            onClick={() => setIsGuideVisible((visible) => !visible)}
          >
            <span className="flex items-center gap-1">
              {isGuideVisible ? <Icon type="eye-off" /> : <Icon type="eye" />}
              {isGuideVisible
                ? intl.formatMessage({
                    id: "disasterRecoveryService.guide.hide",
                    defaultMessage: "Hide Guide",
                  })
                : intl.formatMessage({
                    id: "disasterRecoveryService.guide.view",
                    defaultMessage: "View Guide",
                  })}
            </span>
          </Button>
        </div>
        {isGuideVisible && <InstallationGuide />}
        <SetupStepCard
          reuploading={reuploading}
          service={service}
          step={currentStep}
          onPrimaryClick={() => setOpenStep(currentStep)}
          onReupload={handlePrepareUpload}
          onTaskLogClick={onViewTasks}
        />
      </section>
      <StepFormDialog
        openStep={openStep}
        service={service}
        onInitializeSite={handleInitializeSite}
        onInstallService={handleInstallService}
        onOpenChange={handleDialogOpenChange}
        onUploadPackage={handleUploadPackage}
      />
    </div>
  );
});
