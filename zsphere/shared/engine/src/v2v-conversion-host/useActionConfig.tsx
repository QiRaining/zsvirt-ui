import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'add.v2vconversionhost' | 'enable' | 'disable' | 'change.cacheLocation' | 'set.network.outbound.band.width' | 'delete'

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
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
      },
      {
        key: 'add.v2vconversionhost',
        name: intl.formatMessage({ id: 'add.v2vConversionHost', defaultMessage: 'Add V2V Conversion Host' }),
        auth: {
          authKey: 'add.v2vconversionhost',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'change.cacheLocation',
        name: intl.formatMessage({ id: 'change.cacheLocation', defaultMessage: 'Change Cache Location' }),
        auth: {
          authKey: 'change.cacheLocation',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
      },
      {
        key: 'set.network.outbound.band.width',
        name: intl.formatMessage({ id: 'set.netWork.bandWidth', defaultMessage: 'Set Network Bandwidth' }),
        auth: {
          authKey: 'set.network.outbound.band.width',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'v2v.conversion.host',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'change.cacheLocation', 'set.network.outbound.band.width', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'change.cacheLocation', 'set.network.outbound.band.width', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.v2vconversionhost', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'change.cacheLocation', 'set.network.outbound.band.width', 'delete'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('v2v-conversion-host', intl).then(remoteConfig => {
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
