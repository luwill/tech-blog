// BigInt serialization helper
export function serializeBigInt<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  ))
}

// Global BigInt serialization setup (call once in app initialization)
export function setupBigIntSerialization() {
  if (typeof BigInt !== 'undefined') {
    // @ts-expect-error - Adding toJSON method to BigInt prototype
    BigInt.prototype.toJSON = function() {
      return Number(this)
    }
  }
}