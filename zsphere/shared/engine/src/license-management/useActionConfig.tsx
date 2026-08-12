import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'sync.license' | 'upload.license'

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
        key: 'sync.license',
        name: intl.formatMessage({ id: 'sync.license', defaultMessage: 'Synchronize' }),
        auth: {
          authKey: 'sync.license',
          resource: 'license.management',
          type: 'action'
        },
        icon: 'refresh',
      },
      {
        key: 'upload.license',
        name: intl.formatMessage({ id: 'upload.license', defaultMessage: 'Upload License' }),
        auth: {
          authKey: 'upload.license',
          resource: 'license.management',
          type: 'action'
        },
        icon: 'cloud-upload',
      },
    ],

    viewMap: {
      'virtualization.main/header': {
        extraKeys: ['sync.license', 'upload.license'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('license-management', intl).then(remoteConfig => {
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
