import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { Icon } from "@zstack/icon";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import AdvanceCard from "./advance-card";
import BasicCard from "./basic-card";
import CloneCard from "./clone-card";
import type { CloneVmValues } from "./schema";
import { createCloneVmSchema } from "./schema";
import {
  buildCloneVmPayload,
  CloneTypeEnum,
  getCloneInitialValues,
} from "./utils";

const cloneVmInstanceMutation = gql`
  mutation cloneVmInstance($input: CloneVmInstanceInput!) {
    cloneVmInstance(input: $input) {
      actionId
    }
  }
`;

type ValidationErrorField = {
  name: (string | number)[];
  errors: string[];
};

const getValidateFailedLabel = (
  intl: ReturnType<typeof useIntl>,
  fieldName: string,
  fullName: string,
) => {
  const map: Record<string, string> = {
    name: intl.formatMessage({
      id: "name.validate.failed",
      defaultMessage: "  Name",
    }),
    count: intl.formatMessage({
      id: "virtualization.create.instance.count",
      defaultMessage: "Quantity",
    }),
    l3NetworkUuids: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.port.group.validate.failed",
      defaultMessage: "NIC-Port Group",
    }),
    hostname: intl.formatMessage({
      id: "virtualization.create.instance.config.general.hostname",
      defaultMessage: "Hostname",
    }),
    vmGroupList: intl.formatMessage({
      id: "virtualization.create.instance.config.general.schduled.group",
      defaultMessage: "VM Scheduling Group",
    }),
  };

  return map[fieldName] ?? fullName;
};

const CloneVmInstance: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [currentCloneType, setCurrentCloneType] = useState(
    CloneTypeEnum.FullClone,
  );
  const [validateFailedModalVisible, setValidateFailedModalVisible] =
    useState(false);
  const [errorFields, setErrorFields] = useState<ValidationErrorField[]>([]);

  const sourceVm = selectedList?.[0];
  const initialValues = useMemo(
    () => getCloneInitialValues(sourceVm, intl),
    [sourceVm, intl],
  );
  const formSchema = useMemo(() => createCloneVmSchema(intl), [intl]);
  const form = useForm<CloneVmValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, initialValues);

  const validateFailedTitle = intl.formatMessage({
    id: "please.fix.these.shit",
    defaultMessage: "Review the Following Configurations",
  });

  const validateFailedContent = useMemo(() => {
    return errorFields.map(({ name, errors }) => {
      const fieldName = name[0]?.toString().split("-")[0] ?? "";
      const fullName = name.join(".");
      const label = getValidateFailedLabel(intl, fieldName, fullName);

      return <div key={fullName}>{`${label}: ${errors[0]}`}</div>;
    });
  }, [errorFields, intl]);

  useEffect(() => {
    if (visible) {
      setCurrentCloneType(CloneTypeEnum.FullClone);
    }
    form.reset(initialValues);
  }, [visible, form, initialValues]);

  const onFinish = (values: CloneVmValues) => {
    const payload = buildCloneVmPayload({
      values,
      sourceVm,
      cloneType: currentCloneType,
    });

    doAction({
      mutation: cloneVmInstanceMutation,
      payload,
      name: intl.formatMessage({
        id: "vm.clone",
        defaultMessage: "Clone Virtual Machine",
      }),
      total: 1,
      type: "VmInstance",
      onProgress: () => {},
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <>
      <DialogForm
        title={intl.formatMessage({
          id: "vm.clone",
          defaultMessage: "Clone Virtual Machine",
        })}
        widthClassName="w-200"
        closable
        onCancel={() => setVisible(false)}
        visible={visible}
        onOk={onFinish as any}
        form={dialogForm}
        setVisible={setVisible}
        resourceName={formatResourceName(selectedList, intl)}
        onValidationError={(fields) => {
          setErrorFields(fields ?? []);
          setValidateFailedModalVisible(true);
        }}
      >
        <Alert variant="warning">
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.field.clone.tips",
              defaultMessage: `1. Online cloning VMs only clones the data that has already been written to disk at the start of cloning and does not include real-time cache data.
2. To ensure data integrity, it is recommended to pause or power off high I/O VMs before the cloning.`,
            })}
          </ReactMarkdown>
        </Alert>
        <Form {...form}>
          <div className="pt-6">
            <CloneCard
              form={form as any}
              setCurrentCloneType={setCurrentCloneType}
            />
            <BasicCard form={form as any} />
            <AdvanceCard
              form={form as any}
              visible={visible}
              sourceVm={sourceVm}
              currentCloneType={currentCloneType}
            />
          </div>
        </Form>
      </DialogForm>

      <Dialog open={validateFailedModalVisible}>
        <DialogContent style={{ width: 420 }}>
          <DialogHeader className="h-12 justify-between">
            <DialogTitle>{validateFailedTitle}</DialogTitle>
            <Icon
              type="close"
              className="h-5 w-5 cursor-pointer text-neutral-700"
              onClick={() => setValidateFailedModalVisible(false)}
            />
          </DialogHeader>
          <DialogDivider />
          <DialogBody>
            <Alert variant="warning">{validateFailedTitle}</Alert>
            <div className="mt-3">{validateFailedContent}</div>
          </DialogBody>
          <DialogDivider />
          <DialogFooter className="gap-2">
            <Button
              key="submit"
              variant="primary"
              onClick={() => setValidateFailedModalVisible(false)}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CloneVmInstance;
