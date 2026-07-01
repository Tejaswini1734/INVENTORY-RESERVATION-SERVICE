import 'dotenv/config';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const config = {
  env: process.env.NODE_ENV || 'development',

  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    url: required('DATABASE_URL'),
  },

  kafka: {
    clientId:
      process.env.KAFKA_CLIENT_ID || 'inventory-reservation-service',

    brokers: required('KAFKA_BROKERS')
      .split(',')
      .map((b) => b.trim()),
  },

  reservation: {
    defaultTtlMinutes: parseInt(
      process.env.DEFAULT_TTL_MINUTES || '15',
      10
    ),
  },
};

export default config;