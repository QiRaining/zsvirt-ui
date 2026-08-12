import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'route.table.create' | 'edit' | 'route.table.route.entry.add' | 'route.table.attach.vpc.vrouter' | 'route.table.detach.vpc.vrouter' | 'delete'

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
        key: 'route.table.create',
        name: intl.formatMessage({ id: 'create.routeTable', defaultMessage: 'Create Route Table' }),
        auth: {
          authKey: 'route.table.create',
          resource: 'route.table',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'route.table',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'route.table.route.entry.add',
        name: intl.formatMessage({ id: 'add.routeTable.routeEntry', defaultMessage: 'Add Route Entry' }),
        auth: {
          authKey: 'route.table.route.entry.add',
          resource: 'route.table',
          type: 'action'
        },
      },
      {
        key: 'route.table.attach.vpc.vrouter',
        name: intl.formatMessage({ id: 'attach.vpcVrouter', defaultMessage: 'Attach VPC vRouter' }),
        auth: {
          authKey: 'route.table.attach.vpc.vrouter',
          resource: 'route.table',
          type: 'action'
        },
      },
      {
        key: 'route.table.detach.vpc.vrouter',
        name: intl.formatMessage({ id: 'detach.vpcVrouter', defaultMessage: 'Detach VPC vRouter' }),
        auth: {
          authKey: 'route.table.detach.vpc.vrouter',
          resource: 'route.table',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'route.table',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'route.table.route.entry.add', 'route.table.attach.vpc.vrouter', 'route.table.detach.vpc.vrouter', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'route.table.route.entry.add', 'route.table.attach.vpc.vrouter', 'route.table.detach.vpc.vrouter', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['route.table.create'],
        activeKeys: ['delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('route-table', intl).then(remoteConfig => {
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
