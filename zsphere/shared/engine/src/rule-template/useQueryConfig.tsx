import { useMemo, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { ICandidate } from '../../utils'
import { useTagConfig, IQueryProps, useFuzzyConfig, useRemoteConfig, mergeCandidates, concatCandidates } from '../../utils'

type IKey = 'name' | 'uuid' | 'sourceIp' | 'destIp' | 'sourcePort' | 'destPort'

export type ICustomCandidates = Array<Partial<Omit<ICandidate, 'key'>> & { key: IKey }>

const useQueryConfig = (
  customCandidates: ICustomCandidates = [],
  queryProps?: IQueryProps
): ICandidate[] => {
  const intl = useIntl()
  const tagConfig = useTagConfig(queryProps)
  const fuzzyConfig = useFuzzyConfig(queryProps)
  const remoteConfig = useRemoteConfig('rule-template')
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
        label: intl.formatMessage({ id: 'sourceIpAddress', defaultMessage: 'Source IP Address' }),
        key: 'sourceIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'destIpAddress', defaultMessage: 'Destination IP Address' }),
        key: 'destIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'sourcePort', defaultMessage: 'Source Port' }),
        key: 'sourcePort',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'destPort', defaultMessage: 'Destination Port' }),
        key: 'destPort',
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
