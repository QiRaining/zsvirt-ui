import { useMemo, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { ICandidate } from '../../utils'
import { useTagConfig, IQueryProps, useFuzzyConfig, useRemoteConfig, mergeCandidates, concatCandidates } from '../../utils'

type IKey = 'name' | 'uuid' | 'defaultIpv4' | 'defaultIpv6' | 'defaultMac' | 'eip' | 'hostIp' | 'host' | 'tag' | 'group' | 'owner'

export type ICustomCandidates = Array<Partial<Omit<ICandidate, 'key'>> & { key: IKey }>

const useQueryConfig = (
  customCandidates: ICustomCandidates = [],
  queryProps?: IQueryProps
): ICandidate[] => {
  const intl = useIntl()
  const tagConfig = useTagConfig(queryProps)
  const fuzzyConfig = useFuzzyConfig(queryProps)
  const remoteConfig = useRemoteConfig('vm')
  const needFuzzyQuery = queryProps?.needFuzzyQuery
  const filteredKeys = queryProps?.filteredKeys
  const excludeKeys = queryProps?.excludeKeys

  const originCandidates = useMemo(() => {
    const list: ICandidate[] = [
      {
        label: intl.formatMessage({ id: 'name', defaultMessage: 'Name' }),
        key: 'name',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'uuid', defaultMessage: 'UUID' }),
        key: 'uuid',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'defaultIPv4.address', defaultMessage: 'Default IPv4' }),
        key: 'defaultIpv4',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'defaultIPv6.address', defaultMessage: 'Default IPv6' }),
        key: 'defaultIpv6',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'defaultMac', defaultMessage: 'Default MAC Address' }),
        key: 'defaultMac',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'eip', defaultMessage: 'EIP' }),
        key: 'eip',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'hostIp', defaultMessage: 'Host IP' }),
        key: 'hostIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'host', defaultMessage: 'Host' }),
        key: 'host',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'tag', defaultMessage: 'Tag' }),
        key: 'tag',
        type: 'multipleSelect'
      },
      {
        label: intl.formatMessage({ id: 'group.path', defaultMessage: 'VM Group' }),
        key: 'group',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
        key: 'owner',
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
