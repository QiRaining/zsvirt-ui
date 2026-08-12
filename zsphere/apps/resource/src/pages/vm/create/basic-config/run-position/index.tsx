import { useLazyQuery } from "@apollo/client";
import { queryClusterForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { queryHostForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/host.gql";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType, IQuery } from "@zstack/zsphere-types";
import { Op, HostState } from "@zstack/zsphere-types";
import _ from "lodash-es";
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
  zoneUuid: string;
  source: any;
}

const { Item } = Form;

const list2tree = (data: any[], pid: string) => {
  const result = [];
  for (const node of data ?? []) {
    if (node.parentUuid === pid) {
      const children = list2tree(data, node.uuid);
      if (children.length) {
        node.children = children;
      }
      result.push(node);
    }
  }
  return result;
};

//实际上这里只需要传source即可
const RunInPosition: React.FC<IProps> = ({ form, zoneUuid, source }) => {
  const intl = useIntl();
  const isEdit = source?.__typename === "VmInstance";
  const [runPathName, setRunPathName] = useState("");
  const [loading, setLoading] = useState(true);
  const [runPathTreeData, setRunPathTreeData] = useState<any[]>([]);

  const [getClusters, { data: clusterData }] = useLazyQuery(
    queryClusterForZSVCreateInstance,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [getHosts, { data: hostData }] = useLazyQuery(
    queryHostForZSVCreateInstance,
    {
      fetchPolicy: "no-cache",
    },
  );

  useEffect(() => {
    // Cluster和PrimaryStorage 都是自带zoneUuid
    const {
      __typename,
      zoneUuid: sourceZoneUuid,
      uuid: sourceUuid,
    } = source || {};

    const _zoneUuid = sourceZoneUuid || zoneUuid;

    const fetchClusterAndHosts = (
      clusterConditions: IQuery["conditions"],
      hostConditions: IQuery["conditions"],
    ) => {
      getClusters({ variables: { conditions: clusterConditions } });
      getHosts({ variables: { conditions: hostConditions } });
    };

    if (__typename === "PrimaryStorageVO") {
      setLoading(true);
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "primaryStorage.uuid", op: Op.eq, value: sourceUuid },
          { key: "hasL3Network", op: Op.eq, value: true },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "cluster.primaryStorage.uuid", op: Op.eq, value: sourceUuid },
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    } else if (__typename === "Cluster") {
      setLoading(true);
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "uuid", op: Op.eq, value: sourceUuid },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "clusterUuid", op: Op.eq, value: sourceUuid },
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    } else if (
      zoneUuid &&
      !["HostVO", "Cluster"].includes(__typename) &&
      !isEdit
    ) {
      setLoading(true);
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: zoneUuid },
          { key: "hasL3Network", op: Op.eq, value: true },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: zoneUuid },
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    }
  }, [zoneUuid, source, getClusters, getHosts, isEdit]);

  useEffect(() => {
    if (
      clusterData &&
      hostData &&
      ["HostVO"].indexOf(source?.__typename) === -1 &&
      !isEdit
    ) {
      const clusterList =
        clusterData?.clusterList?.list.filter((t: any) => t.hostNum !== 0) ??
        [];
      const hostsList = hostData?.hostList?.list ?? [];

      if (clusterList?.length > 0) {
        form.setFields([
          {
            name: "runPath",
            value: [clusterList[0]],
            touched: false,
          },
        ]);
      }

      const clusterTreeItems = clusterList.map((t: any) => {
        return {
          uuid: t.uuid,
          key: t.uuid,
          name: t.name,
          title: t.name,
          type: "cluster",
          parentUuid: "",
          attr: t,
        };
      });

      const hostTreeItems = hostsList.map((t: any) => {
        return {
          uuid: t.uuid,
          key: t.uuid,
          name: t.name,
          title: t.name,
          type: "host",
          parentUuid: t.cluster?.uuid,
          attr: t,
        };
      });

      const treeData =
        list2tree(clusterTreeItems.concat(hostTreeItems), "") ?? [];
      setLoading(false);
      setRunPathTreeData(treeData);
    }
  }, [clusterData, hostData, form, source, isEdit]);

  useEffect(() => {
    const typeName = source?.__typename;
    if (_.includes(["HostVO", "Cluster"], typeName) && !isEdit) {
      setRunPathName(source?.name);
      form.setFieldsValue({
        runPath: [source],
      });
    }
    if (isEdit && typeName === "VmInstance") {
      let runPath = "";
      if (source?.cluster) {
        //
        if (source?.host || source?.lastHost) {
          runPath = source?.host?.name || source?.lastHost?.name;
        } else {
          runPath = source?.cluster?.name;
        }
      }
      setRunPathName(runPath);
    }
  }, [source, form, isEdit]);

  if (["HostVO"].indexOf(source?.__typename) === -1 && !isEdit) {
    return (
      <Item
        label={intl.formatMessage({
          id: "virtualization.create.instance.run.path",
          defaultMessage: "Location",
        })}
        name="runPath"
      >
        <ModalTreeSelect
          treeData={runPathTreeData}
          loading={loading}
          modalWidth={800}
          title={intl.formatMessage({
            id: "virtualization.create.instance.run.path.select.modal.title",
            defaultMessage: "Select Location",
          })}
        />
      </Item>
    );
  }

  return (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.instance.run.path",
        defaultMessage: "Location",
      })}
      name="runPath"
    >
      <div>{runPathName}</div>
    </Item>
  );
};

export default React.memo(RunInPosition);
