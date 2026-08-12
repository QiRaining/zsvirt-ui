export const formatter = (pathname = "") => {
  let tempList = pathname?.split("/")?.filter(Boolean);
  const third = tempList?.[2];
  const filterList = ["create", "add", "detail"];
  if (third && filterList.includes(third)) {
    tempList = tempList.slice(0, 2);
  } else {
    tempList = tempList.slice(0, 3);
  }
  if (tempList?.[0] === "virtualization-resource") {
    const leftnav = window.location?.search?.split("leftnav=")?.[1];
    if (leftnav) {
      return `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftnav}`;
    }
  }
  return `/${tempList?.join("/")}`;
};
