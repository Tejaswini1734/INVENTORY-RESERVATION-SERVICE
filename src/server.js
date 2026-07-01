import { buildApp } from './app.js';
import config from './config/index.js';
import { processExpiredReservations } from './jobs/reservationExpiry.job.js';

const app = buildApp();

async function start() {
  try {
    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });

    console.log(`Server running on port ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
setInterval(async () => {
  await processExpiredReservations();
}, 60000);