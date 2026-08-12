import ScsiLunList from "@zstack/virtualization-resource/src/pages/scsi-lun/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Form } from "@zstack/zsphere-components";
import { Op, ScsiLunQueryType } from "@zstack/zsphere-types";
import type { Volume as IVolume } from "@zstack/zsphere-types/graphql";
import { keys } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  index: number;
  isEdit: boolean;
  originValue?: IVolume;
  source: any;
  formValues?: any;
}

const { Item } = Form;

const STYLE_WIDTH_200 = { width: 200 } as const;

const RDMDisk: React.FC<IProps> = ({
  index,
  isEdit,
  originValue,
  source,
  formValues,
}) => {
  const intl = useIntl();
  const sourceType = source?.__typename;

  const values = useMemo(() => {
    return formValues;
  }, [formValues]);

  const runPath = values.runPath;

  const lunUuids = keys(values)
    .filter((key) => key.indexOf("RDM-") > -1 && values?.[key]?.length)
    .map((key) => values?.[key]?.[0]?.uuid);

  let lunDefaultQuery = {};

  const isHost =
    runPath[0]?.__typename === "HostVO" || runPath[0]?.__typename === "Host";
  lunDefaultQuery = {
    type: isHost
      ? ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByHost
      : ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByCluster,
    conditions: [
      {
        key: "uuid",
        op: Op.notIn,
        values: lunUuids.filter(
          (uuid) => uuid !== values?.[`RDM-${index}`]?.[0]?.uuid,
        ),
      },
    ],
    extraConditions: [
      {
        key: isHost ? "hostUuid" : "clusterUuid",
        op: Op.eq,
        value:
          runPath?.[0]?.uuid ||
          source?.uuid ||
          (isHost ? undefined : source?.clusterUuid),
      },
    ],
  };

  if (isEdit && sourceType === "VmInstance") {
    lunDefaultQuery = {
      ...lunDefaultQuery,

      type: ScsiLunQueryType.GetScsiLunCandidatesForAttachingVm,
      extraConditions: [
        {
          key: "vmInstanceUuid",
          op: Op.eq,
          value: source?.uuid,
        },
      ],
    };
  }

  return (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.instance.hardware.disk.createType.Lun",
        defaultMessage: "LUN",
      })}
      name={`RDM-${index}`}
      rules={[
        {
          required: true,
          message: intl.formatMessage({
            id: "instance.field.disk.rdm.validator.required",
            defaultMessage: "Select a LUN.",
          }),
        },
      ]}
    >
      <ModalSelect
        disabledItem={!!originValue}
        style={STYLE_WIDTH_200}
        title={intl.formatMessage({
          id: "virtualization.create.instance.select.Lun",
          defaultMessage: "Select LUN",
        })}
      >
        <ScsiLunList view="select" defaultQuery={lunDefaultQuery} />
      </ModalSelect>
    </Item>
  );

  // return (
  //   <Item
  //     noStyle
  //     shouldUpdate={(pre, cur) => {
  //       const result =
  //         pre[`diskImage-${index}`]?.[0]?.uuid !== cur[`diskImage-${index}`]?.[0]?.uuid ||
  //         pre.guest !== cur.guest
  //       return result
  //     }}
  //   >
  //     {({ getFieldsValue }) => {
  //       const values = formValues

  //       const runPath = values.runPath

  //       const lunUuids = _.keys(values)
  //         .filter(key => key.indexOf('RDM-') > -1 && values?.[key]?.length)
  //         .map(key => values?.[key]?.[0]?.uuid)

  //       let lunDefaultQuery = {}

  //       const isHost = runPath[0]?.__typename === 'HostVO' || runPath[0]?.__typename === 'Host'
  //       lunDefaultQuery = {
  //         type: isHost
  //           ? ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByHost
  //           : ScsiLunQueryType.GetScsiLunCandidatesForAttachingZSVInstanceByCluster,
  //         conditions: [
  //           {
  //             key: 'uuid',
  //             op: Op.notIn,
  //             values: lunUuids.filter(uuid => uuid !== values?.[`RDM-${index}`]?.[0]?.uuid)
  //           }
  //         ],
  //         extraConditions: [
  //           {
  //             key: isHost ? 'hostUuid' : 'clusterUuid',
  //             op: Op.eq,
  //             value:
  //               runPath?.[0]?.uuid || source?.uuid || (isHost ? undefined : source?.clusterUuid)
  //           }
  //         ]
  //       }

  //       if (isEdit && sourceType === 'VmInstance') {
  //         lunDefaultQuery = {
  //           ...lunDefaultQuery,
  //           ...{
  //             type: ScsiLunQueryType.GetScsiLunCandidatesForAttachingVm,
  //             extraConditions: [
  //               {
  //                 key: 'vmInstanceUuid',
  //                 op: Op.eq,
  //                 value: source?.uuid
  //               }
  //             ]
  //           }
  //         }
  //       }

  //       return (
  //         <Item
  //           label={intl.formatMessage({
  //             id: 'virtualization.create.instance.hardware.disk.createType.Lun',
  //             defaultMessage: 'LUN设备'
  //           })}
  //           name={`RDM-${index}`}
  //           rules={[
  //             {
  //               required: true,
  //               message: intl.formatMessage({
  //                 id: 'instance.field.disk.rdm.validator.required',
  //                 defaultMessage: '请选择LUN设备'
  //               })
  //             }
  //           ]}
  //         >
  //           <ModalSelect
  //             disabledItem={!!originValue}
  //             style={{ width: 200 }}
  //             title={intl.formatMessage({
  //               id: 'virtualization.create.instance.select.Lun',
  //               defaultMessage: '选择LUN设备'
  //             })}
  //           >
  //             <ScsiLunList view="select" defaultQuery={lunDefaultQuery} />
  //           </ModalSelect>
  //         </Item>
  //       )
  //     }}
  //   </Item>
  // )
};

export default React.memo(RDMDisk);
