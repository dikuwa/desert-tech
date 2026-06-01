import { Redis } from "@upstash/redis";

export const cache = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const DEFAULT_TTL = 60;

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;
  const data = await fetchFn();
  await cache.set(key, data, { ex: ttl });
  return data;
}

export const tags = {
  products: "products",
  categories: "categories",
  orders: "orders",
  customers: "customers",
  promotions: "promotions",
  dashboard: "dashboard",
  notifications: "notifications",
  receipts: "receipts",
  followUps: "follow-ups",
} as const;

export async function invalidateTag(tag: string) {
  let cursor = 0;
  do {
    const [nextCursor, keys] = await cache.scan(cursor, {
      match: `tag:${tag}:*`,
      count: 100,
    });
    if (keys.length > 0) await cache.del(...keys);
    cursor = Number(nextCursor);
  } while (cursor !== 0);
}
