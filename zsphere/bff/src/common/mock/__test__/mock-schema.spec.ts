import { makeExecutableSchema } from '@graphql-tools/schema'
import { graphql } from 'graphql'

import { applyMocksToSchema } from '../mock-schema'

const typeDefs = /* GraphQL */ `
  type VM { uuid: ID!, name: String!, running: Boolean! }
  type VmList { items: [VM!]!, total: Int! }
  type Query { vms: VmList! }
  type MutationResponse { success: Boolean!, message: String }
  type Mutation { deleteVm(uuid: ID!): MutationResponse! }
`

describe('applyMocksToSchema', () => {
  const schema = applyMocksToSchema(makeExecutableSchema({ typeDefs }))

  it('mocks Query.vms with a list of length 3 and total >= length', async () => {
    const { data, errors } = await graphql({
      schema,
      source: `{ vms { items { uuid name running } total } }`
    })
    expect(errors).toBeUndefined()
    const vms = (data as any).vms
    expect(vms.items).toHaveLength(3)
    expect(vms.total).toBeGreaterThanOrEqual(3)
    expect(vms.items[0].running).toBe(true)
  })

  it('mutation response defaults success=true', async () => {
    const { data } = await graphql({
      schema,
      source: `mutation { deleteVm(uuid: "x") { success message } }`
    })
    expect((data as any).deleteVm.success).toBe(true)
  })
})
