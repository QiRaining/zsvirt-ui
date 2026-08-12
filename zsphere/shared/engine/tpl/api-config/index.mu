{{#apiGroups}}
import {{.}} from './{{.}}'
{{/apiGroups}}

const useStruct = (intl: any) => {
  return [
    {{#struct}}
    {
      key: '{{key}}',
      name: intl.formatMessage({ id: 'roleApiModule.{{key}}', defaultMessage: '{{name}}' }),
      children: [
        {{#children}}
        {
          key: '{{key}}',
          api: {{apiModelName}}(intl),
          name: intl.formatMessage({ id: 'roleApiModule.{{key}}', defaultMessage: '{{name}}' })
        },
        {{/children}}
      ]
    },
    {{/struct}}
  ]
}

export default {
{{#apiGroups}}
  {{.}},
{{/apiGroups}}
  useStruct
}