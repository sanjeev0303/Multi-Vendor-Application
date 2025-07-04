import Redis from "ioredis"

console.log();

const redis = new Redis(process.env.REDIS_DATABASE_URI!);

export default redis
