import { ipToInt } from "@zstack/zsphere-utils";

export const getInitialValues = (source: any) => {
  const { selectedZone } = source;
  return {
    name: "",
    description: "",
    backupNetwork: "",
    backupStorage: [],
    host: [],
    hostname: "",
    username: "root",
    sshPort: "22",
    password: "",
    url: "",
    zoneUuid: selectedZone?.uuid || "",
    scanBackupData: false,
    backupWay: "FreeDisk",
  };
};

export const validateCidr = (cidr: string) => {
  const [ip, prefix] = cidr.split("/");
  return (ipToInt(ip) & (2 ** (32 - Number(prefix)) - 1)) === 0;
};
