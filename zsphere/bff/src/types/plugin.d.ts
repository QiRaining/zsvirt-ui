declare namespace Plugin {
  type ICollection =
    | 'material'
    | 'app'
    | 'menu'
    | 'menu.default'
    | 'i18n'
    | 'auth'
    | 'authConfig'
    | 'resource'
    | 'resourceField'
    | 'resourceAction'
    | 'resourceConstant'

  interface IQuery {
    start: number
    limit: number
    sort?: object
    q?: {
      [key: string]: string | string[] | object
    }
  }

  interface BaseModel {
    _id?: string
    id?: string
    source: 'system' | 'vendor'
    createdAt?: string
    updatedAt?: string
  }

  interface IMaterialModel extends BaseModel {
    type: 'icon' | 'app-icon'
    fileName: string
    filePath: string
    suffix: string
    mimeType: string
    size: number
  }

  interface IAppModel extends BaseModel {
    name: string
    base: string
    state: 'active' | 'disable'
    localUrl?: string
    remoteUrl?: string
    entrypoint: 'top-nav' | 'left-nav' | 'no-nav'
    i18nKey?: string
    iconKey?: string
  }

  interface IMenuModel extends BaseModel {
    name: string
    enName?: string
    key: string
    menuKey?: string
    description?: string
    i18nKey: string
    prevKey: string
    nextKey: string
    parentKey: string
    iconKey?: string
    iconPath?: string
    showType?: 'page' | 'catalog'
    target?: '_blank' | 'iframe' | 'app' | 'page'
    url?: string
    path?: string
    resourceType?: string
    isTab?: boolean
    tokenReg?: string
    privilege?: 'admin' | 'all'
    visible?: boolean
  }

  interface I18NModel extends BaseModel {
    key?: string
    zhCN?: string
    enUS?: string
    lang?: 'zhCN' | 'enUS'
    type?: 'text' | 'markdown'
  }
  interface IAuthModel extends BaseModel {
    authKey: string
    resource?: string
    type?: 'view' | 'action' | 'block'
    isAdmin?: boolean
    remark?: string
  }

  interface IAuthConfigModel extends BaseModel {
    type: string
    key: string
    authId?: string
    mode?: 'hidden' | 'tooltip' | 'placeholder' | 'strike' | 'redirect'
    isValid?: boolean
    remark?: 'string'
  }

  interface IFileModel extends BaseModel {
    originalName: string
    fileName: string
    suffix: string
    mimeType: string
    size: number
  }

  interface IResourceModel extends BaseModel {
    resourceKey: string
    resourceName: string
    remark?: string
    isField?: boolean
    isAction?: boolean
    isConstant?: boolean
  }

  interface IResourceFieldModel extends BaseModel {
    name: string
    key: string
    i18nKey: string
    showType: 'text' | 'copyable' | 'ellipsis' | 'link' | 'constant' | 'date'
    width: number
    isSort: boolean
    isQuery: boolean
    queryType:
      | 'input'
      | 'singleFilter'
      | 'multipleFilter'
      | 'singleSelect'
      | 'multipleSelect'
      | 'numberRange'
      | 'unitRange'
      | 'dateRange'
      | 'progressBar'
    isAdmin: boolean
    order: number
    submitter?: string
  }

  interface IResourceFieldAllModel extends IResourceFieldModel {
    [key: string]: any
  }

  interface IResourceActionModel extends BaseModel {
    name: string
    childName: string
    key: string
    i18nKey: string
    authName: string
    authI18nKey: string
    divider: string
    icon: string
    showType: 'timelyFeedback' | 'modal' | 'drawer' | 'link'
    tooltip: string
    description: string
    validator: string
    isAdmin: boolean
    remark: string
    order: number
    submitter: string
  }

  interface IResourceActionAllModel extends IResourceActionModel {
    [key: string]: any
  }

  interface IResourceConstantModel extends BaseModel {
    name: string
    key: string
    i18nKey: string
    type: string
    styleType: 'prefixDot' | 'prefixIcon' | 'suffixIcon' | 'text' | 'tag'
    icon: string
    state: string
    remark: string
    order: number
    submitter: string
  }

  interface IResourceCustomColumnModel extends BaseModel {
    columnKey: string
    columnName: string
    resourceId: string
    tableType: string
    remark: string
    submitter: string
  }

  interface IResourceCustomColumnValueModel extends BaseModel {
    value: string
    columnId: string
    rowId: string
    remark: string
    submitter: string
  }
}
