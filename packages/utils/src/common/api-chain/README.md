# UKey参数配置指南说明手册

**注意：用户必须提供 Restful 风格的 API 才能走这套配置流程，不支持 websocket。**

Ukey 登录抽象成两个独立的流程：

1. 获取证书信息：用来开启证书登录
2. 获取签名信息：用于 Ukey 登录时的验证

**交互原理**：_Ukey 设备插入后，会在 host 上跑服务，此服务提供能够获取证书信息、签名信息的接口，这些接口需要是 Restful 风格的，操作云平台时会去调用提供的这些接口，分别拿到证书信息或签名信息_。

因此，在 UI 页面上需配置如下两部分接口调用信息，才能完成证书登录的开启和 Ukey 登录：

1. **证书接口**：获取证书信息
2. **签名接口**：获取签名信息

_这两块都是独立配置，互不影响，分别需要填写一组 JSON 数组格式的配置对象，基本格式如下：_

```json
// 证书接口
[{}]
// 签名接口
[{},{}]
```

以上数组中的每个对象都会转换为一个 API 的接口调用，大致流程：

1. 按顺序同步调用配置的这些 API
2. 自定义模板变量在 API 之间传递参数（**需要的话**）：可配置上一个 API 的响应结果，转换成模板变量，作为下一个 API 调用时的入参
3. 验证当前 API 的响应是否成功，成功则继续调用下一个 API，否则抛出接口报错信息
4. 提取最终需要的数据：执行到最后一个 API，此 API 响应结果即为目标数据

接下来说明数组中每个 JSON 对象支持配置的字段，即每个 API 的具体配置。

## 一、配置每个 API

对于链中的每个 API，你需要定义：

- `apiName*`：API 的描述性名称（当接口抛错时，可以明确错误API来源）
- `method*`：HTTP 方法（GET、POST）
- `url*`：API 端点 URL
- `headers*`：请求头，包括 Content-Type
- `data`：请求体（用于 POST 请求）
- `params`：URL 查询参数
- `responseMapping*`：如何验证和提取响应数据
- `nextApiParamMappings`：如何将响应数据映射到后续 API 调用

_其中，标记 **\*** 的为必填参数，若存在配置多个API，且后一个API的参数值来自前一个API的响应结果，则 **nextApiParamMappings** 参数必填。_

### 配置 responseMapping 字段

`responseMapping` 对象：用来判断当前 API 的响应是否成功，一共有3个字段可选：

- `path*`（必填）：从响应中提取值的路径，遵循对象的层级结构（如：'a.b'、['a','b']）
- `expectedValue`（可选）：判断当前API响应是否成功的值，若为最后一个 API，则不需要配置，**否则必填**
- `isResult`（可选 true | false）：判断当前API的响应是否作为整个 API 链的返回结果

_依据 `path` 访问响应体，得到的值与预定义的 `expectedValue` 做对比，相等表示响应成功，成功则继续下一个API调用，否则直接抛出接口报错信息。_

> 若配置的只有一个 API，那么只填 path 字段即可，默认会将此 API 的响应作为最终结果

### 配置 nextApiParamMappings 字段

`nextApiParamMappings`：定义如何将一个 API 响应的数据映射到下一个 API 的请求，没有这个需求可以不填。

_一个数组对象的结构，每个对象内有两个字段可选：_

- `key*`（必填）：自定义一个模板变量，可在后续 API 中的入参中使用（params 或 data）
- `path*`（必填）：从响应中提取值的路径，将作为 自定义模板变量 的值，遵循对象的层级结构

### 配置请求头 Content-Type 字段

请求头目前只支持三种不同的内容类型：

- `application/json`：用于发送 JSON 数据
- `application/x-www-form-urlencoded`：用于发送 URL 编码的表单数据
- `multipart/form-data`：用于发送包含文件的表单数据

### 使用模板变量

使用格式为 `{{variableName}}` 的双大括号语法，目前支持 **内置变量** 和 **自定义变量**，适用范围仅用于 API 的入参（params 或 data）。

#### 1. 内置变量（提供两个）

- `RAW_KEY*`：签名的原文信息，字符串长度固定为 **32 位**
- `PIN_CODE`：PIN 码

_若用户提供的签名接口需要额外用到 **PIN 码**，可使用内置的 `{{PIN_CODE}}`。_

#### 2. 自定义变量（可自定义多个）

在前一个 API 中配置了 `nextApiParamMappings` 时，其中声明的 `key` 的值可作为一个自定义变量，用于后续 API 的入参使用。

**_注意_**：_自定义变量的值，只能在后续的 API 中使用，不能在当前 API 中使用。_

## 二、配置示例教程

接下来用一个例子教您如何配置UKey模板（**实际需依据客户提供的接口文档来配置**）：

1. 获取证书信息：客户提供一个接口能直接获取到。
2. 获取签名信息：需要先 **验证pin码**、**获取随机数**，再 **用原文** 去 **获取签名信息**。

### 1. 证书接口（简单配置）

假设客户提供了一个 API 来获取证书信息，如下：

```
POST /sys/getCertinfo
headers
  - Content-Type: application/x-www-form-urlencoded

响应格式：
{
  "code": 200,
  "Certinfo": "xxxxx"
}
```

获取证书信息，只需要调用一个接口就好，因此对应的配置对象也只有一个，如下：

```json
[
  {
    "apiName": "获取证书信息",
    "method": "POST",
    "url": "https://example.com/getCertinfo",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "responseMapping": {
      "path": "Certinfo"
    }
  }
]
```

_要拿到证书信息，path 应该设置为 "Certinfo"，一定要与接口实际的响应结果对应上。_

```
若接口响应格式为：
{
 data: {
   "code": 200,
   "Certinfo": "xxxxx"
 }
}

那 path 应该设置为 "data.Certinfo"，从 data 对象中取 Certinfo
```

### 2. 签名接口（复杂配置）

假设用户提供获取签名信息的方式包含了：**验证 PIN 码**、**获取随机数**、**生成签名** 三个步骤：

1. 验证 PIN 码的正确性
2. 获取指定长度的随机数
3. 使用 PIN 码、随机数、原文来生成签名信息

_因为拿到签名信息一共有三步，每一步都是一个 API 调用，当前 API 调用成功，会继续走下一个 API 调用，直至整个流程结束，拿到 **签名信息**，所以需要配置三个 API 对象。_

#### 第一步：验证 PIN 码

验证 PIN 码 接口如下：

```
POST /sys/verifyPin
请求参数：
  - pin: string
headers:
  - Content-Type: application/x-www-form-urlencoded
接口成功的响应格式：
{
    "code": 200,
    "message": "成功"
}
```

对应的配置如下：

```json
{
  "apiName": "验证pin码",
  "method": "POST",
  "url": "http://localhost:38080/verifyPin",
  "data": {
    "pin": "{{PIN_CODE}}" // 使用内置模板变量 PIN_CODE 占位
  },
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "responseMapping": {
    "path": "code", // 从响应中获取 code 字段
    "expectedValue": 200 // 验证 code 是否为 200
  }
}
```

**响应数据结构如下**：

```json
{
  "code": 200,
  "message": "验证成功"
}
```

_依据 `responseMapping.path` 的配置，从响应体中读取 `code` 字段，
再与 `responseMapping.expectedValue` 预设的值 200 做对比，
若为 200 则代表当前接口响应成功，否则抛出接口返回的错误。_

#### 第二步：获取随机数

这一步获取指定长度的随机数，并将结果传递给下一个 API。

提供的接口如下：

```
POST /cipher/genRandom
请求参数：
  - appid: string
  - len: 24 // 这里固定填24，与服务端约定好了返回的原文信息长度为 32 位
  - apppassword: string
headers:
  - Content-Type: application/x-www-form-urlencoded
接口成功的响应格式：
{
    "msgType": 8328,
    "errCode": 0,
    "mData": "pID99ODCqTE+k6fOyeX8uzaNfFVdM7kr",
    "errMsg": null,
    "id": 7031237
}
```

配置如下：

```json
{
  "apiName": "获取随机数",
  "method": "GET",
  "url": "http://localhost:8091/cipher/genRandom",
  "params": {
    "appid": 93,
    "len": 24,
    "apppassword": "zdty"
  },
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "responseMapping": {
    "path": "errCode", // 检查 errCode 字段
    "expectedValue": 0 // 验证 errCode 是否为 0
  },
  "nextApiParamMappings": [
    // 配置数据传递
    {
      "key": "plainData", // 定义一个模板变量 plainData，可在下一个 API 的入参中使用
      "path": "mData" // 从当前响应中获取 mData 字段
    }
  ]
}
```

**响应数据结构示例**：

```json
{
  "errCode": 0, // 表示当前 API 响应成功
  "mData": "abc123"
}
```

此时模板变量 `{{plainData}}` 的值会在运行时替换为 `abc123`，可在下一个 API 的入参中使用。

##### 第三步：生成签名信息

最后一步：使用 PIN 码和上一个 API 返回的随机数、以及原文组合生成签名信息，提供的签名接口如下：

```
POST /sign
请求参数：
  - pin: string
  - plainData: string
  - plainDataLen: 32
headers:
  - Content-Type: application/x-www-form-urlencoded
接口成功的响应格式：
{
    "code": 200,
    "signData": "xxx",
    "message": "成功"
}
```

```json
{
  "apiName": "获取签名信息",
  "method": "POST",
  "url": "http://172.22.1.12:38080/sign",
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "responseMapping": {
    "path": "signData" // 返回签名数据
  },
  "data": {
    "pin": "{{PIN_CODE}}", // 使用内置模板变量： PIN_CODE
    "plainDataLen": 32,
    "oriData": "{{RAW_KEY}}", // 使用内置模板变量： RAW_KEY
    "plainData": "{{plainData}}" //  使用上一个 API 中自定义的模板变量： plainData
  }
}
```

**响应数据结构示例**：

```json
{
  "code": 200,
  "message": "成功",
  "signData": "xyz789" // 生成的签名数据
}
```

_从响应体中取 `responseMapping.path` 指定的路径，得到的结果（"signData": "xyz789"）即为最后的签名数据。_

**所以，该 demo 最终的签名接口配置如下：**

```json
[
  {
    "apiName": "验证pin码",
    "method": "POST",
    "url": "http:/localhost:38080/verifyPin",
    "data": {
      "pin": "{{PIN_CODE}}"
    },
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "responseMapping": {
      "path": "code",
      "expectedValue": 200
    }
  },
  {
    "apiName": "获取随机数长度",
    "method": "GET",
    "url": "http://localhost:8091/cipher/genRandom",
    "params": {
      "appid": 93,
      "len": 24,
      "apppassword": "zdty@123"
    },
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "responseMapping": {
      "path": "errCode",
      "expectedValue": 0
    },
    "nextApiParamMappings": [
      {
        "paramKey": "plainData",
        "sourcePath": "mData"
      }
    ]
  },
  {
    "apiName": "获取签名信息",
    "method": "POST",
    "url": "http://localhost:38080/sign",
    "data": {
      "pin": "{{PIN_CODE}}",
      "plainData": "{{plainData}}",
      "oriData": "{{RAW_KEY}}",
      "plainDataLen": 32
    },
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    "responseMapping": {
      "path": "signData"
    }
  }
]
```

## 注意事项

1. **PIN_CODE 和 RAW_KEY** 是内置的模板变量，分别表示 PIN 码和原文信息，**切记不要填写错误**
2. **RAW_KEY** 表示的原文信息长度固定为 32 位，若签名接口需要传递这样的参数，比如上面 demo 中的 `plainDataLen`，那么填 32
3. 提供签名或证书接口的 API 个数尽量不超过 3 个，1 个最好
