import { useLazyQuery } from "@apollo/client";
// import VmNumaTopologyModal from '@zstack/virtualization-resource/src/pages/vm/action/numa-topology/numa-topology-modal'
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  getNUMATopology,
  vmInstanceList,
} from "@zstack/virtualization-resource/src/gql/vm.gql";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import { formatStorage, getGQL } from "@zstack/zsphere-utils";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "./style.module.less";

const CARD_HEAD_SELECTED_STYLE = { background: "var(--color-400)" } as const;
const CARD_HEAD_DEFAULT_STYLE = { background: "var(--neutral-700)" } as const;
const TOOLTIP_MARGIN_STYLE = { marginLeft: 4 } as const;
const VM_CARD_HOVER_STYLE = { background: "var(--neutral-200)" } as const;
const VM_CARD_DEFAULT_STYLE = { background: "var(--neutral-100)" } as const;

interface IProps {
  hostUuid: any;
  hostName: any;
  visible: boolean;
  setVisible: any;
}
const qeuryVmInfo = getGQL(vmInstanceList, [
  "name",
  "uuid",
  "cpuNum",
  "memorySize",
]);

const NumaTopologyModal: React.FC<IProps> = ({
  visible,
  setVisible,
  hostName,
  hostUuid,
}) => {
  const intl = useIntl();
  const [currentNode, setCurrentNode] = useState<number>(-1);
  const [_vmVisible, setVmVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState<string>();
  const [iconShow, setIconShow] = useState(false);
  const [getVmInstanceList, { data: dataSource }] = useLazyQuery(qeuryVmInfo);
  const vmList: [IVM] = dataSource?.vmInstanceList?.list ?? [];

  const [queryHostNUMATopology, { data: numaTopologyData }] =
    useLazyQuery(getNUMATopology);
  const { hostTopology = [] } = numaTopologyData?.getNUMATopology || {};

  useEffect(() => {
    if (visible) {
      queryHostNUMATopology({
        variables: {
          hostUuid,
        },
      });
    }
  }, [visible]);

  const handleClickNodeCard = (key: number) => {
    setCurrentNode(key);
    const uuids = hostTopology.filter(
      (cv: { node: number }) => cv.node === key,
    )[0]?.VMsUuid;
    getVmInstanceList({
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.in,
            values: uuids,
          },
        ],
      },
    });
  };
  const vmIconColor = (data: any) => {
    if (data.VMsUuid?.length !== 0) {
      return "#ffffff";
    }
    //默认状态
    if (currentNode !== data.node) {
      return "var(--neutral-500)";
    }
    //选中状态
    if (currentNode === data.node) {
      return "var(--neutral-400)";
    }
  };
  const NodeCard = ({ data }: any) => {
    return (
      <div
        className={style.card}
        onClick={() => handleClickNodeCard(data.node)}
      >
        <div
          className={style.cardHead}
          style={
            currentNode === data.node
              ? CARD_HEAD_SELECTED_STYLE
              : CARD_HEAD_DEFAULT_STYLE
          }
        >
          <div>Node-{data.node}</div>
          <div>
            <Icon type="monitor-fill" style={{ color: vmIconColor(data) }} />
            <span className={style.vmNum}>{data.VMsUuid?.length}</span>
          </div>
        </div>
        <div className={style.cardContent}>
          <div className={style.item}>
            <div className={style.name}>CPU</div>
            <div className={style.value}>
              {`${data?.cpus?.length} ${intl.formatMessage({
                id: "core",
                defaultMessage: "Cores",
              })}`}{" "}
            </div>
          </div>
          <div className={style.item}>
            <div className={style.name}>
              {intl.formatMessage({
                id: "total.memory",
                defaultMessage: "Total Memory",
              })}
            </div>
            <div className={style.value}>{formatStorage(data.size, 2)}</div>
          </div>
          <div className={style.item}>
            <div className={style.name}>
              {intl.formatMessage({
                id: "free.memorysizes",
                defaultMessage: "Free Memory",
              })}
            </div>
            <div className={style.value}>{formatStorage(data.free, 2)}</div>
          </div>
        </div>
      </div>
    );
  };
  const onMouseEnter = (key: string) => {
    setCurrentCard(key);
    setIconShow(true);
  };
  const onMouseLeave = () => {
    setCurrentCard("");
    setIconShow(false);
  };
  const [_vmInfo, setVmInfo] = useState({ vmUuid: "", vmName: "" });
  const hostTitle = useMemo(() => {
    return (
      <div>
        {intl.formatMessage({
          id: "host.numa.topology",
          defaultMessage: "pNUMA Topology:",
        })}{" "}
        {hostName}
        <span style={TOOLTIP_MARGIN_STYLE} />
        <Tooltip
          placement="right"
          title={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "host.numa.modal.title",
                defaultMessage: "***",
              })}
            </ReactMarkdown>
          }
        >
          <span>
            <Icon type="info" />
          </span>
        </Tooltip>
      </div>
    );
  }, [hostName, intl]);
  const goBack = () => {
    setTitle(hostTitle);
    setVmVisible(false);
  };
  const [title, setTitle] = useState(hostTitle);

  const jumpVmTopology = (vmUuid: string, vmName: string) => {
    setVmInfo({ vmUuid, vmName });
    const vmTitle = (
      <div className={style.titleContainer}>
        <div onClick={goBack} className={style.titleIconContainer}>
          <Icon type="arrow-ios-left" className={style.titleIcon} />
        </div>
        <div className={style.modalTitle}>
          {intl.formatMessage({
            id: "vnuma.topology",
            defaultMessage: "vNUMA Topology: ",
          })}
          {vmName}
        </div>
        <span style={TOOLTIP_MARGIN_STYLE} />
        <Tooltip
          placement="right"
          title={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "vm.numa.modal.title",
                defaultMessage: "***",
              })}
            </ReactMarkdown>
          }
        >
          <span>
            <Icon type="info" />
          </span>
        </Tooltip>
      </div>
    );
    setTitle(vmTitle);
    setVmVisible(true);
  };
  const VmCard = ({ data }: any) => {
    return (
      <div
        key={data?.uuid}
        role="none"
        className={style.card}
        style={
          currentCard === data?.uuid
            ? VM_CARD_HOVER_STYLE
            : VM_CARD_DEFAULT_STYLE
        }
        onMouseEnter={() => onMouseEnter(data?.uuid)}
        onMouseLeave={onMouseLeave}
      >
        <div className={style.container}>
          <span className={style.name}>{data?.name}</span>
          {currentCard === data?.uuid && iconShow && (
            <span
              onClick={() => jumpVmTopology(data?.uuid, data?.name)}
              className={style.icon}
            >
              <Icon type="arrow-right" />
            </span>
          )}
        </div>
        <div className={style.container}>
          <div className={style.cpu}>
            <Icon type="cpu" />
          </div>
          <div className={style.value}>
            {`${data?.cpuNum} ${intl.formatMessage({
              id: "core",
              defaultMessage: "Cores",
            })}`}{" "}
          </div>
          <div className={style.cpu}>
            <Icon type="network-card" />
          </div>
          <div className={style.value}>
            {formatStorage(data?.memorySize, 2)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <DialogBase
        title={title}
        visible={visible}
        widthClassName="w-[1152px]"
        footer={null}
        setVisible={setVisible}
      >
        <div className={style.wrapper}>
          <div className={style.content}>
            <div className={style.left}>
              <div className={style.title}>
                pNUMA Node（{hostTopology?.length}）
              </div>
              <div className={style.cardContainer}>
                {hostTopology?.map((item: any) => (
                  <NodeCard data={item} key={item?.node} />
                ))}
              </div>
            </div>
            <div className={style.right}>
              <div className={style.title}>
                {intl.formatMessage({
                  id: "associated.vm",
                  defaultMessage: "Associated VM",
                })}
                {currentNode !== -1 && (
                  <span className={style.num}>({vmList.length})</span>
                )}
              </div>
              {currentNode === -1 && (
                <>
                  <div className={style.empty}>
                    <img src={require("./image/search.svg")} alt="search" />
                  </div>
                  <div className={style.emptyTip}>
                    <div>
                      {" "}
                      {intl.formatMessage({
                        id: "choose.pNUMA.node",
                        defaultMessage: "Select pNUMA Node.",
                      })}
                    </div>
                  </div>
                </>
              )}

              {currentNode !== -1 &&
                vmList?.map((item) => <VmCard data={item} key={item?.uuid} />)}
            </div>
          </div>
          {/* <VmNumaTopologyModal
            openFromHost={true}
            vmName={vmInfo.vmName}
            hostName={hostName}
            vmUuid={vmInfo.vmUuid}
            hostUuid={hostUuid}
            visible={vmVisible}
            setHostVisible={setVisible}
            setVisible={setVmVisible}
          /> */}
        </div>
      </DialogBase>
    </>
  );
};

export default NumaTopologyModal;
