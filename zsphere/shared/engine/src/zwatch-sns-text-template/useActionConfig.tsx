import { useMemo, useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { IMenuItem, ITableListProps } from '@zstack/zsphere-components'
// TODO: migrate types to local compat layer after zsphere-components deprecation
import type { Item } from '@zstack/zsphere-types'

import { handleActionList } from '../../utils'
import { genActionFromRemote } from '../../core/action/render'

type IKey = 'create.sns.text.template' | 'edit.zsv' | 'edit' | 'editConfig' | 'make.default' | 'unset.default.template' | 'delete'

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
        key: 'create.sns.text.template',
        name: intl.formatMessage({ id: 'create.messageTemplate', defaultMessage: 'New Message Template' }),
        auth: {
          authKey: 'create.sns.text.template',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
        icon: 'plus',
      },
      {
        key: 'edit.zsv',
        name: intl.formatMessage({ id: 'virtualization.edit.name.and.description', defaultMessage: 'Edit Name and Description' }),
        auth: {
          authKey: 'edit.zsv',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
      {
        key: 'edit',
        name: intl.formatMessage({ id: 'edit', defaultMessage: 'Edit' }),
        auth: {
          authKey: 'edit',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
      {
        key: 'editConfig',
        name: intl.formatMessage({ id: 'editConfig', defaultMessage: 'Modify Configuration' }),
        auth: {
          authKey: 'editConfig',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
      {
        key: 'make.default',
        name: intl.formatMessage({ id: 'set.default', defaultMessage: 'Make Default' }),
        auth: {
          authKey: 'make.default',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
      {
        key: 'unset.default.template',
        name: intl.formatMessage({ id: 'cancel.default', defaultMessage: 'Cancel Default Setting' }),
        auth: {
          authKey: 'unset.default.template',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
      {
        key: 'unset.default.template-divider',
        divider: true,
      },
      {
        key: 'delete',
        name: intl.formatMessage({ id: 'delete', defaultMessage: 'Delete' }),
        auth: {
          authKey: 'delete',
          resource: 'zwatch.sns.text.template',
          type: 'action'
        },
      },
    ],

    viewMap: {
      'main.virtualization/row': {
        extraKeys: [],
        activeKeys: ['edit.zsv', 'editConfig', 'make.default', 'unset.default.template', 'delete'],
      },
      'main.virtualization/toolbar': {
        extraKeys: ['create.sns.text.template'],
        activeKeys: ['make.default', 'unset.default.template', 'delete'],
      },
      'main/header': {
        extraKeys: [],
        activeKeys: ['edit', 'editConfig', 'make.default', 'unset.default.template', 'delete'],
      },
      'main/row': {
        extraKeys: [],
        activeKeys: ['edit', 'make.default', 'unset.default.template', 'delete'],
      },
      'main/toolbar': {
        extraKeys: ['create.sns.text.template'],
        activeKeys: ['make.default', 'unset.default.template', 'delete'],
      },
      'sub/row': {
        extraKeys: [],
        activeKeys: [],
      },
      'sub/toolbar': {
        extraKeys: [],
        activeKeys: [],
      },
      'virtualization.main/row': {
        extraKeys: [],
        activeKeys: ['edit.zsv', 'editConfig', 'make.default', 'unset.default.template', 'delete'],
      },
      'virtualization.main/toolbar': {
        extraKeys: ['create.sns.text.template'],
        activeKeys: [],
      },
    }
  }), [intl])

  const [actionConfig, setActionConfig] = useState(_actionConfig)

  useEffect(() => {
    if (localStorage.getItem('debug-branch')) {
      genActionFromRemote('zwatch-sns-text-template', intl).then(remoteConfig => {
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
