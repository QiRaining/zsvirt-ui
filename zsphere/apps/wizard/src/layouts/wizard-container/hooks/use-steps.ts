import { getLocaleFromStorage } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

declare const __ZSV_ENGLISH_ONLY__: boolean | undefined;

export interface IStep {
  index: number;
  key: string;
  label: string;
  done: boolean;
  guideTitle: string;
  guideDetail: string;
  icon: string;
  guideImage: string;
  errorMessage: string;
}

const isZsvEnglishOnlyMode = () => {
  return typeof __ZSV_ENGLISH_ONLY__ === "boolean"
    ? __ZSV_ENGLISH_ONLY__
    : false;
};

export const getGuideImage = (key: string) => {
  const lang = isZsvEnglishOnlyMode()
    ? "en-US"
    : getLocaleFromStorage() || "zh-CN";

  const enUSImageMap: { [key: string]: string } = {
    createRootNode: require("../../../assets/en-us-root-node.svg"),
    createCluster: require("../../../assets/en-us-cluster.svg"),
    addHost: require("../../../assets/en-us-host.svg"),
    createPrimaryStorage: require("../../../assets/en-us-primary-storage.svg"),
    createBackupStorage: require("../../../assets/en-us-backup-storage.svg"),
    createImage: require("../../../assets/en-us-image.svg"),
    createL2Network: require("../../../assets/en-us-l2-network.svg"),
  };

  const zhCNImageMap: { [key: string]: string } = {
    createRootNode: require("../../../assets/root-node.svg"),
    createCluster: require("../../../assets/cluster.svg"),
    addHost: require("../../../assets/host.svg"),
    createPrimaryStorage: require("../../../assets/primary-storage.svg"),
    createBackupStorage: require("../../../assets/backup-storage.svg"),
    createImage: require("../../../assets/image.svg"),
    createL2Network: require("../../../assets/l2-network.svg"),
  };

  return lang === "en-US" ? enUSImageMap[key] : zhCNImageMap[key];
};

export const useSteps = () => {
  const intl = useIntl();

  const steps: IStep[] = [
    {
      index: 0,
      key: "createRootNode",
      label: intl.formatMessage({
        id: "wizard.create.root.node",
        defaultMessage: "New Data Center\n",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.root.node.guide.title",
        defaultMessage: "What is Data Center?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.root.node.guide.detail",
        defaultMessage: "A data center is the largest resource namespace within the platform, including resources such as clusters, hosts, data storage, distributed switches, and distributed port groups.",
      }),
      icon: "building",
      guideImage: getGuideImage("createRootNode"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.root.node.error.title",
        defaultMessage: "Failed to Create Data Center",
      }),
    },
    {
      index: 1,
      key: "createCluster",
      label: intl.formatMessage({
        id: "wizard.create.cluster",
        defaultMessage: "New Cluster",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.cluster.guide.title",
        defaultMessage: "What is Cluster?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.cluster.guide.detail",
        defaultMessage: "A logical collection of a group of hosts (compute nodes).",
      }),
      icon: "server-1",
      guideImage: getGuideImage("createCluster"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.cluster.error.title",
        defaultMessage: "Failed to Create Cluster",
      }),
    },
    {
      index: 2,
      key: "addHost",
      label: intl.formatMessage({
        id: "wizard.create.host",
        defaultMessage: "Add Host",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.host.guide.title",
        defaultMessage: "What is Host?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.host.guide.detail",
        defaultMessage: "A host is an x86 or ARM physical server running a KVM virtualization hypervisor, providing resources such as computing, networking, and storage to virtual machines.",
      }),
      icon: "hard-drive",
      guideImage: getGuideImage("addHost"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.host.error.title",
        defaultMessage: "Failed to Add Host",
      }),
    },
    {
      index: 3,
      key: "createPrimaryStorage",
      label: intl.formatMessage({
        id: "wizard.create.primary.storage",
        defaultMessage: "Add Data Storage",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.primary.storage.guide.title",
        defaultMessage: "What is Data Storage?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.primary.storage.guide.detail",
        defaultMessage: "A data storage is a virtualized resource that provides storage space for virtual machines and their application data. A data storage can be categorized into local storage and network shared storage.",
      }),
      icon: "storage-2",
      guideImage: getGuideImage("createPrimaryStorage"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.primary.storage.error.title",
        defaultMessage: "Fail to Add Data Storage",
      }),
    },
    {
      index: 4,
      key: "createBackupStorage",
      label: intl.formatMessage({
        id: "wizard.create.backup.storage",
        defaultMessage: "Add Image Storage",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.backup.storage.guide.title",
        defaultMessage: "What is Image Storage?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.backup.storage.guide.detail",
        defaultMessage: "An image storage is a virtualized resource that provides storage space for image template files used by virtual machines or disks. An image storage can be categorized into standalone image storage and distributed image storage.",
      }),
      icon: "server",
      guideImage: getGuideImage("createBackupStorage"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.backup.storage.error.title",
        defaultMessage: "Failed to Add Image Storage",
      }),
    },
    {
      index: 5,
      key: "createImage",
      label: intl.formatMessage({
        id: "wizard.create.image",
        defaultMessage: "Add Image",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.image.guide.title",
        defaultMessage: "What is Image?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.image.guide.detail",
        defaultMessage: "An image is a template file used by virtual machines or disks. Images are categorized into system images and disk images.",
      }),
      icon: "cd",
      guideImage: getGuideImage("createImage"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.image.error.title",
        defaultMessage: "Failed to Add Image",
      }),
    },
    {
      index: 6,
      key: "createL2Network",
      label: intl.formatMessage({
        id: "wizard.create.l2.network",
        defaultMessage: "New Distributed Port Group",
      }),
      done: false,
      guideTitle: intl.formatMessage({
        id: "wizard.create.l2.network.guide.title",
        defaultMessage: "What is Distributed Port Group?",
      }),
      guideDetail: intl.formatMessage({
        id: "wizard.create.l2.network.guide.detail",
        defaultMessage:
          "A distributed switch is a virtual switch device that provides unified virtual network management and monitoring for virtual machines within a cluster. A distributed port group is a logical group of ports on a disrtibuted switch, used for configuring port settings.",
      }),
      icon: "dportgroup",
      guideImage: getGuideImage("createL2Network"),
      errorMessage: intl.formatMessage({
        id: "wizard.create.l3.error.title",
        defaultMessage: "Failed to Create Distributed Port Group",
      }),
    },
  ];
  return steps;
};
