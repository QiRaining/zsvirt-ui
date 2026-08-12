import type {
  useColumnConfig,
  useActionConfig,
} from "@zstack/zsphere-engine/src/l2-network";
import { useMemo } from "react";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type ColumnKeys = Exclude<
  ArrayElement<NonNullable<Parameters<typeof useColumnConfig>[0]>>["key"],
  "__action__"
>;
type ActionKeys = ArrayElement<
  NonNullable<Parameters<typeof useActionConfig>[0]>
>["key"];

interface GraphqlConfigProps {
  columns: {
    [key in ColumnKeys]?: string[];
  };
  actions: {
    [key in ActionKeys]?: string[];
  };
}
// clusterUuid
const useGraphqlConfig: () => GraphqlConfigProps = () => {
  return useMemo(
    () => ({
      columns: {
        uuid: ["uuid"],
        // 为了拿到portGroups的信息，先这样
        // todo: 需要达成一个需求是拿表格不展示的字段
        name: ["uuid", "name", "isDefault", "portGroups"],
        type: ["type"],
        networkAccelerationMode: ["enableSRIOV", "vSwitchType"],
        physicalInterface: ["physicalInterface"],
        vni: ["vni", "vlan"],
        "virtualization.vni": ["vni", "vlan"],
        shareType: ["shareType"],
        owner: ["owner", "uuid"],
        createDate: ["createDate"],
      },
      actions: {
        "l2.network.create": ["uuid", "name"],
        "create.vxlan": [""],
        edit: ["uuid", "name", "description"],
        "virtualization.edit.nameandDescription": [
          "uuid",
          "name",
          "description",
        ],
        "delete.vxlan": ["uuid", "name"],
        "attach.in.cluster": ["uuid", "systemTags"],
        "detach.in.cluster": ["uuid", "name"],
        "attach.in.baremetal.cluster": ["uuid"],
        "detach.in.baremetal.cluster": ["uuid", "name"],
        "attach.in.baremetal2.cluster": ["uuid"],
        "detach.in.baremetal2.cluster": ["uuid", "name"],
        "l2.network.atacth": ["uuid"],
        "l2.network.detach": ["attachedClusterUuids", "uuid"],
        "virtualization.detach.cluster": ["attachedClusterUuids", "uuid"],
        "virtualization.attach.cluster": ["uuid", "systemTags"],
        "set.share.type": ["uuid", "type"],
        delete: ["uuid", "name"],
        "virtualization.delete": [
          "uuid",
          "name",
          "isDefault",
          "attachedHostRefs",
        ],
        "cancel.share": ["uuid", "name", "shareType"],
      },
    }),
    [],
  );
};

export default useGraphqlConfig;
