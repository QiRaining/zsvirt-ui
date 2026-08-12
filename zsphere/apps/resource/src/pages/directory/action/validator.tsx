const canCreateSubGroup = (current: any) => {
  const { groupName } = current;
  const level = groupName.split("/").length;
  return level < 3;
};

const isNotDefaultDir = (current: any) => {
  return current.uuid.split("-2").length === 1;
};

export { canCreateSubGroup, isNotDefaultDir };
