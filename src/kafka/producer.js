import kafka from './client.js';

const producer = kafka.producer();

let connected = false;

export async function connectProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log('Kafka Producer Connected');
  }
}

export async function publishEvent(topic, payload) {
  try {
    await connectProducer();

    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });

    console.log(`Event published: ${topic}`);
  } catch (error) {
    console.error('Kafka publish failed:', error);
  }
}