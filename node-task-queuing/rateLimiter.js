const Redis = require('ioredis');
const redis = new Redis();

function getKey(userId, period) {
    return `${userId}:${period}`;
}

async function rateLimiter(userId) {
    const currentSecond = Math.floor(Date.now() / 1000);
    const currentMinute = Math.floor(currentSecond / 60);

    const secondKey = getKey(userId, currentSecond);
    const minuteKey = getKey(userId, currentMinute);

    const transaction = redis.multi();

    transaction.incr(secondKey);
    transaction.incr(minuteKey);

    transaction.expire(secondKey, 1);
    transaction.expire(minuteKey, 60);

    const [secondCount, minuteCount] = await transaction.exec();

    if (secondCount > 1 || minuteCount > 20) {
        throw new Error('Rate limit exceeded');
    }
}

module.exports = rateLimiter;
