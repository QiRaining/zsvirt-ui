export const verifyChangeOwner = (current: any) => {
  // isAdmin && isPrivilegeAdmin
  return !!current.owner;
};
