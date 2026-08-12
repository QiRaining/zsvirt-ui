interface IItem {
  count: number;
  data: any;
}

const removeMinCountItem = (items: IItem[]) => {
  if (items.length === 0) {
    return items;
  }

  let minCount = items[0].count;
  let minIndex = 0;

  for (let i = 1; i < items.length - 1; i++) {
    if (items[i].count < minCount) {
      minCount = items[i].count;
      minIndex = i;
    }
  }

  return items.filter((_, index) => index !== minIndex);
};

export const processCache = (
  uuid: string,
  cachedInstances: any[],
  setCachedInstances: (v: any) => void,
  newData: any,
) => {
  let cachedInstance;
  const cachedInstanceIndex = cachedInstances.findIndex(
    (item) => item?.data?.uuid === uuid,
  );
  if (newData) {
    if (cachedInstanceIndex > -1) {
      const tempCachedInstances = [...cachedInstances];
      tempCachedInstances[cachedInstanceIndex] = {
        data: newData,
        count: tempCachedInstances[cachedInstanceIndex].count + 1,
      };
      setCachedInstances(tempCachedInstances);
    } else {
      setCachedInstances([...cachedInstances, { data: newData, count: 0 }]);
    }
  }
  if (cachedInstanceIndex > -1) {
    cachedInstance = cachedInstances[cachedInstanceIndex].data;
  }

  const MAX_CACHE_LENGTH = 50;

  if (cachedInstances.length > MAX_CACHE_LENGTH) {
    // use LRU to clean the cache
    setCachedInstances(removeMinCountItem(cachedInstances));
  }
  return cachedInstance;
};
