import { gql, useApolloClient } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { ovfExportList } from "@zstack/virtualization-resource/src/gql/vm.gql";
import BackupStorageList from "@zstack/virtualization-resource/src/pages/backup-storage/list";
import { downloadImageFile } from "@zstack/virtualization-resource/src/pages/vm/config/useActionConfig";
import {
  ModalSelect,
  Form,
  Modal,
  useSetTab,
} from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  useAction,
  useValidator,
  IIsRequiredType,
} from "@zstack/zsphere-hooks";
import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import qs from "qs";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useLocation, useNavigate } from "react-router";
import {
  ExportType,
  useGetExportTypeMap,
} from "zsv_resource_shared/image/utils";

import styles from "./style.module.less";

const GQL = gql`
  mutation exportOvf($input: ExportVmInstanceFromOvfInput!) {
    exportOvf(input: $input) {
      actionId
    }
  }
`;

const STYLE_LINK = {
  display: "inline-block",
  cursor: "pointer",
  color: "var(--color-600)",
} as const;

const Action: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  setVisible,
  selectedList = [],
}) => {
  const intl = useIntl();
  const vm = selectedList[0];
  const location = useLocation();
  const navigate = useNavigate();
  const { setTabMultiple } = useSetTab();
  const { isRequired } = useValidator(intl);
  const { exportTypeMap } = useGetExportTypeMap(intl);
  const apolloClient = useApolloClient();
  const { handleHttpsDownload } = useHandleHttpsDownload();

  const queryBackupStorageConditions = useMemo(() => {
    return {
      conditions: [
        { key: "state", op: Op.eq, value: "Enabled" },
        { key: "status", op: Op.eq, value: "Connected" },
        { key: "zone.uuid", op: Op.eq, value: selectedList?.[0]?.zoneUuid },

        { key: "type", op: Op.ne, value: "Ceph" },
        {
          key: "__systemTag__",
          op: Op.notIn,
          values: ["remote", "onlybackup", "aliyun", "remotebackup"],
        },
      ],
    };
  }, [selectedList]);

  const [form] = Form.useForm();

  const initialValues = {
    exportType: ExportType.ExportAndDownload,
    backupStorage: [],
  };

  const doAction = useAction();

  const onAddOk = async (value: any) => {
    const backupStorageUuid = value.backupStorage?.[0]?.uuid;
    const { search } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const leftNav = searchObj?.leftnav || LeftNavType.ClusterHost;
    const navView = searchObj?.navView || NavView.Resource;
    const url = `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`;
    const bsDomInMessage = (
      <a
        style={STYLE_LINK}
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
            { contentId: "export", newKey: "vm", newPath: "/root-node/detail" },
          ]);
          navigate(url);
        }}
      >
        {intl.formatMessage({
          id: "vm.export.alert.list",
          defaultMessage: "Export Record  ",
        })}
      </a>
    );
    const selectedExportType = form.getFieldValue("exportType");
    doAction({
      mutation: GQL,
      payload: selectedList.map((ele) => {
        return {
          vmUuid: ele.uuid,
          backupStorageUuid,
          name: ele.name,
        };
      }),
      name: intl.formatMessage({
        id: "vm.export.ova",
        defaultMessage: "Export OVA Template",
      }),
      type: "VmInstance",
      total: selectedList.length,
      successMessage:
        selectedExportType === ExportType.ExportAndDownload
          ? intl.formatMessage(
              {
                id: "vm.exportAndDownload.alert.prefix",
                defaultMessage:
                  "OVA template export succeeded and starts downloading. View and download files at {m}.",
              },
              { m: bsDomInMessage },
            )
          : intl.formatMessage(
              {
                id: "vm.exportOnly.alert.prefix",
                defaultMessage:
                  "Export OVA template succeeded. View and download files at {m}.",
              },
              { m: bsDomInMessage },
            ),
      forceRunCallback: true,
      onFinish: () => {
        if (selectedExportType === ExportType.ExportAndDownload) {
          apolloClient
            .query({
              query: ovfExportList,
              variables: {
                conditions: [
                  {
                    key: "vmUuid",
                    value: selectedList?.[0]?.uuid,
                  },
                ],
              },
            })
            .catch(() => ({ data: null }))
            .then(({ data }) => {
              const exportUrl = data?.ovfExportList?.list?.[0]?.exportUrl;
              if (window.location.protocol === "https:") {
                handleHttpsDownload(
                  exportUrl || (selectedList[0] as any)?.exportUrl,
                );
              } else {
                downloadImageFile(selectedList, exportUrl);
              }
            });
        }
      },
    });
  };

  if (vm) {
    return (
      <>
        <DialogForm
          visible={visible}
          setVisible={setVisible}
          form={form}
          onOk={onAddOk}
          alertMessage={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.export.ova.templage.alert.info",
                defaultMessage: `1. For virtual machines with large files, it's recommended to select Export Only. After exporting, you can go to the Export List tab to view and download.
2. For virtual machines with small to medium-sized files, you can directly select Export and Download.
3. The exported OVA template does not include ISO drives and GPU devices.`,
              })}
            </ReactMarkdown>
          }
          alertType="info"
          title={intl.formatMessage({
            id: "vm.export.ova",
            defaultMessage: "Export OVA Template",
          })}
          resourceName={formatResourceName(selectedList, intl)}
        >
          <Form form={form} initialValues={initialValues}>
            <Form.Item
              name="exportType"
              label={intl.formatMessage({
                id: "export.type",
                defaultMessage: "Export Method",
              })}
            >
              <RadioGroup
                options={Object.keys(ExportType).map((type) => ({
                  value: type,
                  label: exportTypeMap.get(type as ExportType),
                }))}
              />
            </Form.Item>
            <Form.Item
              validateFirst
              rules={[isRequired(IIsRequiredType.select)]}
              name="backupStorage"
              label={intl.formatMessage({
                id: "virtualization.image.storage",
                defaultMessage: "Image Storage",
              })}
              required
              description={intl.formatMessage({
                id: "virtualization.image.storage.desc",
                defaultMessage: "Supports exporting to standalone image storage.",
              })}
            >
              <ModalSelect
                title={intl.formatMessage({
                  id: "select.backupStorage",
                  defaultMessage: "Select Image Storage",
                })}
                className={styles["width-320"]}
                modalWidth={800}
              >
                <BackupStorageList
                  view="select"
                  defaultQuery={queryBackupStorageConditions}
                />
              </ModalSelect>
            </Form.Item>
          </Form>
        </DialogForm>
      </>
    );
  }
  return null;
};

export default Action;
