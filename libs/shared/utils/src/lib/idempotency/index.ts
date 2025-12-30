/**
 * Default header name for idempotency keys.
 * Must match the server-side interceptor configuration.
 */
export const IDEMPOTENCY_HEADER = 'idempotency-key'

/**
 * Generates a unique idempotency key using crypto.randomUUID().
 *
 * Use this to prevent duplicate operations on retries or double-clicks.
 * The same key should be reused for retries of the same logical operation.
 *
 * @example
 * // Generate once per user action, reuse on retries
 * const key = generateIdempotencyKey()
 *
 * // First attempt
 * await api.post('/checkout', data, { headers: { [IDEMPOTENCY_HEADER]: key } })
 *
 * // Retry uses same key - server returns cached response
 * await api.post('/checkout', data, { headers: { [IDEMPOTENCY_HEADER]: key } })
 *
 * @returns A UUID string suitable for use as an idempotency key
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

/**
 * Creates headers object with the idempotency key.
 * Convenience function for adding idempotency to fetch/axios requests.
 *
 * @example
 * await fetch('/api/checkout', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     ...createIdempotencyHeaders(key)
 *   },
 *   body: JSON.stringify(data)
 * })
 *
 * @param key - The idempotency key to use
 * @returns Headers object with the idempotency key
 */
export function createIdempotencyHeaders(key: string): Record<string, string> {
  return { [IDEMPOTENCY_HEADER]: key }
}
