import { useMemo, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { ICandidate } from '../../utils'
import { useTagConfig, IQueryProps, useFuzzyConfig, useRemoteConfig, mergeCandidates, concatCandidates } from '../../utils'

type IKey = 'name' | 'uuid' | 'defaultIp' | 'hostIp' | 'vCenter' | 'instanceOffering' | 'eip' | 'owner' | 'group'

export type ICustomCandidates = Array<Partial<Omit<ICandidate, 'key'>> & { key: IKey }>

const useQueryConfig = (
  customCandidates: ICustomCandidates = [],
  queryProps?: IQueryProps
): ICandidate[] => {
  const intl = useIntl()
  const tagConfig = useTagConfig(queryProps)
  const fuzzyConfig = useFuzzyConfig(queryProps)
  const remoteConfig = useRemoteConfig('vcenter-vm')
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
        label: intl.formatMessage({ id: 'default.ip', defaultMessage: 'Default IP' }),
        key: 'defaultIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'host.ip', defaultMessage: 'Host IP' }),
        key: 'hostIp',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'vcenter', defaultMessage: 'vCenter' }),
        key: 'vCenter',
        type: 'multipleSelect'
      },
      {
        label: intl.formatMessage({ id: 'instance.offering', defaultMessage: 'Instance Offering' }),
        key: 'instanceOffering',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'eip', defaultMessage: 'EIP' }),
        key: 'eip',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'owner', defaultMessage: 'Owner' }),
        key: 'owner',
        type: 'input'
      },
      {
        label: intl.formatMessage({ id: 'group.path', defaultMessage: 'VM Group' }),
        key: 'group',
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
