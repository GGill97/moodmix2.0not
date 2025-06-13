// src/lib/rateLimit.ts
export class RateLimit {
  private static requests: { [key: string]: number[] } = {};
  private static limit = 10; // requests
  private static window = 60000; // 1 minute in ms

  static async check(key: string): Promise<boolean> {
    const now = Date.now();
    const timestamps = this.requests[key] || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.window
    );

    if (validTimestamps.length >= this.limit) return false;

    this.requests[key] = [...validTimestamps, now];
    return true;
  }
}
