// 删除
const verifyDelete = (selectedList: any[]): boolean => {
  return selectedList?.length > 0;
};

const verifyMulti = async (selectedList: any[]) => {
  return selectedList.length >= 1;
};

export { verifyDelete, verifyMulti };
