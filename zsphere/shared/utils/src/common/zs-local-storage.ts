import { get, set } from "lodash-es";

function getItemFactory(key: string) {
  return (path: string) => {
    const data = localStorage.getItem("zstack");
    if (data) {
      return get(JSON.parse(data), [key, path], null);
    }
    return null;
  };
}

function setItemFactory(key: string) {
  return (path: string, value: any) => {
    const data = localStorage.getItem("zstack");
    if (data) {
      const obj = JSON.parse(data);
      localStorage.setItem(
        "zstack",
        JSON.stringify(set(obj, [key, path], value)),
      );
    } else {
      localStorage.setItem(
        "zstack",
        JSON.stringify(set({}, [key, path], value)),
      );
    }
  };
}

function removeItemFactory(key: string) {
  return (path: string) => {
    const data = localStorage.getItem("zstack");
    if (data) {
      const obj = JSON.parse(data);
      localStorage.setItem(
        "zstack",
        JSON.stringify(set(obj, [key, path], undefined)),
      );
    }
  };
}

export class ZsLocalStorage {
  public static getCreateItem = getItemFactory("create");

  public static setCreateItem = setItemFactory("create");

  public static removeCreateItem = removeItemFactory("create");

  public static getDetailItem = getItemFactory("detail");

  public static setDetailItem = setItemFactory("detail");

  public static removeDetailItem = removeItemFactory("detail");

  public static clearItem(key: string) {
    localStorage.removeItem(key);
  }
}
