export const useInitialValues = (hostList: any) => {
  return {
    hostAddMode: hostList?.length > 0 ? "auto" : "manual",
    sshPort: 22,
    username: "root",
    name: "Host-1",
  };
};
