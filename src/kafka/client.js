import { Kafka } from 'kafkajs';
import config from '../config/index.js';

const kafka = new Kafka({
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  retry: {
    retries: 3,
  },
});

export async function checkKafkaConnection() {
  const admin = kafka.admin();

  try {
    await admin.connect();
    await admin.listTopics();
    return true;
  } catch (err) {
    console.error('Kafka health check failed', err);
    return false;
  } finally {
    await admin.disconnect().catch(() => {});
  }
}

export default kafka;