import { useQueryConfig } from "@zstack/zsphere-engine/src/volume";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import { usePlatformStore } from "@zstack/zsphere-platform-store";

export default ({
  view,
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const { currentUser } = usePlatformStore();

  let filteredKeys: string[] | undefined;

  if (view) {
    if (view === "recycle") {
      filteredKeys = ["name", "uuid", "owner"];
    }
  }

  const queryProps: IQueryProps = {
    defaultQuery,
    resourceType: "Volume",
    needFuzzyQuery: true,
    filteredKeys,
    currentUser,
  };

  const baseQuery = useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
    ],
    queryProps,
  );

  if (
    (view && /^(sub|select)\.(?!virtualization\.)/.test(view)) ||
    view === "sub.virtualization.zone.recyle" ||
    view === "sub.virtualization.primary-storage" ||
    view === "sub.virtualization.account"
  ) {
    return baseQuery?.filter(
      (cv: any) => cv?.key !== "tag" && cv?.type !== "tag",
    );
  }

  return baseQuery;
};
