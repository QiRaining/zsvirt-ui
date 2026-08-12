import * as _ from "lodash-es";

// 定义存储键的类型
type StorageKey = "create" | "detail";

// 定义存储值的类型
interface StorageData {
  create?: Record<string, unknown>;
  detail?: Record<string, unknown>;
}

class LocalStorageManager {
  private static instance: LocalStorageManager;
  private readonly STORAGE_KEY = "zstack";

  private constructor() {}

  public static getInstance(): LocalStorageManager {
    if (!LocalStorageManager.instance) {
      LocalStorageManager.instance = new LocalStorageManager();
    }
    return LocalStorageManager.instance;
  }

  private getStorage(): StorageData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }

  private setStorage(data: StorageData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  public get<T>(key: StorageKey, path: string): T | null {
    const storage = this.getStorage();
    return _.get(storage, [key, path], null) as T | null;
  }

  public set<T>(key: StorageKey, path: string, value: T): void {
    const storage = this.getStorage();
    this.setStorage(_.set(storage, [key, path], value));
  }

  public remove(key: StorageKey, path: string): void {
    const storage = this.getStorage();
    this.setStorage(_.set(storage, [key, path], undefined));
  }

  public clear(key: string): void {
    localStorage.removeItem(key);
  }
}

function getItemFactory(key: StorageKey) {
  return <T>(path: string): T | null => {
    return LocalStorageManager.getInstance().get<T>(key, path);
  };
}

function setItemFactory(key: StorageKey) {
  return <T>(path: string, value: T): void => {
    LocalStorageManager.getInstance().set<T>(key, path, value);
  };
}

function removeItemFactory(key: StorageKey) {
  return (path: string): void => {
    LocalStorageManager.getInstance().remove(key, path);
  };
}

export class ZsLocalStorage {
  public static getCreateItem = getItemFactory("create");

  public static setCreateItem = setItemFactory("create");

  public static removeCreateItem = removeItemFactory("create");

  public static getDetailItem = getItemFactory("detail");

  public static setDetailItem = setItemFactory("detail");

  public static removeDetailItem = removeItemFactory("detail");

  public static clearItem = LocalStorageManager.getInstance().clear.bind(
    LocalStorageManager.getInstance(),
  );
}
