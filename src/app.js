import Fastify from 'fastify';
import healthRoutes from './routes/health.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import productRoutes from './routes/product.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(healthRoutes);
  app.register(reservationRoutes);
  app.register(productRoutes);
  return app;
}