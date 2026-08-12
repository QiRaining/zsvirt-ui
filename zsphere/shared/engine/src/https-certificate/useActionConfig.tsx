import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'virtualization.import.certification' | 'virtualization.restore.default' | 'virtualization.import.certification.http'

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
        key: 'virtualization.import.certification',
        name: intl.formatMessage({ id: 'virtualization.import.certification', defaultMessage: 'Import New Certificate' }),
        auth: {
          authKey: 'virtualization.import.certification',
          resource: 'https.certificate',
          type: 'action'
        },
        icon: 'upload',
      },
      {
        key: 'virtualization.restore.default',
        name: intl.formatMessage({ id: 'virtualization.restore.http', defaultMessage: 'Switch to HTTP' }),
        auth: {
          authKey: 'virtualization.restore.default',
          resource: 'https.certificate',
          type: 'action'
        },
        icon: 'swap',
      },
      {
        key: 'virtualization.import.certification.http',
        name: intl.formatMessage({ id: 'virtualization.import.certification.http', defaultMessage: 'Certificate of Import' }),
        auth: {
          authKey: 'virtualization.import.certification.http',
          resource: 'https.certificate',
          type: 'action'
        },
        icon: 'upload',
      },
    ],

    viewMap: {
      'virtualization.main.http/header': {
        extraKeys: ['virtualization.import.certification.http'],
        activeKeys: [],
      },
      'virtualization.main/header': {
        extraKeys: ['virtualization.import.certification', 'virtualization.restore.default'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('https-certificate', intl).then(remoteConfig => {
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
