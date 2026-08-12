import { useMemo, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { ICandidate } from '../../utils'
import { useTagConfig, IQueryProps, useFuzzyConfig, useRemoteConfig, mergeCandidates, concatCandidates } from '../../utils'

type IKey = 'nicName' | 'name' | 'mac' | 'ipv4' | 'ipv6' | 'vmName' | 'ip.address'

export type ICustomCandidates = Array<Partial<Omit<ICandidate, 'key'>> & { key: IKey }>

const useQueryConfig = (
  customCandidates: ICustomCandidates = [],
  queryProps?: IQueryProps
): ICandidate[] => {
  const intl = useIntl()
  const tagConfig = useTagConfig(queryProps)
  const fuzzyConfig = useFuzzyConfig(queryProps)
  const remoteConfig = useRemoteConfig('vm-nic')
  const needFuzzyQuery = queryProps?.needFuzzyQuery
  const filteredKeys = queryProps?.filteredKeys
  const excludeKeys = queryProps?.excludeKeys

  const originCandidates = useMemo(() => {
    const list: ICandidate[] = [
      {
        label: intl.formatMessage({ id: 'nic', defaultMessage: 'NIC' }),
        key: 'nicName',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        key: 'name',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'macAddress', defaultMessage: 'MAC Address' }),
        key: 'mac',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'ipv4Address', defaultMessage: 'IPv4 Address' }),
        key: 'ipv4',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'ipv6Address', defaultMessage: 'IPv6 Address' }),
        key: 'ipv6',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'associated.object', defaultMessage: 'Associated Objects' }),
        key: 'vmName',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'ipAddress', defaultMessage: 'IP Address' }),
        key: 'ip.address',
        type: 'input'
      },
    ]
    if (filteredKeys) {
      return list.filter(item => filteredKeys.includes(item.key))
    }
    return list
  }, [intl, filteredKeys])

  const queryConfig: ICandidate[] = useMemo(() => {
    let newCandidates = mergeCandidates(originCandidates, customCandidates as ICandidate[])
    if (originCandidates.some(item => item.key.includes('tag'))) {
      newCandidates = concatCandidates(newCandidates, tagConfig.candidates)
    }
    if (needFuzzyQuery) {
      newCandidates = concatCandidates([fuzzyConfig.candidate], newCandidates)
    }
    if (remoteConfig.candidates) {
      newCandidates = mergeCandidates(newCandidates, remoteConfig.candidates)
    }
    if (excludeKeys) {
      newCandidates = newCandidates.filter(it => !excludeKeys.includes(it.key))
    }
    return newCandidates
  }, [originCandidates, customCandidates, needFuzzyQuery, tagConfig, fuzzyConfig, remoteConfig])

  useEffect(() => {
    if (needFuzzyQuery) {
      fuzzyConfig.setCandidates(queryConfig)
    }
  }, [needFuzzyQuery, intl])

  return queryConfig
}

export default useQueryConfig
