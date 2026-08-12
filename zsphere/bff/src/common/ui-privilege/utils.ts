import Constant from '@/common/const'

/**
 * 判断是否为三权分立（SOD）角色：系统管理员、安全管理员、审计管理员
 * 注意：只读角色（ResourceViewer）不属于 SOD 角色
 */
const isSodRole = (roleUuid: string): boolean => {
  return [
    Constant.zsvRoleMap.PREDEFINEDSODSYSTEMADMINUUID,
    Constant.zsvRoleMap.PREDEFINEDSODAUDITORUUID,
    Constant.zsvRoleMap.PREDEFINEDSODSECURITYADMINUUID
  ].includes(roleUuid)
}

/**
 * 判断是否为只读角色（ResourceViewer）
 */
const isResourceViewerRole = (roleUuid: string): boolean => {
  return roleUuid === Constant.zsvRoleMap.PREDEFINEDRESOURCEVIEWERUUID
}

/**
 * 判断是否为 SOD 角色或只读角色（用于权限匹配场景）
 */
const isSodOrResourceViewerRole = (roleUuid: string): boolean => {
  return isSodRole(roleUuid) || isResourceViewerRole(roleUuid)
}

const isVirtualMachineUserRole = (uuid: string): boolean => {
  return [Constant.zsvRoleMap.PREDEFINEDLEGACYUUID].includes(uuid)
}

export { isSodRole, isResourceViewerRole, isSodOrResourceViewerRole, isVirtualMachineUserRole }
