import { gql, useMutation } from "@apollo/client";
import type {
  CheckIpAvailabilityParam as ICheckIpAvailabilityParam,
  CheckIpAvailabilityResult as ICheckIpAvailabilityResult,
  L3Network,
} from "@zstack/zsphere-types/graphql";
import { isIP, isIPV4, isIPV6IP, isValidStr } from "@zstack/zsphere-utils";
import * as _ from "lodash-es";
import { replace as _replace } from "lodash-es";
import { useIntl } from "react-intl";

const checkIpAvailability = gql`
  mutation checkIpAvailability($input: CheckIpAvailabilityParam!) {
    checkIpAvailability(input: $input) {
      available
    }
  }
`;

export const getZoneUuidBySource = (source: any) => {
  if (source?.__typename === "Zone") {
    return source.uuid ?? "";
  }
  if (source?.__typename === "Cluster") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "HostVO") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "PrimaryStorageVO") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "Image") {
    return source?.backupStorage?.zone?.uuid ?? "";
  }
  if (source?.__typename === "VmInstance") {
    return source?.zoneUuid ?? "";
  }
  if (source?.__typename === "VMGroupDirectory") {
    return source?.zoneUuid ?? "";
  }

  if (["VolumeSnapshotGroup", "VolumeSnapshot"].includes(source?.__typename)) {
    return (
      source?.volume?.vmInstance?.[0]?.zoneUuid ??
      source?.vmInstance?.zoneUuid ??
      ""
    );
  }

  if (source?.__typename === "VmTemplate") {
    return source?.vm?.zoneUuid ?? "";
  }

  if (source?.__typename === "BackupData") {
    return source?.vmInstance?.zoneUuid ?? "";
  }

  return "";
};

export function reject(msg: string = "") {
  return Promise.reject(msg && new Error(msg));
}

export function isIPV6(v: string = ""): boolean {
  if (!isValidStr(v)) {
    return false;
  }

  return isIPV6IP(v);
}

export function isIpInRange({
  startIp,
  endIp,
  ip = "",
}: {
  startIp?: string;
  endIp?: string;
  ip?: string;
}): boolean {
  if (!isValidStr(ip) || !isValidStr(startIp) || !isValidStr(endIp)) {
    return false;
  }

  if (isIPV4(ip)) {
    // for ip v4
    const ipToNumber = (str: string) =>
      str
        .split(".")
        .reduce(
          (to, cur, idx) => to + Number.parseInt(cur, 10) * 256 ** (3 - idx),
          0,
        );

    const curIpNumber = ipToNumber(ip);

    return (
      curIpNumber <= ipToNumber(endIp!) && curIpNumber >= ipToNumber(startIp!)
    );
  }
  if (isIPV6(ip)) {
    const startNum = parseInt(startIp?.replace(/:/g, "") ?? "0", 16);
    const endNum = parseInt(endIp?.replace(/:/g, "") ?? "0", 16);
    const ipNum = parseInt(ip.replace(/:/g, ""), 16);
    return ipNum >= startNum && ipNum <= endNum;
  }
  return true;
}

export const useValidatorIp = () => {
  const intl = useIntl();
  const [remoteValidateIp] = useMutation<
    { checkIpAvailability: ICheckIpAvailabilityResult },
    {
      input: ICheckIpAvailabilityParam;
    }
  >(checkIpAvailability);
  async function validatorIp({
    network: { uuid: l3NetworkUuid, ipRanges },
    arpCheck,
    ipRangeCheck,
    ip,
  }: {
    network: Pick<L3Network, "uuid" | "ipRanges" | "ipVersion">;
    arpCheck?: boolean;
    ipRangeCheck?: boolean;
    ip?: string;
  }) {
    if (!ip) {
      return;
    }
    const isIpv4 = ip.includes(".");

    if (!isIP(ip, isIpv4 ? 4 : 6)) {
      return reject(
        intl.formatMessage({
          id: "vpc.field.requiredIp.validator.format.case.invalidIp",
          defaultMessage: "Invalid IP address.",
        }),
      );
    }

    if (
      ipRanges
        ?.filter(({ ipVersion }) => ipVersion === (isIpv4 ? 4 : 6))
        ?.every(({ startIp, endIp }) => !isIpInRange({ ip, startIp, endIp }))
    ) {
      throw intl.formatMessage({
        id: "vpc.field.requiredIp.validator.ipRange.case.notInIpRange",
        defaultMessage: "Enter an IP address that is in the specified IP range.",
      });
    }

    try {
      const res = await remoteValidateIp({
        variables: { input: { l3NetworkUuid, ip, arpCheck, ipRangeCheck } },
      });

      return res?.data?.checkIpAvailability?.available
        ? Promise.resolve()
        : reject(
            intl.formatMessage({
              id: "vpc.field.requiredIp.validator.used.case.used",
              defaultMessage: "The IP address is already in use.",
            }),
          );
    } catch {
      return reject(
        intl.formatMessage({
          id: "vpc.field.requiredIp.validator.format.case.invalidIp",
          defaultMessage: "Invalid IP address.",
        }),
      );
    }
  }
  return validatorIp;
};
