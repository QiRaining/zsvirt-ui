import { useLazyQuery } from "@apollo/client";
import { clusterAndHostsTreeListForTemplateConvertToVM } from "@zstack/virtualization-resource/src/gql/vm-template.gql";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType } from "@zstack/zsphere-types";
import React, { useState, useEffect } from "react";
import { useIntl } from "react-intl";

import ModalTreeSelect from "./modal-tree-select";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  vmUuid: string;
}

const { Item } = Form;

const STYLE_MODAL_SELECT = { width: 320 } as const;
const RunInPosition: React.FC<IProps> = ({ form, vmUuid }) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const [runPathTreeData, setRunPathTreeData] = useState<any[]>([]);

  const [getClusterAndHosts, { data: clusterAndHostsData }] = useLazyQuery(
    clusterAndHostsTreeListForTemplateConvertToVM,
    {
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    if (vmUuid) {
      getClusterAndHosts({ variables: { uuid: vmUuid } });
    }
  }, [vmUuid]);

  useEffect(() => {
    if (
      clusterAndHostsData?.clusterAndHostsTreeListForTemplateConvertToVM?.list
    ) {
      setLoading(false);
      setRunPathTreeData(
        clusterAndHostsData?.clusterAndHostsTreeListForTemplateConvertToVM
          ?.list,
      );
    }
  }, [
    clusterAndHostsData?.clusterAndHostsTreeListForTemplateConvertToVM?.list,
    form,
  ]);

  return (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.instance.run.path",
        defaultMessage: "Location",
      })}
      name="runPath"
      // rules={[
      //   {
      //     required: true,
      //     message: intl.formatMessage({
      //       id: 'virtualization.create.instance.run.path.required',
      //       defaultMessage: '请选择运行位置'
      //     })
      //   }
      // ]}
    >
      <ModalTreeSelect
        style={STYLE_MODAL_SELECT}
        treeData={runPathTreeData}
        loading={loading}
        modalWidth={600}
        title={intl.formatMessage({
          id: "virtualization.create.instance.run.path.select.modal.title",
          defaultMessage: "Select Location",
        })}
      />
    </Item>
  );
};

export default React.memo(RunInPosition);
