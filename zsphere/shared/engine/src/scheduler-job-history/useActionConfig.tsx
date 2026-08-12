import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'backup.job.history.detail' | 'database.backup.history.detail' | 'scheduled.job.history.detail' | 'history.detail'

export type IOption<T extends Item, K extends Item = Item> = Array<
  Omit<IMenuItem<T, K>, 'key'> & { key: IKey }
>

function useActionConfig<T extends Item, K extends Item = Item>(
  options: IOption<T, K> = []
): Required<ITableListProps<T, K>>['actionConfig'] {
  const intl = useIntl()

  const _actionConfig: Required<ITableListProps<T, K>>['actionConfig'] = useMemo(() => ({
    list: [
      {
        key: 'backup.job.history.detail',
        name: intl.formatMessage({ id: 'view.backup.detail', defaultMessage: 'View Details' }),
        auth: {
          authKey: 'backup.job.history.detail',
          resource: 'scheduler.job.history',
          type: 'action'
        },
      },
      {
        key: 'database.backup.history.detail',
        name: intl.formatMessage({ id: 'detail', defaultMessage: 'Details' }),
        auth: {
          authKey: 'database.backup.history.detail',
          resource: 'database.backup',
          type: 'action'
        },
      },
      {
        key: 'scheduled.job.history.detail',
        name: intl.formatMessage({ id: 'detail', defaultMessage: 'Details' }),
        auth: {
          authKey: 'scheduled.job.history.detail',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
      {
        key: 'history.detail',
        name: intl.formatMessage({ id: 'view.detail', defaultMessage: 'View Details' }),
        auth: {
          authKey: 'history.detail',
          resource: 'scheduler.job.history',
          type: 'action'
        },
        icon: 'file-text',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: ['history.detail'],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.database/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.database/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.overview/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.overview/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.scheduled.job/row': {
        extraKeys: ['scheduled.job.history.detail'],
        activeKeys: [],
      },
      'sub.scheduled.job/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.scheduler.job.group/row': {
        extraKeys: ['backup.job.history.detail'],
        activeKeys: [],
      },
      'sub.scheduler.job.group/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.snapshot-strategy/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.virtualization.snapshot-strategy/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('scheduler-job-history', intl).then(remoteConfig => {
        console.log(`[RemoteActionConfig]: `, remoteConfig)
        setActionConfig(remoteConfig)
      })
    } else {
      setActionConfig(_actionConfig)
    }
  }, [intl, _actionConfig])

  return useMemo(
    () => ({ ...actionConfig, list: handleActionList(options, actionConfig.list) }),
    [actionConfig, options]
  )
}

export default useActionConfig
