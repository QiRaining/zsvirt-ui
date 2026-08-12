import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'add.baremetal.chassis' | 'add.baremetal.instance' | 'enable' | 'disable' | 'powerSupply.management' | 'power.on.chassis' | 'power.off.chassis' | 'reboot.chassis' | 'open.console' | 'edit' | 'get.hardware.info' | 'update.bareMetalChassis.ipmiInfo' | 'delete.baremetal.chassis'

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
        key: 'add.baremetal.chassis',
        name: intl.formatMessage({ id: 'add.baremetalChassis', defaultMessage: 'Add Bare Metal Chassis' }),
        auth: {
          authKey: 'add.baremetal.chassis',
          resource: 'baremetal.chassis',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'add.baremetal.instance',
        name: intl.formatMessage({ id: 'add.baremetal.instance', defaultMessage: 'New Bare Metal Instance' }),
        auth: {
          authKey: 'add.baremetal.instance',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
      {
        key: 'add.baremetal.instance-divider',
        divider: true,
      },
      {
        key: 'enable',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable',
          resource: 'baremetal.chassis',
          type: 'action'
        },
        icon: 'play-circle',
      },
      {
        key: 'disable',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable',
          resource: 'baremetal.chassis',
          type: 'action'
        },
        icon: 'stop-circle',
      },
      {
        key: 'powerSupply.management',
        name: intl.formatMessage({ id: 'powerSupply.management', defaultMessage: 'Power Management' }),
        children: [
          {
            key: 'power.on.chassis',
            name: intl.formatMessage({ id: 'powerOn', defaultMessage: 'Power On' }),
            auth: {
              authKey: 'power.on.chassis',
              resource: 'baremetal.chassis',
              type: 'action'
            },
          },
          {
            key: 'power.off.chassis',
            name: intl.formatMessage({ id: 'power.stop', defaultMessage: 'Shut Down' }),
            auth: {
              authKey: 'power.off.chassis',
              resource: 'baremetal.chassis',
              type: 'action'
            },
          },
          {
            key: 'reboot.chassis',
            name: intl.formatMessage({ id: 'restart', defaultMessage: 'Reboot' }),
            auth: {
              authKey: 'reboot.chassis',
              resource: 'baremetal.chassis',
              type: 'action'
            },
          },
        ],
      },
      {
        key: 'open.console',
        name: intl.formatMessage({ id: 'open.console', defaultMessage: 'Launch Console' }),
        auth: {
          authKey: 'open.console',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
      {
        key: 'open.console-divider',
        divider: true,
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit.name.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
      {
        key: 'get.hardware.info',
        name: intl.formatMessage({ id: 'get.hardwareInfo', defaultMessage: 'Obtain Hardware Information' }),
        auth: {
          authKey: 'get.hardware.info',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
      {
        key: 'update.bareMetalChassis.ipmiInfo',
        name: intl.formatMessage({ id: 'update.bareMetalChassis.ipmiInfo', defaultMessage: 'Update IPMI Info' }),
        auth: {
          authKey: 'update.bareMetalChassis.ipmiInfo',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
      {
        key: 'update.bareMetalChassis.ipmiInfo-divider',
        divider: true,
      },
      {
        key: 'delete.baremetal.chassis',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.baremetal.chassis',
          resource: 'baremetal.chassis',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: ['add.baremetal.instance', 'enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'open.console', 'edit', 'get.hardware.info', 'update.bareMetalChassis.ipmiInfo', 'delete.baremetal.chassis'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['add.baremetal.instance', 'enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'open.console', 'edit', 'get.hardware.info', 'update.bareMetalChassis.ipmiInfo', 'delete.baremetal.chassis'],
      },
      'main/toolbar': {
        extraKeys: ['add.baremetal.chassis', 'enable', 'disable'],
        activeKeys: ['power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'delete.baremetal.chassis'],
      },
      'sub.baremetal.cluster/row': {
        extraKeys: [],
        activeKeys: ['add.baremetal.instance', 'enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'open.console', 'edit', 'get.hardware.info', 'update.bareMetalChassis.ipmiInfo', 'delete.baremetal.chassis'],
      },
      'sub.baremetal.cluster/toolbar': {
        extraKeys: ['add.baremetal.chassis', 'enable', 'disable'],
        activeKeys: ['power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'delete.baremetal.chassis'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'open.console', 'update.bareMetalChassis.ipmiInfo', 'delete.baremetal.chassis'],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: ['enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'delete.baremetal.chassis'],
      },
      'virtualization.dir/directory': {
        extraKeys: [],
        activeKeys: ['add.baremetal.instance', 'enable', 'disable', 'power.on.chassis', 'power.off.chassis', 'reboot.chassis', 'open.console', 'edit', 'get.hardware.info', 'update.bareMetalChassis.ipmiInfo', 'delete.baremetal.chassis'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('baremetal-chassis', intl).then(remoteConfig => {
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
