import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.REDIS_URL as string,
  token: process.env.REDIS_SECRET as string,
})

// const data = await redis.incr("counter")
// return {
//   statusCode: 200,
//   body: JSON.stringify({
//     view_count: data,
//   }),
// }
