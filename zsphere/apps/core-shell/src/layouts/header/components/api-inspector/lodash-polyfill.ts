// 替代 lodash-es 的原生工具函数 (bundle-barrel-imports)

// 替代 cloneDeep
export const cloneDeep = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cloneDeep(item)) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = cloneDeep((obj as Record<string, unknown>)[key]);
    }
  }
  return result as T;
};

// 替代 sortBy
export const sortBy = <T, K extends keyof T>(arr: T[], key: K): T[] => {
  return [...arr].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) {
      return 0;
    }
    if (aVal === undefined || aVal === null) {
      return 1;
    }
    if (bVal === undefined || bVal === null) {
      return -1;
    }
    return aVal < bVal ? -1 : 1;
  });
};

// 替代 flatMap - 对于对象，会将所有值的数组合并
export const flatMap = <T>(obj: Record<string, T[]>): T[] => {
  const values = Object.values(obj);
  return values.reduce<T[]>((acc, arr) => acc.concat(arr), []);
};

// 替代 map
export const map = <T, U>(arr: T[], fn: (item: T) => U): U[] => {
  return arr.map(fn);
};

// 替代 filter
export const filter = <T>(arr: T[], fn: (item: T) => boolean): T[] => {
  return arr.filter(fn);
};

// 替代 uniq
export const uniq = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};
