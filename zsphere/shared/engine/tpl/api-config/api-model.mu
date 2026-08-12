const api = (intl: any) => {
  return {
    {{#apis}}
    {{apiKey}}: {
      name: '{{apiKey}}',
      description: intl.formatMessage({ id: 'apiModel.api.{{apiKey}}', defaultMessage: '{{name}}' }),
      api: '{{value}}',
    },
    {{/apis}}
  }
}

export default api
