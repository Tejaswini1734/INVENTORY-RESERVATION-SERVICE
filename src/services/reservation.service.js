import { pool } from '../db/pool.js';
import {
  ProductNotFoundError,
  InsufficientInventoryError,
} from '../errors/reservationErrors.js';
import { publishEvent } from '../kafka/producer.js';

export async function createReservation({
  productId,
  quantity,
  ttlMinutes,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      `
      SELECT *
      FROM products
      WHERE id = $1
      FOR UPDATE
      `,
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new ProductNotFoundError(productId);
    }

    const product = productResult.rows[0];

    if (product.available_quantity < quantity) {
      throw new InsufficientInventoryError(
        productId,
        quantity,
        product.available_quantity
      );
    }

    const updateResult = await client.query(
      `
      UPDATE products
      SET available_quantity = available_quantity - $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [quantity, productId]
    );

    const expiresAtMinutes = ttlMinutes || 15;

    const reservationResult = await client.query(
      `
      INSERT INTO reservations (
        product_id,
        quantity,
        status,
        expires_at
      )
      VALUES (
        $1,
        $2,
        'ACTIVE',
        NOW() + ($3 || ' minutes')::interval
      )
      RETURNING *
      `,
      [productId, quantity, expiresAtMinutes]
    );

    await client.query('COMMIT');
    await publishEvent(
        'reservation.created',
        reservationResult.rows[0]
     );

    return reservationResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function releaseReservation(reservationId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reservationResult = await client.query(
      `
      SELECT *
      FROM reservations
      WHERE id = $1
      FOR UPDATE
      `,
      [reservationId]
    );

    if (reservationResult.rows.length === 0) {
      throw new Error('Reservation not found');
    }

    const reservation = reservationResult.rows[0];

    // Idempotent release
    if (reservation.status !== 'ACTIVE') {
      await client.query('COMMIT');
      return reservation;
    }

    await client.query(
      `
      UPDATE products
      SET available_quantity = available_quantity + $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [reservation.quantity, reservation.product_id]
    );

    const updatedReservation = await client.query(
      `
      UPDATE reservations
      SET status = 'RELEASED',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [reservationId]
    );

    await client.query('COMMIT');

    await publishEvent(
      'reservation.released',
      updatedReservation.rows[0]
    );

    return updatedReservation.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getReservationById(reservationId) {
  const result = await pool.query(
    `
    SELECT *
    FROM reservations
    WHERE id = $1
    `,
    [reservationId]
  );

  if (result.rows.length === 0) {
    throw new Error('Reservation not found');
  }

  return result.rows[0];
}