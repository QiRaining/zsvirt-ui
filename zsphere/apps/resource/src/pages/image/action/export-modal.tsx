import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { RadioGroupField, useDialogHookFormAdapter } from "@zstack/form";
import { useSetTab } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type {
  ExportImagePayload as IExportImagePayload,
  Image as IImage,
} from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import qs from "qs";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router";
import {
  ExportType,
  useGetExportTypeMap,
  downloadImageFile,
} from "zsv_resource_shared/image/utils";

import { createImageExportSchema, type ImageExportFormValues } from "./schema";

const GQL = gql`
  mutation exportImage($input: ExportImageInput!) {
    exportImage(input: $input) {
      actionId
    }
  }
`;

const LINK_STYLE = {
  display: "inline-block",
  cursor: "pointer",
  color: "var(--color-600)",
} as const;

const Action: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const { setTabMultiple } = useSetTab();
  const location = useLocation();
  const navigate = useNavigate();
  const doAction = useAction();
  const { exportTypeMap } = useGetExportTypeMap(intl);
  const defaultValues = useMemo<ImageExportFormValues>(
    () => ({
      exportType: ExportType.ExportAndDownload,
    }),
    [],
  );
  const formSchema = useMemo(() => createImageExportSchema(), []);
  const form = useForm<ImageExportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const { handleHttpsDownload } = useHandleHttpsDownload();

  const onOk = async (values: ImageExportFormValues) => {
    const backupStorageUuid =
      selectedList?.[0]?.backupStorageRefs?.[0]?.backupStorageUuid || "";
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;
    const bsDomInMessage = (
      <a
        style={LINK_STYLE}
        href={url}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTabMultiple([
            {
              contentId: "main-tab",
              newKey: "export",
              newPath: "/root-node/detail",
            },
            {
              contentId: "export",
              newKey: "image",
              newPath: "/root-node/detail",
            },
          ]);
          navigate(url);
        }}
      >
        {intl.formatMessage({
          id: "image.export.alert.list",
          defaultMessage: "Export List",
        })}
      </a>
    );
    const selectedExportType = values.exportType;

    const payload: IExportImagePayload = {
      imageUuid: selectedList?.[0]?.uuid,
      backupStorageUuid,
      type: selectedList?.[0]?.backupStorage?.type,
    };

    doAction({
      mutation: GQL,
      payload,
      name: intl.formatMessage({
        id: "export.image",
        defaultMessage: "Export Image",
      }),
      total: 1,
      type: "Image",
      forceRunCallback: true,
      onFinish: (data: any) => {
        refetch?.();
        if (selectedExportType === ExportType.ExportAndDownload) {
          if (window.location.protocol === "https:") {
            handleHttpsDownload(
              data?.inventory?.backupStorageRefs?.exportUrl ||
                selectedList[0]?.backupStorageRefs?.[0].exportUrl,
            );
          } else {
            downloadImageFile(
              selectedList,
              data?.inventory?.backupStorageRefs?.exportUrl,
            );
          }
        }
      },
      successMessage:
        selectedExportType === ExportType.ExportAndDownload
          ? intl.formatMessage(
              {
                id: "image.exportAndDownload.alert.prefix",
                defaultMessage:
                  "Image export succeeded and starts downloading. View and download files at {m}.",
              },
              { m: bsDomInMessage },
            )
          : intl.formatMessage(
              {
                id: "image.exportOnly.alert.prefix",
                defaultMessage:
                  "Export image succeeded. View and download files at {m}.",
              },
              { m: bsDomInMessage },
            ),
    });

    setSelectedList?.([]);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "export.image",
        defaultMessage: "Export Image",
      })}
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      onOk={onOk}
      alertType="info"
      alertMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "image.export.modal.alert.info",
            defaultMessage: `1. For large image files, it is recommended to select Export Only. After the export, you can view and download the image files on the Export List tab.
2. For medium- and small-sized image files, you can select Export and Download.`,
          })}
        </ReactMarkdown>
      }
      resourceName={formatResourceName(selectedList, intl)}
    >
      <Form {...form}>
        <RadioGroupField
          form={form}
          name="exportType"
          label={intl.formatMessage({
            id: "export.type",
            defaultMessage: "Export Method",
          })}
          hint={
            <ReactMarkdown>
              {intl.formatMessage(
                {
                  id: "image.export.modal.exportType.description",
                  defaultMessage: "Export the image to image storage <{backupStorageName}>.",
                },
                {
                  backupStorageName: selectedList?.[0]?.backupStorage?.name,
                },
              )}
            </ReactMarkdown>
          }
          variant="button"
          options={Object.keys(ExportType).map((type) => ({
            value: type,
            label: exportTypeMap.get(type as ExportType),
          }))}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
