import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'edit.physicalNic' | 'edit.ip.address' | 'cluster.phynic.sriov.generate' | 'cluster.phynic.sriov.ungenerate' | 'host.phynic.sriov.generate' | 'host.phynic.sriov.ungenerate' | 'set.physicalNetwork.type' | 'edit.lldpMode' | 'batche.modify.lldpMode' | 'add.physical.nic' | 'remove.physical.nic' | 'modify.lldpMode' | 'config.sriov'

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
        key: 'edit.physicalNic',
        name: intl.formatMessage({ id: 'edit.description', defaultMessage: 'Edit Description' }),
        auth: {
          authKey: 'edit.physicalNic',
          resource: 'host',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'edit.ip.address',
        name: intl.formatMessage({ id: 'modify.ip.address', defaultMessage: 'Modify IP Address' }),
        auth: {
          authKey: 'edit.ip.address',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'cluster.phynic.sriov.generate',
        name: intl.formatMessage({ id: 'sriovGenerate', defaultMessage: 'SR-IOV' }),
        auth: {
          authKey: 'cluster.phynic.sriov.generate',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'cluster.phynic.sriov.ungenerate',
        name: intl.formatMessage({ id: 'sriovUngenerate', defaultMessage: 'SR-IOV Ungenerate' }),
        auth: {
          authKey: 'cluster.phynic.sriov.ungenerate',
          resource: 'cluster',
          type: 'action'
        },
      },
      {
        key: 'host.phynic.sriov.generate',
        name: intl.formatMessage({ id: 'sriovGenerate', defaultMessage: 'SR-IOV' }),
        auth: {
          authKey: 'host.phynic.sriov.generate',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'host.phynic.sriov.ungenerate',
        name: intl.formatMessage({ id: 'sriovUngenerate', defaultMessage: 'SR-IOV Ungenerate' }),
        auth: {
          authKey: 'host.phynic.sriov.ungenerate',
          resource: 'host',
          type: 'action'
        },
      },
      {
        key: 'set.physicalNetwork.type',
        name: intl.formatMessage({ id: 'set.physicalNetwork.type', defaultMessage: 'Modify Network Type' }),
        auth: {
          authKey: 'set.physicalNetwork.type',
          resource: 'physical.nic',
          type: 'action'
        },
      },
      {
        key: 'edit.lldpMode',
        name: intl.formatMessage({ id: 'edit.lldpMode', defaultMessage: 'Modify' }),
        auth: {
          authKey: 'edit.lldpMode',
          resource: 'host',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'batche.modify.lldpMode',
        name: intl.formatMessage({ id: 'batche.modify.lldpMode', defaultMessage: 'Modify LLDP Mode in Bulk' }),
        auth: {
          authKey: 'batche.modify.lldpMode',
          resource: 'host',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'add.physical.nic',
        name: intl.formatMessage({ id: 'add', defaultMessage: 'Add' }),
        auth: {
          authKey: 'add.physical.nic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'remove.physical.nic',
        name: intl.formatMessage({ id: 'remove', defaultMessage: 'Remove' }),
        auth: {
          authKey: 'remove.physical.nic',
          resource: 'bond',
          type: 'action'
        },
      },
      {
        key: 'modify.lldpMode',
        name: intl.formatMessage({ id: 'modify.lldpMode', defaultMessage: 'Modify LLDP Mode' }),
        auth: {
          authKey: 'modify.lldpMode',
          resource: 'host',
          type: 'action'
        },
        icon: 'edit',
      },
      {
        key: 'config.sriov',
        name: intl.formatMessage({ id: 'config.sriov', defaultMessage: 'Configure SR-IOV' }),
        auth: {
          authKey: 'config.sriov',
          resource: 'host',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main/header': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'main/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.bond.physicalNic/row': {
        extraKeys: [],
        activeKeys: ['edit.physicalNic', 'edit.ip.address', 'host.phynic.sriov.generate', 'host.phynic.sriov.ungenerate'],
      },
      'sub.bond.physicalNic/toolbar': {
        extraKeys: ['add.physical.nic', 'remove.physical.nic'],
        activeKeys: [],
      },
      'sub.cluster/row': {
        extraKeys: [],
        activeKeys: ['cluster.phynic.sriov.generate', 'cluster.phynic.sriov.ungenerate'],
      },
      'sub.cluster/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host.hyperconverged/row': {
        extraKeys: [],
        activeKeys: ['edit.physicalNic', 'edit.ip.address', 'host.phynic.sriov.generate', 'host.phynic.sriov.ungenerate'],
      },
      'sub.host.hyperconverged/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.host.lldp/header': {
        extraKeys: ['edit.lldpMode'],
        activeKeys: [],
      },
      'sub.host.virtualization/row': {
        extraKeys: [],
        activeKeys: ['edit.physicalNic', 'edit.ip.address', 'modify.lldpMode', 'config.sriov'],
      },
      'sub.host.virtualization/toolbar': {
        extraKeys: ['batche.modify.lldpMode'],
        activeKeys: [],
      },
      'sub.host/header': {
        extraKeys: ['edit.physicalNic'],
        activeKeys: ['edit.ip.address', 'config.sriov'],
      },
      'sub.host/row': {
        extraKeys: [],
        activeKeys: ['edit.physicalNic', 'edit.ip.address', 'host.phynic.sriov.generate', 'host.phynic.sriov.ungenerate', 'set.physicalNetwork.type'],
      },
      'sub.host/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.physicalNetwork/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.physicalNetwork/toolbar': {
        extraKeys: [],
        activeKeys: [],
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
      genActionFromRemote('physical-nic', intl).then(remoteConfig => {
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
