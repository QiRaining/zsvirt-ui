import type { SessionInventory } from '@/api/zstack/types'

export interface AccountSessionIdentity {
  sessionId: string
  accountUuid: string
  /**
   * Compatibility alias for consumers that have not migrated to accountUuid yet.
   * Account sessions no longer have an independent user UUID.
   */
  userUuid: string
}

/**
 * Account sessions use accountUuid as their only identity UUID. Keep userUuid as
 * a compatibility alias at the BFF boundary until all GraphQL consumers migrate.
 */
export function getAccountSessionIdentity(inventory?: SessionInventory): AccountSessionIdentity {
  const sessionId = inventory?.uuid
  const accountUuid = inventory?.accountUuid
  if (!sessionId || !accountUuid) {
    const missingFields = [!sessionId && 'uuid', !accountUuid && 'accountUuid'].filter(Boolean)

    throw new Error(
      `Account login response is missing required session field(s): ${missingFields.join(', ')}`
    )
  }

  return {
    sessionId,
    accountUuid,
    userUuid: accountUuid
  }
}
