export enum HttpMethod {
  "GET" = "GET",
  "POST" = "POST",
}

export enum ContentType {
  /** 用于发送 JSON 格式的数据 */
  "JSON" = "application/json",
  /** 用于发送 URL 编码的表单数据 */
  "FORM_URLENCODED" = "application/x-www-form-urlencoded",
  /** 用于发送包含文件的多部分表单数据 */
  "FORM_DATA" = "multipart/form-data",
}
export interface NextApiParamMapping {
  /** 自定义的变量名 */
  key: string;

  /**
   * 从响应数据中提取值的路径
   * 例如: 'data.user.id' 或 ['data', 'user', 'id']
   */
  path: string | string[];
}

export interface ResponseMapping {
  /**
   * 从响应中提取值的路径
   * 例如: 'data.result' 或 ['data', 'result']
   */
  path: string | string[];

  /**
   * 期望的响应值，用于验证 API 调用是否成功
   * 例如: { expectedValue: 200 } 表示期望响应中指定路径的值为 200
   */
  expectedValue?: unknown;

  /**
   * 是否作为最终返回值
   * - true: 该值将作为整个 API 链的返回结果
   * - false 或未设置: 该值仅用于验证
   */
  isResult?: boolean;
}

export interface ApiConfig {
  /** API 调用的描述性名称，用于错误提示和调试 */
  apiName: string;

  /** HTTP 请求方法 */
  method: HttpMethod;

  /** API 的完整 URL */
  url: string;

  /**
   * POST 请求的数据体
   * 支持使用模板变量: {{variableName}}
   */
  data?: Record<string, unknown>;

  /**
   * URL 查询参数
   * 支持使用模板变量: {{variableName}}
   */
  params?: Record<string, unknown>;

  /** 请求头信息 */
  headers: {
    /** 请求的内容类型 */
    "Content-Type": ContentType;

    /** 其他可选的请求头 */
    [key: string]: string;
  };

  /**
   * 下一个 API 的参数映射配置
   * 用于将当前 API 的响应数据传递给下一个 API
   */
  nextApiParamMappings?: Array<NextApiParamMapping>;

  /** 响应处理配置 */
  responseMapping: ResponseMapping;
}

export interface ExecuteApiChainPayload {
  /**
   * API 调用链配置数组
   * 按数组顺序依次执行每个 API
   */
  apis: ApiConfig[];

  /**
   * 全局变量
   * 可在任何支持模板变量的地方使用: {{variableName}}
   */
  globalVars?: Record<string, unknown>;
}
