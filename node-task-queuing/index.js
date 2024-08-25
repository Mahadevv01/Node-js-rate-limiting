const cluster = require('cluster');
const os = require('os');
const express = require('express');
const redis = require('redis');
const fs = require('fs');
const path = require('path');

if (cluster.isMaster) {
    // Fork two worker processes
    for (let i = 0; i < 2; i++) {
        cluster.fork();
    }

    // If a worker dies, restart it
    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const app = express();
    const client = redis.createClient();

    app.use(express.json());

    // Rate Limiting Function
    const rateLimit = async (user_id, client) => {
        const currentSecond = Math.floor(Date.now() / 1000);
        const currentMinute = Math.floor(Date.now() / 60000);

        const secondKey = `rate:${user_id}:sec:${currentSecond}`;
        const minuteKey = `rate:${user_id}:min:${currentMinute}`;

        const [secCount, minCount] = await Promise.all([
            client.get(secondKey),
            client.get(minuteKey),
        ]);

        if ((secCount && secCount >= 1) || (minCount && minCount >= 20)) {
            return false;
        }

        client.multi()
            .incr(secondKey)
            .incr(minuteKey)
            .expire(secondKey, 1)
            .expire(minuteKey, 60)
            .exec();

        return true;
    };

    // Task Function
    async function task(user_id) {
        const logMessage = `${user_id}-task completed at-${new Date().toISOString()}\n`;
        const logFilePath = path.join(__dirname, 'task-log.txt');

        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) console.error('Failed to write to log file', err);
        });
    }

    // Route to handle task processing
    app.post('/api/v1/task', async (req, res) => {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const canProceed = await rateLimit(user_id, client);

        if (!canProceed) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
        }

        const taskId = `${user_id}:${Date.now()}`;
        client.lpush(`tasks:${user_id}`, taskId, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to queue the task' });
            }
            res.status(200).json({ message: 'Task queued successfully', taskId });
        });
    });

    // Function to process queued tasks
    const processTasks = (client) => {
        setInterval(() => {
            client.keys('tasks:*', (err, keys) => {
                if (err) return console.error(err);

                keys.forEach((key) => {
                    const user_id = key.split(':')[1];
                    client.rpop(key, async (err, taskId) => {
                        if (err) return console.error(err);
                        if (!taskId) return;

                        const canProceed = await rateLimit(user_id, client);

                        if (canProceed) {
                            task(user_id);
                        } else {
                            client.rpush(key, taskId);
                        }
                    });
                });
            });
        }, 1000);
    };

    // Start processing tasks
    processTasks(client);

    // Start the server
    app.listen(3000, () => {
        console.log(`Worker ${process.pid} started`);
    });
}
