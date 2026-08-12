import { LeftNavType, NavView, VirRscTreeType } from "@zstack/zsphere-types";

export const getTreeKey = (leftNav: LeftNavType, navView: NavView) => {
  let treeKey = VirRscTreeType.ClusterHost;

  if (leftNav === LeftNavType.ClusterHost && navView === NavView.Group) {
    treeKey = VirRscTreeType.Directory;
  }

  if (leftNav === LeftNavType.ClusterHost && navView === NavView.Resource) {
    treeKey = VirRscTreeType.ClusterHost;
  }

  if (leftNav === LeftNavType.TemplateVm && navView === NavView.Template) {
    treeKey = VirRscTreeType.VmTemplate;
  }

  if (leftNav === LeftNavType.TemplateVm && navView === NavView.Resource) {
    treeKey = VirRscTreeType.TemplateVm;
  }

  if (leftNav === LeftNavType.DataStorage) {
    treeKey = VirRscTreeType.DataStorage;
  }
  if (leftNav === LeftNavType.Network) {
    treeKey = VirRscTreeType.Network;
  }
  if (leftNav === LeftNavType.BareMetal) {
    treeKey = VirRscTreeType.BareMetal;
  }
  return treeKey;
};
