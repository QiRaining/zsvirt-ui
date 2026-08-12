export type IResourceType =
  | "vm"
  | "directory"
  | "image"
  | "vm-template"
  | "l2-network"
  | "l3-network";

export type IResource = {
  uuid: string;
  name: string;
};
