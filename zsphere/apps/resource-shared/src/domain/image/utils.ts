import { gql, useQuery } from "@apollo/client";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import type { Image } from "@zstack/zsphere-types/graphql";
import type { IntlShape } from "react-intl";

const GUEST_NAME_LIST = gql`
  query guestNameList {
    guestNameList {
      name
    }
  }
`;

interface GuestName {
  icon: IllustrationTypes;
  value: string;
}

const useGetGuestNameEnum = () => {
  const { data } = useQuery(GUEST_NAME_LIST, {
    fetchPolicy: "no-cache",
  });
  const guestNameEnum: GuestName[] = [];
  data?.guestNameList?.forEach((it: { name: string }) => {
    if (it?.name) {
      guestNameEnum.push({
        icon: `os.${it.name.toLowerCase()}` as IllustrationTypes,
        value: it.name,
      });
    }
  });
  return guestNameEnum;
};

const getGuestIcon = (
  guestOsType: string | undefined,
  guestNameEnum: GuestName[],
) => {
  let _guestOsType: string | undefined;
  if (guestOsType?.includes("RHEL")) {
    _guestOsType = "RedHat";
  } else if (guestOsType?.includes("Hygon")) {
    _guestOsType = "Linux";
  } else {
    _guestOsType = guestOsType?.split(" ")[0];
  }
  const icon = _guestOsType
    ? guestNameEnum?.find((it) => _guestOsType?.includes(it?.value))?.icon
    : undefined;
  return { icon: icon || "os.other" };
};

enum ExportType {
  ExportAndDownload = "ExportAndDownload",
  ExportOnly = "ExportOnly",
}

const useGetExportTypeMap = (intl: IntlShape) => {
  const exportTypeMap = new Map([
    [
      ExportType.ExportAndDownload,
      intl.formatMessage({
        id: "image.exportType.exportAndDownload",
        defaultMessage: "Export and Download",
      }),
    ],
    [
      ExportType.ExportOnly,
      intl.formatMessage({
        id: "image.exportType.exportOnly",
        defaultMessage: "Export Only",
      }),
    ],
  ]);

  return { exportTypeMap };
};

const downloadImageFile = async (selectedList: Image[], exportUrl?: string) => {
  try {
    const url =
      exportUrl || selectedList?.[0].backupStorageRefs?.[0].exportUrl || "";
    if (!url) {
      throw new Error("Invalid URL");
    }
    const format = selectedList?.[0]?.format || "qcow2";
    const aNode = document.createElement("a");
    try {
      aNode.setAttribute("type", "hidden");
      aNode.href = url;
      aNode.download = `${url}_${format}`;
      document.body.appendChild(aNode);
      aNode.click();
    } finally {
      aNode.remove();
    }
  } catch (error) {
    console.error("Failed to download image:", error);
  }
};

export {
  useGetGuestNameEnum,
  getGuestIcon,
  downloadImageFile,
  ExportType,
  useGetExportTypeMap,
};
