import { getAvailabilityHandler } from '../controllers/product.controller.js';

export default async function productRoutes(fastify) {
  fastify.get(
    '/products/:productId/availability',
    getAvailabilityHandler
  );
}