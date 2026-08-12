import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'enable.nic.in.vm' | 'disable.nic.in.vm' | 'attach.nic.in.vm' | 'attach.nic.in.load.balancer' | 'attach.nic.in.vcenter.vm' | 'create.vpc.network' | 'set.default.network' | 'set.nic.type' | 'set.mac' | 'set.ip' | 'sync.config' | 'set.nic.drive.type' | 'set.qos' | 'vmNic.set.securityGroup' | 'detach.nic.in.vm' | 'detach.nic.in.load.balancer' | 'detach.nic.vcenter.vm' | 'attach.in.baremetal2.instance' | 'detach.in.baremetal2.instance' | 'set.default.nic' | 'vpcrouter.enable.nic' | 'vpcrouter.disable.nic' | 'attach.to.vpcrouter' | 'detach.from.vpcrouter' | 'set.qos.in.router' | 'delete.vpc.network' | 'bind.nic' | 'unbind.nic' | 'vm.nic.bind.eip' | 'vm.nic.unbind.eip' | 'set.snat' | 'add.aggregated.nic' | 'remove.aggregated.nic'

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
        key: 'enable.nic.in.vm',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'enable.nic.in.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'disable.nic.in.vm',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'disable.nic.in.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'disable.nic.in.vm-divider',
        divider: true,
      },
      {
        key: 'attach.nic.in.vm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.nic.in.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'attach.nic.in.load.balancer',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.nic.in.load.balancer',
          resource: 'load.balancer',
          type: 'action'
        },
      },
      {
        key: 'attach.nic.in.vcenter.vm',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.nic.in.vcenter.vm',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'create.vpc.network',
        name: intl.formatMessage({ id: 'create.vpcNetwork', defaultMessage: 'Create VPC Network' }),
        auth: {
          authKey: 'create.vpc.network',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'set.default.network',
        name: intl.formatMessage({ id: 'set.defaultNetwork', defaultMessage: 'Set as Default Network' }),
        auth: {
          authKey: 'set.default.network',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.nic.type',
        name: intl.formatMessage({ id: 'set.nicType', defaultMessage: 'Set NIC Type' }),
        auth: {
          authKey: 'set.nic.type',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.mac',
        name: intl.formatMessage({ id: 'set.mac', defaultMessage: 'Set MAC' }),
        auth: {
          authKey: 'set.mac',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.ip',
        name: intl.formatMessage({ id: 'set.network.and.ip.address', defaultMessage: 'Set Network and IP Address' }),
        auth: {
          authKey: 'set.ip',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'sync.config',
        name: intl.formatMessage({ id: 'sync.config', defaultMessage: 'Synchronize Configurations' }),
        auth: {
          authKey: 'sync.config',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.nic.drive.type',
        name: intl.formatMessage({ id: 'set.nicDriveType', defaultMessage: 'Set NIC Model' }),
        auth: {
          authKey: 'set.nic.drive.type',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.qos',
        name: intl.formatMessage({ id: 'set.nicQos', defaultMessage: 'Set NIC QoS' }),
        auth: {
          authKey: 'set.qos',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.qos-divider',
        divider: true,
      },
      {
        key: 'vmNic.set.securityGroup',
        name: intl.formatMessage({ id: 'vmNic.set.securityGroup', defaultMessage: 'Set Security Group' }),
        auth: {
          authKey: 'vmNic.set.securityGroup',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vmNic.set.securityGroup-divider',
        divider: true,
      },
      {
        key: 'detach.nic.in.vm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.nic.in.vm',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'detach.nic.in.load.balancer',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.nic.in.load.balancer',
          resource: 'load.balancer',
          type: 'action'
        },
      },
      {
        key: 'detach.nic.in.load.balancer-divider',
        divider: true,
      },
      {
        key: 'detach.nic.vcenter.vm',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.nic.vcenter.vm',
          resource: 'vcenter.vm',
          type: 'action'
        },
      },
      {
        key: 'detach.nic.vcenter.vm-divider',
        divider: true,
      },
      {
        key: 'attach.in.baremetal2.instance',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.in.baremetal2.instance',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'detach.in.baremetal2.instance',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.in.baremetal2.instance',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'set.default.nic',
        name: intl.formatMessage({ id: 'set.defaultNic', defaultMessage: 'Make Default' }),
        auth: {
          authKey: 'set.default.nic',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'vpcrouter.enable.nic',
        name: intl.formatMessage({ id: 'enable', defaultMessage: 'Enable ' }),
        auth: {
          authKey: 'vpcrouter.enable.nic',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'vpcrouter.disable.nic',
        name: intl.formatMessage({ id: 'disable', defaultMessage: 'Disable' }),
        auth: {
          authKey: 'vpcrouter.disable.nic',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'attach.to.vpcrouter',
        name: intl.formatMessage({ id: 'attach', defaultMessage: 'Attach' }),
        auth: {
          authKey: 'attach.to.vpcrouter',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'detach.from.vpcrouter',
        name: intl.formatMessage({ id: 'detach', defaultMessage: 'Detach' }),
        auth: {
          authKey: 'detach.from.vpcrouter',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'set.qos.in.router',
        name: intl.formatMessage({ id: 'set.nicQos', defaultMessage: 'Set NIC QoS' }),
        auth: {
          authKey: 'set.qos.in.router',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'delete.vpc.network',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete.vpc.network',
          resource: 'vpc.vrouter',
          type: 'action'
        },
        icon: 'trash',
      },
      {
        key: 'bind.nic',
        name: intl.formatMessage({ id: 'bind', defaultMessage: 'Associate' }),
        auth: {
          authKey: 'bind.nic',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'unbind.nic',
        name: intl.formatMessage({ id: 'unbind', defaultMessage: 'Disassociate' }),
        auth: {
          authKey: 'unbind.nic',
          resource: 'security.group',
          type: 'action'
        },
      },
      {
        key: 'vm.nic.bind.eip',
        name: intl.formatMessage({ id: 'bind.eip', defaultMessage: 'Attach EIP' }),
        auth: {
          authKey: 'vm.nic.bind.eip',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'vm.nic.unbind.eip',
        name: intl.formatMessage({ id: 'unbind.eip', defaultMessage: 'Detach EIP' }),
        auth: {
          authKey: 'vm.nic.unbind.eip',
          resource: 'vm',
          type: 'action'
        },
      },
      {
        key: 'set.snat',
        name: intl.formatMessage({ id: 'set.snat', defaultMessage: 'Set SNAT' }),
        auth: {
          authKey: 'set.snat',
          resource: 'vpc.vrouter',
          type: 'action'
        },
      },
      {
        key: 'add.aggregated.nic',
        name: intl.formatMessage({ id: 'add.aggregated.nic', defaultMessage: 'Add to Bond' }),
        auth: {
          authKey: 'add.aggregated.nic',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
      {
        key: 'remove.aggregated.nic',
        name: intl.formatMessage({ id: 'remove.aggregated.nic', defaultMessage: 'Remove from Bond' }),
        auth: {
          authKey: 'remove.aggregated.nic',
          resource: 'baremetal2.instance',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'sub.baremetal2.instance.arrangeNic': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.baremetal2.instance.arrangeNic/row': {
        extraKeys: [],
        activeKeys: ['add.aggregated.nic', 'remove.aggregated.nic'],
      },
      'sub.baremetal2.instance/row': {
        extraKeys: [],
        activeKeys: ['detach.in.baremetal2.instance', 'set.default.nic'],
      },
      'sub.baremetal2.instance/toolbar': {
        extraKeys: ['attach.in.baremetal2.instance', 'detach.in.baremetal2.instance'],
        activeKeys: [],
      },
      'sub.node/row': {
        extraKeys: [],
        activeKeys: ['detach.nic.in.load.balancer'],
      },
      'sub.node/toolbar': {
        extraKeys: ['attach.nic.in.load.balancer', 'detach.nic.in.load.balancer'],
        activeKeys: [],
      },
      'sub.sg/row': {
        extraKeys: [],
        activeKeys: ['unbind.nic'],
      },
      'sub.sg/toolbar': {
        extraKeys: ['bind.nic', 'unbind.nic'],
        activeKeys: [],
      },
      'sub.vcenter.router/row': {
        extraKeys: ['delete.vpc.network'],
        activeKeys: [],
      },
      'sub.vcenter.router/toolbar': {
        extraKeys: ['delete.vpc.network'],
        activeKeys: [],
      },
      'sub.vcenter/row': {
        extraKeys: ['detach.nic.vcenter.vm'],
        activeKeys: [],
      },
      'sub.vcenter/toolbar': {
        extraKeys: ['attach.nic.in.vcenter.vm', 'detach.nic.vcenter.vm'],
        activeKeys: [],
      },
      'sub.vpcrouter.manage/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vpcrouter.manage/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub.vpcrouter.public/row': {
        extraKeys: [],
        activeKeys: ['set.default.network', 'vpcrouter.enable.nic', 'vpcrouter.disable.nic', 'detach.from.vpcrouter', 'set.qos.in.router', 'set.snat'],
      },
      'sub.vpcrouter.public/toolbar': {
        extraKeys: ['attach.to.vpcrouter'],
        activeKeys: ['detach.from.vpcrouter'],
      },
      'sub.vpcrouter.vpc/row': {
        extraKeys: [],
        activeKeys: ['vpcrouter.enable.nic', 'vpcrouter.disable.nic', 'detach.from.vpcrouter', 'set.qos.in.router', 'delete.vpc.network'],
      },
      'sub.vpcrouter.vpc/toolbar': {
        extraKeys: ['create.vpc.network', 'attach.to.vpcrouter'],
        activeKeys: ['detach.from.vpcrouter', 'delete.vpc.network'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: ['enable.nic.in.vm', 'disable.nic.in.vm', 'set.default.network', 'set.nic.type', 'set.mac', 'set.ip', 'sync.config', 'set.nic.drive.type', 'set.qos', 'vmNic.set.securityGroup', 'detach.nic.in.vm', 'vm.nic.bind.eip', 'vm.nic.unbind.eip'],
      },
      'sub/toolbar': {
        extraKeys: ['attach.nic.in.vm', 'detach.nic.in.vm'],
        activeKeys: ['enable.nic.in.vm', 'disable.nic.in.vm', 'sync.config'],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('vm-nic', intl).then(remoteConfig => {
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
