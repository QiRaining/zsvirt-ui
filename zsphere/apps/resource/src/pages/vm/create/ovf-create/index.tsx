import { createInstanceFromOvf } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { Form } from "@zstack/zsphere-components";
import { useAction, useUploadTargetTime } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmCreationStrategy } from "@zstack/zsphere-types";
import type {
  CreateInstancePayload,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import { FileUpload } from "@zstack/zsphere-utils";
import type { UploadProps } from "antd";
import _ from "lodash-es";
import React, { useCallback, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import ModalZSV from "../components/modal-zsv";
import { CreateInstanceContext } from "../context";
import { nicBandWidthList } from "../hardware-and-config/hardware/netcard/utils";
import { getZoneUuidBySource } from "../hooks/get-zoneuuid";
import BasicCard from "./basic-card";
import AdvancePart from "./config-card";
import UploadCard from "./upload-card";
import { initialValues } from "./utils";

import style from "./style.module.less";

const CreateInstance: React.FC<IActionWrapperProps<IVM>> = ({
  visible,
  source,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const getUploadTargetTime = useUploadTargetTime();
  const [form] = Form.useForm();

  const realSource =
    selectedList.length !== 0 ? selectedList[0] : (source as any);

  const { setRealSource } = React.useContext(CreateInstanceContext);

  //需要全局配置决定一些参数的默认值，比如硬盘数量，待PM整理

  const zoneUuid = useMemo(() => {
    return getZoneUuidBySource(realSource);
  }, [realSource]);

  useEffect(() => {
    setRealSource?.((pre: any) => ({
      ...pre,
      zoneUuid,
      realSource,
    }));
  }, [realSource, zoneUuid, setRealSource]);

  const submitHandle = useCallback(
    async (e: any) => {
      const params = _.cloneDeep(e);

      try {
        const {
          backupStorage,
          xmlBase64,
          runPath,
          vmdkDragger,
          tags,
          name,
          strategy,
          ha,
          group,
        }: any = params;

        const vmNicConfigList: any = [];

        Object.keys(params).forEach((key) => {
          const formatValue = (value: number) => {
            return (value && value.toString()) || undefined;
          };

          //nicConfig
          if (key.indexOf("l3NetworkUuids-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].l3NetworkUuid =
                params[key]?.[0]?.uuid;
              vmNicConfigList[Number(key.split("-")[1])].enableSRIOV =
                params[key]?.[0]?.enableSRIOV;
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].l3NetworkUuid =
                params[key]?.[0]?.uuid;
              vmNicConfigList[Number(key.split("-")[1])].enableSRIOV =
                params[key]?.[0]?.enableSRIOV;
            }
          }
          if (key.indexOf("nicType-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].driverType =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].driverType =
                params[key];
            }
          }
          if (key.indexOf("inboundBandwidth-") !== -1) {
            const inboundBandwidth = formatValue(
              (params[key]?.number ?? 0) *
                1024 **
                  (nicBandWidthList.findIndex(
                    (unit) => unit === params[key]?.unit,
                  ) +
                    1),
            );

            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].inboundBandwidth =
                inboundBandwidth;
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].inboundBandwidth =
                inboundBandwidth;
            }
          }
          if (key.indexOf("netCardState-") !== -1) {
            const stateValye = params[key] ? "enable" : "disable";
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].state = stateValye;
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].state = stateValye;
            }
          }
          if (key.indexOf("outboundBandwidth-") !== -1) {
            const outboundBandwidth = formatValue(
              (params[key]?.number ?? 0) *
                1024 **
                  (nicBandWidthList.findIndex(
                    (unit) => unit === params[key]?.unit,
                  ) +
                    1),
            );
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].outboundBandwidth =
                outboundBandwidth;
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].outboundBandwidth =
                outboundBandwidth;
            }
          }
          if (key.indexOf("securityGroup-") !== -1) {
            const securityGroupUuidList = _.compact(params[key]).map(
              (it: any) => it.uuid,
            );

            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].securityGroupList =
                securityGroupUuidList;
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].securityGroupList =
                securityGroupUuidList;
            }
          }
          if (key.indexOf("customMac-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].customMac =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].customMac =
                params[key];
            }
          }
          if (key.indexOf("gateway4-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].ipv4Gateway =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].ipv4Gateway =
                params[key];
            }
          }
          if (key.indexOf("gateway6-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].ipv6Gateway =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].ipv6Gateway =
                params[key];
            }
          }
          if (key.indexOf("ipv4-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].staticIp = params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].staticIp = params[key];
            }
          }
          if (key.indexOf("ipv6-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].staticIpv6 =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].staticIpv6 =
                params[key];
            }
          }
          if (key.indexOf("netmask-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].ipv4Netmask =
                params[key];
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].ipv4Netmask =
                params[key];
            }
          }
          if (key.indexOf("prefixLen-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].ipv6Prefix = Number(
                params[key],
              );
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].ipv6Prefix = Number(
                params[key],
              );
            }
          }
          if (key.indexOf("nicMultiQueueNum-") !== -1) {
            if (vmNicConfigList[Number(key.split("-")[1])]) {
              vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum =
                String(params[key]);
            } else {
              vmNicConfigList[Number(key.split("-")[1])] = {};
              vmNicConfigList[Number(key.split("-")[1])].nicMultiQueueNum =
                String(params[key]);
            }
          }
        });

        const _data: CreateInstancePayload = {
          name,
          defaultL3NetworkUuid: "",
          ha: ha ? "NeverStop" : "None",
          strategy: strategy
            ? VmCreationStrategy.InstantStart
            : VmCreationStrategy.CreateStopped,
        };

        if (group) {
          _data.group = group.value;
        }

        //只传入有数据的部分
        const vmNicConfigListWithData = vmNicConfigList.filter(
          (t: any) => t.l3NetworkUuid,
        );
        if (
          vmNicConfigListWithData?.length !== 0 &&
          vmNicConfigListWithData?.[0]?.l3NetworkUuid
        ) {
          _data.vmNicConfig = vmNicConfigListWithData;
          _data.l3NetworkUuids = vmNicConfigListWithData.map(
            (t: any) => t.l3NetworkUuid,
          );
          _data.defaultL3NetworkUuid =
            vmNicConfigListWithData?.[0]?.l3NetworkUuid;

          _data.vmNicParams = JSON.stringify(
            vmNicConfigListWithData.map((t: any) => {
              const result: any = { l3NetworkUuid: t.l3NetworkUuid };

              if (t.customMac) {
                result.mac = t.customMac;
              }

              if (t.staticIp) {
                result.ip = t.staticIp;
              }

              if (t.ipv4Netmask) {
                result.netmask = t.ipv4Netmask;
              }

              if (t.ipv4Gateway) {
                result.gateway = t.ipv4Gateway;
              }

              if (t.staticIpv6) {
                result.ip6 = t.staticIpv6;
              }

              if (t.ipv6Prefix) {
                result.ipv6Prefix = t.ipv6Prefix;
              }

              if (t.ipv6Gateway) {
                result.ipv6Gateway = t.ipv6Gateway;
              }

              if (t.driverType) {
                result.driverType = t.driverType;
              }

              if (t.nicMultiQueueNum) {
                result.multiQueueNum = String(t.nicMultiQueueNum);
              } else {
                result.multiQueueNum =
                  (_data.cpuNum as number) < 12 ? String(_data.cpuNum) : "12";
              }

              if (t.outboundBandwidth) {
                result.outboundBandwidth = t.outboundBandwidth;
              }

              if (t.inboundBandwidth) {
                result.inboundBandwidth = t.inboundBandwidth;
              }
              if (t.state) {
                result.state = t.state;
              }

              return result;
            }),
          );
        }

        if (runPath?.[0]?.__typename === "Cluster") {
          // 如后端要求，没有选host，就不传hostUuid
          //_data.hostUuid = runPath?.[0]?.host?.uuid ?? ''
          _data.clusterUuid = runPath?.[0]?.uuid ?? "";
        }

        if (runPath?.[0]?.__typename === "HostVO") {
          _data.clusterUuid = runPath?.[0]?.cluster?.uuid ?? "";
          _data.hostUuid = runPath?.[0]?.uuid ?? "";
        }

        const storePath =
          realSource?.__typename === "PrimaryStorageVO"
            ? realSource
            : params?.storePath?.[0];

        _data.tagUuids = tags.map(({ uuid }: any) => uuid);
        _data.rootPrimaryStorageUuid = storePath?.uuid;
        _data.cdromList = [{ cdRom: "CD-ROM 01" }];

        if (storePath?.type === "Ceph" && params?.storagePool?.[0]) {
          const storagePool = params.storagePool[0];
          _data.rootPoolName = storagePool.poolName;
          if (vmdkDragger?.fileList?.length > 1) {
            _data.dataPoolName = storagePool.poolName;
          }
        }

        const resp = await doAction({
          mutation: createInstanceFromOvf,
          payload: {
            jsonCreateVmParam: JSON.parse(JSON.stringify(_data)),
            xmlBase64,
            backupStorageUuid: backupStorage?.[0].uuid,
          },
          name: intl.formatMessage({
            id: "instance.modal.title.import",
            defaultMessage: "Import Virtual Machine",
          }),
          total: 1,
          type: "VmInstance",
        });
        console.log(resp, "import vm resp");

        const filelist: UploadProps["fileList"] = vmdkDragger.fileList;
        // const paths: { fileName: string; uuid: string; installPath: string }[] = resp.installPath
        const parsed = JSON.parse(resp.data.createInstanceFromOvf.jobResult);
        const paths: [{ fileName: string; uuid: string; installPath: string }] =
          parsed.uploadInfos;
        console.log(paths, "paths");
        const targetUploadTime = await getUploadTargetTime("image");
        paths.forEach((ele) => {
          const file = filelist?.find(
            (_file: { name: string }) => _file.name === ele.fileName,
          );
          const uuid = parsed.realUuid;
          const newProcess = new FileUpload(
            file?.originFileObj as File,
            ele.installPath,
            uuid,
            ele.uuid,
            0,
            "image",
            undefined,
            { targetUploadTime },
          );
          newProcess.launch();
        });
      } catch (e) {
        console.log("创建失败", e);
      }
    },
    [doAction, getUploadTargetTime],
  );

  return (
    <CreateInstanceContext.Provider
      value={{
        zoneUuid,
        realSource,
      }}
    >
      <ModalZSV
        title={intl.formatMessage({
          id: "instance.modal.title.import",
          defaultMessage: "Import Virtual Machine",
        })}
        className={style["create-vm-modal"]} //先改云主机，后续若全局，直接改组件
        form={form}
        width={800}
        visible={visible}
        setVisible={setVisible}
        onOk={submitHandle}
        destroyOnClose
        onCancel={() => setVisible(false)}
        getContainer={document.body}
      >
        <Form form={form} className={style.form} initialValues={initialValues}>
          <UploadCard form={form} />
          <BasicCard form={form} source={realSource} />
          <AdvancePart form={form} />
        </Form>
      </ModalZSV>
    </CreateInstanceContext.Provider>
  );
};

export default CreateInstance;
