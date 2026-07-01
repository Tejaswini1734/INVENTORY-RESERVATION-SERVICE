import { checkDatabaseConnection } from '../db/pool.js';
import { checkKafkaConnection } from '../kafka/client.js';

export default async function healthRoutes(fastify) {
  fastify.get('/health', async (request, reply) => {
    const [dbOk, kafkaOk] = await Promise.all([
      checkDatabaseConnection(),
      checkKafkaConnection(),
    ]);

    const status = dbOk && kafkaOk ? 'ok' : 'degraded';
    const statusCode = dbOk && kafkaOk ? 200 : 503;

    return reply.code(statusCode).send({
      status,
      db: dbOk ? 'ok' : 'unreachable',
      kafka: kafkaOk ? 'ok' : 'unreachable',
      timestamp: new Date().toISOString(),
    });
  });
}