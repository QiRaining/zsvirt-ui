import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'add.preconfigurationTemplate' | 'start' | 'stop' | 'donwload' | 'delete'

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
        name: intl.formatMessage({ id: 'edit.name.and.desc', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit',
          resource: 'pre.config.template',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.preconfigurationTemplate',
        name: intl.formatMessage({ id: 'add.preConfigurationTemplate', defaultMessage: 'Add Bare Metal Template' }),
        auth: {
          authKey: 'add.preconfigurationTemplate',
          resource: 'pre.config.template',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'start',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'start',
          resource: 'pre.config.template',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'stop',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'stop',
          resource: 'pre.config.template',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'donwload',
        name: intl.formatMessage({ id: 'download', defaultMessage: 'Download' }),
        auth: {
          authKey: 'donwload',
          resource: 'pre.config.template',
          type: 'action'
        },
      },
      {
        key: 'donwload-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'pre.config.template',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: ['edit'],
        activeKeys: ['donwload', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'donwload', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['add.preconfigurationTemplate', 'delete'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('pre-config-template', intl).then(remoteConfig => {
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
