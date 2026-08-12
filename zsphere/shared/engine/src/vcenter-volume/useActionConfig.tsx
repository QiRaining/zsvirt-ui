import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit' | 'create.volume' | 'create.volume.from.vm' | 'enable' | 'disable' | 'vm.attach.volume' | 'vm.detach.volume' | 'volume.attach.to.vm' | 'volume.detach.from.vm' | 'change.owner' | 'delete.volume.from.vm' | 'delete' | 'recover' | 'expunge' | 'detach.resource'

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
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'create.volume',
        name: intl.formatMessage({ id: 'create.volume', defaultMessage: 'Create Volume' }),
        auth: {
          authKey: 'create.volume',
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'create.volume.from.vm',
        name: intl.formatMessage({ id: 'create.volume', defaultMessage: 'Create Volume' }),
        auth: {
          authKey: 'create.volume.from.vm',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'vm.attach.volume',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'vm.attach.volume',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'vm.detach.volume',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'vm.detach.volume',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'vm.detach.volume-divider',
        divider: true,
      },
      {
        key: 'volume.attach.to.vm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'volume.attach.to.vm',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'volume.detach.from.vm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'volume.detach.from.vm',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'change.owner',
        name: intl.formatMessage({ id: 'change.owner', defaultMessage: 'Change Owner' }),
        auth: {
          authKey: 'change.owner',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'change.owner-divider',
        divider: true,
      },
      {
        key: 'delete.volume.from.vm',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.volume.from.vm',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
      {
        key: 'recover',
        name: intl.formatMessage({ id: 'recover', defaultMessage: 'Recover' }),
        auth: {
          authKey: 'recover',
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'undo',
      },
      {
        key: 'expunge',
        name: intl.formatMessage({ id: 'expunge', defaultMessage: 'Expunge' }),
        auth: {
          authKey: 'expunge',
          resource: 'vcenter.volume',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'detach.resource',
        name: intl.formatMessage({ id: 'detach.resource', defaultMessage: 'Detach Resource' }),
        auth: {
          authKey: 'detach.resource',
          resource: 'vcenter.volume',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.notinstantiated/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['vm.attach.volume', 'delete'],
      },
      'main.notinstantiated/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'vm.attach.volume', 'delete'],
      },
      'main.notinstantiated/toolbar': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['delete'],
      },
      'main/header': {
        extraKeys: ['enable', 'disable'],
        activeKeys: ['edit', 'vm.attach.volume', 'vm.detach.volume', 'change.owner', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'enable', 'disable', 'vm.attach.volume', 'vm.detach.volume', 'change.owner', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.volume', 'enable', 'disable'],
        activeKeys: ['change.owner', 'delete'],
      },
      'recycle/header': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'recycle/row': {
        extraKeys: [],
        activeKeys: ['recover', 'expunge'],
      },
      'recycle/toolbar': {
        extraKeys: ['recover', 'expunge'],
        activeKeys: [],
      },
      'sub.primary-storage/toolbar': {
        extraKeys: [],
        activeKeys: ['create.volume', 'enable', 'disable', 'vm.attach.volume', 'vm.detach.volume', 'delete'],
      },
      'sub.vCenter/row': {
        extraKeys: [],
        activeKeys: ['create.volume', 'vm.detach.volume', 'volume.attach.to.vm', 'delete'],
      },
      'sub.vm-instance/row': {
        extraKeys: [],
        activeKeys: ['volume.detach.from.vm', 'delete.volume.from.vm'],
      },
      'sub.vm-instance/toolbar': {
        extraKeys: ['create.volume.from.vm'],
        activeKeys: ['volume.attach.to.vm', 'volume.detach.from.vm', 'delete.volume.from.vm'],
      },
      'sub/row': {
        extraKeys: ['create.volume'],
        activeKeys: ['vm.attach.volume', 'vm.detach.volume'],
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
      genActionFromRemote('vcenter-volume', intl).then(remoteConfig => {
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
