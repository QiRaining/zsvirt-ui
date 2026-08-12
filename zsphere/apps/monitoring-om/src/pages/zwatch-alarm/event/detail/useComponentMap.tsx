// import { useIntl } from "react-intl";
// import { Op } from "@zstack/zsphere-types"
// import { AlarmLabels as IAlarmLabels } from "@zstack/zsphere-types/graphql"
// import VmList from "zsv_resource/src/pages/vm/list"
// import BackupStorageList from "zsv_resource/src/pages/backup-storage/list"
// import HostList from "zsv_resource/src/pages/host/list"
// import L3NetworkList from "zsv_resource/src/pages/l3-network/list"
// import PrimaryStorageList from "zsv_resource/src/pages/primary-storage/list"
// import CephPrimaryStoragePoolList from "zsv_resource/src/pages/ceph-primary-storage-pool/list"
// import React from 'react'
// import style from './style.module.less'

// export interface ComponentMap {
//   [prop: string]: {
//     getComponent: (current: any, uuids?: string[]) => React.ReactElement
//   }
// }

// const useComponentMap = () => {
//   const intl = useIntl()

//   const componentMap: ComponentMap = {
//     'ZStack/VM': {
//       getComponent: (current, uuids: string[] = []) => {
//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'vm', defaultMessage: '云主机' })}
//             </h2>
//             <VmList
//               view="sub.alarm"
//               source={current}
//               defaultQuery={{
//                 conditions: [{ key: 'uuid', op: Op.in, values: uuids }]
//               }}
//             />
//           </>
//         )
//       }
//     },
//     'ZStack/CdpTask': {
//       getComponent: current => {
//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'vm', defaultMessage: '云主机' })}
//             </h2>
//             <VmList
//               view="sub.alarm.cdp-task"
//               rowSelection={false}
//               toolbar={['refresh', 'search']}
//               source={current}
//               defaultQuery={{
//                 conditions: [
//                   { key: '__HasCdpTask__', op: Op.eq, value: 'true' },
//                   { key: 'state', op: Op.ne, value: 'Destroyed' }
//                 ]
//               }}
//             />
//           </>
//         )
//       }
//     },
//     'ZStack/BackupStorage': {
//       getComponent: (current, uuids: string[] = []) => {
//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'backupStorage', defaultMessage: '镜像服务器' })}
//             </h2>
//             <BackupStorageList
//               view="sub.alarm"
//               source={current}
//               defaultQuery={{
//                 conditions: [{ key: 'uuid', op: Op.in, values: uuids }]
//               }}
//             />
//           </>
//         )
//       }
//     },
//     'ZStack/Host': {
//       getComponent: (current, uuids: string[] = []) => {
//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'host', defaultMessage: '物理机' })}
//             </h2>
//             <HostList
//               view="sub.alarm"
//               source={current}
//               defaultQuery={{
//                 conditions: [{ key: 'uuid', op: Op.in, values: uuids }]
//               }}
//             />
//           </>
//         )
//       }
//     },
//     'ZStack/L3Network': {
//       getComponent: (current, uuids: string[] = []) => {
//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'l3Network', defaultMessage: '三层网络' })}
//             </h2>
//             <L3NetworkList
//               view="sub.alarm"
//               source={current}
//               defaultQuery={{
//                 conditions: [{ key: 'uuid', op: Op.in, values: uuids }]
//               }}
//             />
//           </>
//         )
//       }
//     },

//     'ZStack/PrimaryStorage': {
//       getComponent: (current, uuids: string[] = []) => {
//         if (
//           [
//             'PoolAvailableCapacityInPercent',
//             'PoolUsedCapacityInPercent',
//             'PoolVirtualAvailableCapacityInPercent'
//           ].includes(current.metricName)
//         ) {
//           const labels = (current.labels ?? []).filter((it: IAlarmLabels) => it.key === 'PoolUuid')

//           const _uuids = labels?.[0]?.value?.split('|') ?? []

//           return (
//             <>
//               <h2 className={style.h2}>
//                 {intl.formatMessage({ id: 'ceph.pool', defaultMessage: 'Ceph存储池' })}
//               </h2>
//               <CephPrimaryStoragePoolList
//                 view="sub.alarm"
//                 source={{
//                   ...current,
//                   labels
//                 }}
//                 defaultQuery={{
//                   conditions: [{ key: 'uuid', op: Op.in, values: _uuids }]
//                 }}
//               />
//             </>
//           )
//         }

//         return (
//           <>
//             <h2 className={style.h2}>
//               {intl.formatMessage({ id: 'primaryStorage', defaultMessage: '主存储' })}
//             </h2>
//             <PrimaryStorageList
//               view="sub.alarm"
//               source={current}
//               defaultQuery={{
//                 conditions: [{ key: 'uuid', op: Op.in, values: uuids }]
//               }}
//             />
//           </>
//         )
//       }
//     }
//   }
//   return { componentMap }
// }

// export default useComponentMap

export {};
