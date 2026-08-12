import { Identity } from '@/identity/model/login.model'

export default {
  priceTable: {
    DEFAULTUUID: '12a087c058cc45d5bf80a605f17c0083'
  },
  role: {
    PROJECTADMINROLEUUID: '55553cefbbfb42468873897c95408a43',
    SECURITYADMINROLEUUID: '58db081b0bbf4e93b63dc4ac90a423ad',
    AUDITADMINROLEUUID: '434a5e418a114714848bb0923acfbb9c',
    SYSTEMADMINROLEUUID: '2069fe8ff0fb49efac0d4db3650a8076',
    PlatformAdminUUID: '0445a3fd50d24009b791ca00e812d396',
    OrganizationOperatorUUID: 'ff46f380a9b745f490f7edbe0f2c72b9',
    IAM2DashboardManagerUUID: '7665d2f3fdf04f74b80b25adf13bf11f',
    ProjectOperatorUUID: 'f2f474c60e7340c0a1d44080d5bde3a9'
  },
  identityMap: {
    ff46f380a9b745f490f7edbe0f2c72b9: Identity.OrganizationOperator,
    '0445a3fd50d24009b791ca00e812d396': Identity.PlatformAdmin,
    '58db081b0bbf4e93b63dc4ac90a423ad': Identity.IAM2SecurityAdmin,
    '2069fe8ff0fb49efac0d4db3650a8076': Identity.IAM2SystemAdmin,
    '434a5e418a114714848bb0923acfbb9c': Identity.IAM2AuditAdmin,
    '55553cefbbfb42468873897c95408a43': Identity.ProjectAdmin,
    f2f474c60e7340c0a1d44080d5bde3a9: Identity.ProjectOperator,
    '7665d2f3fdf04f74b80b25adf13bf11f': Identity.IAM2DashboardManager
  },
  zsvRoleMap: {
    PREDEFINEDOTHERUUID: '80315b1f85314917826b182bf6def552',
    PREDEFINEDLEGACYUUID: '85cfac2138494b2db6501881e1e68045',
    PREDEFINEDSODSYSTEMADMINUUID: '8550125df53c54edb33d1b8ae83ded55',
    PREDEFINEDSODSECURITYADMINUUID: '855013d87cf55944b4a6c6ae729b3f55',
    PREDEFINEDSODAUDITORUUID: '855014f1908759aca90f58ca56290955',
    PREDEFINEDRESOURCEVIEWERUUID: '8550153cd5474c79850566787fe0f055',
    ADMIN_UUID: '36c27e8ff05c4780bf6d2fa65700f22e'
  },
  zsvIdentityMap: {
    '80315b1f85314917826b182bf6def552': Identity.Other,
    '85cfac2138494b2db6501881e1e68045': Identity.VirtualMachineUser,
    '8550125df53c54edb33d1b8ae83ded55': Identity.IAM1SystemAdmin,
    '855013d87cf55944b4a6c6ae729b3f55': Identity.IAM1SecurityAdmin,
    '855014f1908759aca90f58ca56290955': Identity.IAM1AuditAdmin,
    '8550153cd5474c79850566787fe0f055': Identity.IAM1ResourceViewer
  }
}
