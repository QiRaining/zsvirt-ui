import type {
  HostVO as IHostVO,
  L3Network as IL3Network,
} from "@zstack/zsphere-types/graphql";

export type ISelectedResource = Partial<
  IHostVO & IL3Network & { __typename: string }
>;

export type ISelectedList = Array<ISelectedResource>;

export type ISource = Partial<IHostVO & { __typename: string }>;

export type IResourceType = "host" | "l3network";

export interface IResource extends ISelectedResource {
  uuid?: string;
  name?: string;
}

export const useResource = (selectedList: ISelectedList, source?: ISource) => {
  const current = selectedList?.[0] ?? source ?? {};

  let _host: IResource = {};
  let _l3Network: IResource = {};
  let _resourceType: IResourceType = "host";

  switch (current.__typename) {
    case "HostVO":
      _host = {
        uuid: current.uuid,
        name: current.name,
      };
      _resourceType = "host";
      break;
    case "L3Network":
      _l3Network = {
        uuid: current.uuid,
        name: current.name,
        enableIPAM: current.enableIPAM,
        ipRanges: current.ipRanges,
        mtu: current.mtu,
        l2NetworkUuid: current.l2NetworkUuid,
      };
      _resourceType = "l3network";
      break;
  }
  return {
    host: _host,
    l3Network: _l3Network,
    resourceType: _resourceType,
  };
};
