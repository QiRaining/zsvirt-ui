import { GraphQLScalarType, Kind } from 'graphql'

//s -> c
function serializeBigInt(v) {
  return Number(v)
}
// c -> s
function parseValueBigInt(v) {
  return Number(v)
}
export const BigInt = new GraphQLScalarType({
  name: 'BigInt',
  serialize: serializeBigInt,
  parseValue: parseValueBigInt,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseValueBigInt(ast.value)
    }

    return null
  }
})
