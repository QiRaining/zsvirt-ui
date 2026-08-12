import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.scheduler.job' | 'edit' | 'enable' | 'disable' | 'attach.scheduler' | 'detach.scheduler' | 'attach.scheduled.job' | 'detach.scheduled.job' | 'delete'

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
        key: 'create.scheduler.job',
        name: intl.formatMessage({ id: 'create.scheduledJob', defaultMessage: 'Create Scheduled Task' }),
        auth: {
          authKey: 'create.scheduler.job',
          resource: 'scheduled.job',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'scheduled.job',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'scheduled.job',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'scheduled.job',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'attach.scheduler',
        name: intl.formatMessage({ id: 'attach.scheduler', defaultMessage: 'Attach Scheduler' }),
        auth: {
          authKey: 'attach.scheduler',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
      {
        key: 'detach.scheduler',
        name: intl.formatMessage({ id: 'detach.scheduler', defaultMessage: 'Detach Scheduler' }),
        auth: {
          authKey: 'detach.scheduler',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
      {
        key: 'attach.scheduled.job',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.scheduled.job',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
      {
        key: 'detach.scheduled.job',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.scheduled.job',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'scheduled.job',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'attach.scheduler', 'detach.scheduler', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'attach.scheduler', 'detach.scheduler', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.scheduler.job', 'enable', 'disable'],
        activeKeys: ['attach.scheduler', 'detach.scheduler', 'delete'],
      },
      'sub.scheduler.completed/toolbar': {
        extraKeys: [],
        activeKeys: ['detach.scheduled.job', 'delete'],
      },
      'sub.scheduler.running/toolbar': {
        extraKeys: ['create.scheduler.job'],
        activeKeys: ['enable', 'disable', 'attach.scheduled.job', 'detach.scheduled.job', 'delete'],
      },
      'sub.scheduler/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'detach.scheduler', 'attach.scheduled.job', 'detach.scheduled.job', 'delete'],
      },
      'sub.volume/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub.volume/toolbar': {
        extraKeys: ['create.scheduler.job'],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: ['create.scheduler.job'],
        activeKeys: ['enable', 'disable', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('scheduled-job', intl).then(remoteConfig => {
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
