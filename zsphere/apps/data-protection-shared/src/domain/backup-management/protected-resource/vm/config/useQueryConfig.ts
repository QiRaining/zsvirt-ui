import { useQueryConfig } from "@zstack/zsphere-engine/src/zsv-backup-data";

export interface IProps {
  view?: string;
  defaultQuery?: any;
}

export default ({ view, defaultQuery }: IProps = {}) => {
  let filteredKeys: Array<string> | undefined;
  if (view?.startsWith("main")) {
    filteredKeys = ["name"];
  } else if (view?.startsWith("sub")) {
    filteredKeys = ["backup.name"];
  }
  return useQueryConfig([], {
    resourceType: "BackupData",
    defaultQuery,
    filteredKeys,
    needFuzzyQuery: true,
  });
};
