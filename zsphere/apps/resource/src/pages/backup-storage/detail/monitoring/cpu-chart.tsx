// import React, { FC, useMemo } from 'react'
// import { useIntl } from 'react-intl';
// import _ from 'lodash-es'
// import { BusinessMonitor, IBusinessMonitorProps } from '@zstack/zsphere-components'

// const { MonitorChart, MonitorTitle } = BusinessMonitor

// interface IProps extends IBusinessMonitorProps {
//   monitorKey: string
// }

// const CPUChart: FC<IProps> = ({ monitorKey, labels, ...props }) => {
//   const intl = useIntl()
//   const metricNameMap = new Map([
//     [
//       'CPUUsedUtilization',
//       intl.formatMessage({ id: 'CPUUsedUtilization', defaultMessage: 'CPU使用率' })
//     ],
//     [
//       'CPUAverageUsedUtilization',
//       intl.formatMessage({
//         id: 'CPUAverageUsedUtilization',
//         defaultMessage: 'CPU平均使用率'
//       })
//     ],
//     [
//       'CPUIdleUtilization',
//       intl.formatMessage({ id: 'CPUIdleUtilization', defaultMessage: 'CPU空闲率' })
//     ],
//     [
//       'CPUAverageIdleUtilization',
//       intl.formatMessage({
//         id: 'CPUAverageIdleUtilization',
//         defaultMessage: 'CPU平均空闲率'
//       })
//     ],
//     [
//       'CPUSystemUtilization',
//       intl.formatMessage({
//         id: 'CPUSystemUtilization',
//         defaultMessage: 'CPU系统进程占用率'
//       })
//     ],
//     [
//       'CPUAverageSystemUtilization',
//       intl.formatMessage({
//         id: 'CPUAverageSystemUtilization',
//         defaultMessage: 'CPU系统进程平均进程占用率'
//       })
//     ],
//     [
//       'CPUUserUtilization',
//       intl.formatMessage({
//         id: 'CPUUserUtilization',
//         defaultMessage: 'CPU用户进程占用率'
//       })
//     ],
//     [
//       'CPUAverageUserUtilization',
//       intl.formatMessage({
//         id: 'CPUAverageUserUtilization',
//         defaultMessage: 'CPU用户进程平均占用率'
//       })
//     ],
//     [
//       'CPUWaitUtilization',
//       intl.formatMessage({
//         id: 'CPUWaitUtilization',
//         defaultMessage: 'CPU等待进程占用率'
//       })
//     ],
//     [
//       'CPUAverageWaitUtilization',
//       intl.formatMessage({
//         id: 'CPUAverageWaitUtilization',
//         defaultMessage: 'CPU等待进程平均占用率'
//       })
//     ]
//   ])

//   const title = metricNameMap.get(monitorKey)!

//   const { realLabels, metricNames, metricNamesWithoutLabel } = useMemo(() => {
//     const labelObj = _.reduce(
//       labels,
//       (prev, cur) => {
//         if (cur === 'Average') {
//           prev.hasAverageLabel = true
//         } else {
//           prev.hasRealLabel = true
//           prev.realLabels = [...prev.realLabels, cur]
//         }
//         return prev
//       },
//       {
//         realLabels: [] as string[],
//         hasRealLabel: false,
//         hasAverageLabel: false
//       }
//     )
//     let _metricNames: string[] = []
//     let _metricNamesWithoutLabel: string[] = []
//     if (labelObj.hasRealLabel) {
//       _metricNames = [monitorKey]
//     }
//     if (labelObj.hasAverageLabel) {
//       const averageKey = monitorKey.replace(/(CPU)(.*)/, '$1Average$2')
//       _metricNamesWithoutLabel = [averageKey]
//     }
//     return {
//       realLabels: labelObj.realLabels,
//       metricNames: _metricNames,
//       metricNamesWithoutLabel: _metricNamesWithoutLabel
//     }
//   }, [labels, monitorKey])

//   return (
//     <MonitorChart
//       title={<MonitorTitle title={title} />}
//       valueType="percentage"
//       labels={realLabels}
//       metricNameMap={metricNameMap}
//       metricNames={metricNames}
//       metricNamesWithoutLabel={metricNamesWithoutLabel}
//       {...props}
//     />
//   )
// }

// export default CPUChart
export {};
