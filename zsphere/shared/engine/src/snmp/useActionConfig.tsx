import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit.config' | 'download.mib.file' | 'disable'

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
        key: 'edit.config',
        name: intl.formatMessage({ id: 'edit.config', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'edit.config',
          resource: 'snmp',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'download.mib.file',
        name: intl.formatMessage({ id: 'download.mib.file', defaultMessage: 'Download MIB' }),
        auth: {
          authKey: 'download.mib.file',
          resource: 'snmp',
          type: 'action'
        },
        icon: 'download',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disabled', defaultMessage: 'Disabled' }),
        auth: {
          authKey: 'disable',
          resource: 'snmp',
          type: 'action'
        },
        icon: 'stop-circle',
      },
    ],

    viewMap: {
      'virtualization.main/header': {
        extraKeys: ['edit.config', 'download.mib.file', 'disable'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('snmp', intl).then(remoteConfig => {
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
