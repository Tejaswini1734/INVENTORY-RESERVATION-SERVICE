import {
  createReservation,
  releaseReservation,
  getReservationById,
} from '../services/reservation.service.js';
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from '../errors/reservationErrors.js';

export async function createReservationHandler(request, reply) {
  try {
    const reservation = await createReservation(request.body);

    return reply.code(201).send(reservation);
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return reply.code(404).send({
        error: error.message,
      });
    }

    if (error instanceof InsufficientInventoryError) {
      return reply.code(409).send({
        error: error.message,
      });
    }

    console.error(error);

    return reply.code(500).send({
      error: 'Internal Server Error',
    });
  }
}

export async function releaseReservationHandler(request, reply) {
  try {
    const reservation = await releaseReservation(
      request.params.reservationId
    );

    return reply.code(200).send(reservation);
  } catch (error) {
    console.error(error);

    return reply.code(500).send({
      error: error.message,
    });
  }
}


export async function getReservationHandler(request, reply) {
  try {
    const reservation = await getReservationById(
      request.params.reservationId
    );

    return reply.code(200).send(reservation);
  } catch (error) {
    return reply.code(404).send({
      error: error.message,
    });
  }
}