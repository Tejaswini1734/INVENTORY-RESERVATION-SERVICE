import {
  createReservationHandler,
  releaseReservationHandler,
    getReservationHandler,
} from '../controllers/reservation.controller.js';

export default async function reservationRoutes(fastify) {
  fastify.post('/reservations', createReservationHandler);
  fastify.get(
    '/reservations/:reservationId',
     getReservationHandler);

  fastify.delete(
    '/reservations/:reservationId',
    releaseReservationHandler
  );
}