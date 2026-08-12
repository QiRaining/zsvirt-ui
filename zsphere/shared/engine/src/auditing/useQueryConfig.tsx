import { useMemo, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { ICandidate } from '../../utils'
import { useTagConfig, IQueryProps, useFuzzyConfig, useRemoteConfig, mergeCandidates, concatCandidates } from '../../utils'

type IKey = 'apiName' | 'operatorAccountNameForLogin' | 'resourceUuid' | 'resourceName' | 'resourceType' | 'clientIp' | 'clientBrowser' | 'clientIpForResource'

export type ICustomCandidates = Array<Partial<Omit<ICandidate, 'key'>> & { key: IKey }>

const useQueryConfig = (
  customCandidates: ICustomCandidates = [],
  queryProps?: IQueryProps
): ICandidate[] => {
  const intl = useIntl()
  const tagConfig = useTagConfig(queryProps)
  const fuzzyConfig = useFuzzyConfig(queryProps)
  const remoteConfig = useRemoteConfig('auditing')
  const needFuzzyQuery = queryProps?.needFuzzyQuery
  const filteredKeys = queryProps?.filteredKeys
  const excludeKeys = queryProps?.excludeKeys

  const originCandidates = useMemo(() => {
    const list: ICandidate[] = [
      {
        label: intl.formatMessage({ id: 'apiName', defaultMessage: 'API Name' }),
        key: 'apiName',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'operator', defaultMessage: 'Operator' }),
        key: 'operatorAccountNameForLogin',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'resourceUuid', defaultMessage: 'Resource UUID' }),
        key: 'resourceUuid',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'resourceName', defaultMessage: 'Name' }),
        key: 'resourceName',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'resourceType', defaultMessage: 'Resource Type' }),
        key: 'resourceType',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'loginIP', defaultMessage: 'Login IP' }),
        key: 'clientIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'browser', defaultMessage: 'Browser' }),
        key: 'clientBrowser',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'operator.ip', defaultMessage: 'Operator IP' }),
        key: 'clientIpForResource',
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
