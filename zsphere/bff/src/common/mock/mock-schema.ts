import { addMocksToSchema, MockList } from '@graphql-tools/mock'
import {
  type GraphQLObjectType,
  type GraphQLSchema,
  isListType,
  isNonNullType,
  isObjectType
} from 'graphql'

import { getListLen, mockResolvers } from './mock-resolvers'

/**
 * For every object type that has list fields, synthesise a type-level mock
 * that makes those list fields return a MockList of the configured length.
 * addMocksToSchema's default list length is 2; we want it tunable via
 * ZSV_MOCK_LIST_LEN (default 3).
 */
function buildListMocks(
  schema: GraphQLSchema
): Record<string, () => Record<string, () => MockList>> {
  const typeMocks: Record<string, () => Record<string, () => MockList>> = {}
  const typeMap = schema.getTypeMap()
  for (const typeName of Object.keys(typeMap)) {
    if (typeName.startsWith('__')) {
      continue
    }
    const type = typeMap[typeName]
    if (!isObjectType(type)) {
      continue
    }
    const objectType = type as GraphQLObjectType
    const fields = objectType.getFields()
    const listFields: Record<string, () => MockList> = {}
    for (const fieldName of Object.keys(fields)) {
      const field = fields[fieldName]
      const nakedType = isNonNullType(field.type) ? field.type.ofType : field.type
      if (isListType(nakedType)) {
        listFields[fieldName] = () => new MockList(getListLen())
      }
    }
    if (Object.keys(listFields).length > 0) {
      // If the same object also exposes a count-like sibling field,
      // make it match the list length so API consumers see coherent totals.
      const countSiblings = ['total', 'count', 'totalCount']
      for (const sibling of countSiblings) {
        if (fields[sibling]) {
          listFields[sibling] = (() => getListLen()) as unknown as () => MockList
        }
      }
      typeMocks[typeName] = () => listFields
    }
  }
  return typeMocks
}

export function applyMocksToSchema(schema: GraphQLSchema): GraphQLSchema {
  const listMocks = buildListMocks(schema)
  return addMocksToSchema({
    schema,
    mocks: { ...mockResolvers, ...listMocks },
    preserveResolvers: false
  })
}
