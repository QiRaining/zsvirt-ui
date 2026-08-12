import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'ospf.add.area' | 'ospf.quit.area' | 'ospf.attach.network' | 'ospf.detach.network'

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
        key: 'ospf.add.area',
        name: intl.formatMessage({ id: 'add.area', defaultMessage: 'Add  Data Center' }),
        auth: {
          authKey: 'ospf.add.area',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'ospf.quit.area',
        name: intl.formatMessage({ id: 'quit.area', defaultMessage: 'Remove from Area' }),
        auth: {
          authKey: 'ospf.quit.area',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'ospf.attach.network',
        name: intl.formatMessage({ id: 'attach.network', defaultMessage: 'Attach Network' }),
        auth: {
          authKey: 'ospf.attach.network',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'ospf.detach.network',
        name: intl.formatMessage({ id: 'detach.network', defaultMessage: 'Detach Network' }),
        auth: {
          authKey: 'ospf.detach.network',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/row': {
        extraKeys: [],
        activeKeys: ['ospf.quit.area', 'ospf.attach.network', 'ospf.detach.network'],
      },
      'main/toolbar': {
        extraKeys: ['ospf.add.area', 'ospf.quit.area'],
        activeKeys: ['ospf.detach.network'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['ospf.quit.area', 'ospf.attach.network', 'ospf.detach.network'],
      },
      'sub/toolbar': {
        extraKeys: ['ospf.add.area', 'ospf.quit.area'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('ospf-tab', intl).then(remoteConfig => {
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
