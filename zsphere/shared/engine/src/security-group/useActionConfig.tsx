import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.security.group' | 'edit' | 'enable' | 'disable' | 'virtualization.edit.nameandDescription' | 'import.secrurityGroup.rules' | 'export.secrurityGroup.rules' | 'delete'

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
        key: 'create.security.group',
        name: intl.formatMessage({ id: 'create.securityGroup', defaultMessage: 'Create Security Group' }),
        auth: {
          authKey: 'create.security.group',
          resource: 'security.group',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'security.group',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'security.group',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'disable-divider',
        divider: true,
      },
      {
        key: 'virtualization.edit.nameandDescription',
        name: intl.formatMessage({ id: 'edit.nameandDescription', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'virtualization.edit.nameandDescription',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'virtualization.edit.nameandDescription-divider',
        divider: true,
      },
      {
        key: 'import.secrurityGroup.rules',
        name: intl.formatMessage({ id: 'import.secrurityGroup.rules', defaultMessage: 'Import Rule' }),
        auth: {
          authKey: 'import.secrurityGroup.rules',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'export.secrurityGroup.rules',
        name: intl.formatMessage({ id: 'export.secrurityGroup.rules', defaultMessage: 'Export Rule' }),
        auth: {
          authKey: 'export.secrurityGroup.rules',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'export.secrurityGroup.rules-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'security.group',
          type: 'action'
        },
        icon: 'trash',
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'import.secrurityGroup.rules', 'export.secrurityGroup.rules', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.security.group'],
        activeKeys: [],
      },
      'sub.iam2Project/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'delete'],
      },
      'sub.iam2Project/toolbar': {
        extraKeys: ['enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub.virtualization.zone/header': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'virtualization.edit.nameandDescription', 'import.secrurityGroup.rules', 'export.secrurityGroup.rules', 'delete'],
      },
      'sub.virtualization.zone/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'virtualization.edit.nameandDescription', 'delete'],
      },
      'sub.virtualization.zone/toolbar': {
        extraKeys: ['create.security.group', 'enable', 'disable', 'delete'],
        activeKeys: [],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'delete'],
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
      genActionFromRemote('security-group', intl).then(remoteConfig => {
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
