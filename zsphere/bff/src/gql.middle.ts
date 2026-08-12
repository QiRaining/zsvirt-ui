import { Injectable, NestMiddleware } from '@nestjs/common'
import { GraphQLSchemaHost } from '@nestjs/graphql'
import { parse, visit, print, GraphQLSchema } from 'graphql'
import { visitWithTypeInfo, TypeInfo } from 'graphql/utilities'

function validateQuery(parsedQuery, schemaInstance: GraphQLSchema): string {
  const typeInfo = new TypeInfo(schemaInstance)
  // 遍历查询字符串，查找不符合 schema 规范的字段
  const fixedQuery = visit(
    parsedQuery,
    visitWithTypeInfo(typeInfo, {
      Field(node) {
        const parentType: any = typeInfo.getParentType()
        if (parentType) {
          const fields = parentType.getFields?.()
          const fieldName = node.name.value
          if (fields && !fields[fieldName] && fieldName !== '__typename') {
            // return null 会删除该字段
            return null
          }
        }
      }
    })
  )

  // 将修改后的查询字符串重新打印为字符串并返回
  return print(fixedQuery)
}

@Injectable()
export class NotFoundFieldsMiddleware implements NestMiddleware {
  constructor(private schemaHost: GraphQLSchemaHost) {}

  use = async (req, res, next) => {
    const { query } = req.body
    if (query && req.header('schema-fix')) {
      const parseQuery = parse(query)
      const fixQuery = validateQuery(parseQuery, this.schemaHost.schema)
      req.body.query = fixQuery
    }
    next()
  }
}
