import { pool } from '../db/pool.js';
import { publishEvent } from '../kafka/producer.js';
export async function processExpiredReservations() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const expiredReservations = await client.query(
      `
      SELECT *
      FROM reservations
      WHERE status = 'ACTIVE'
      AND expires_at <= NOW()
      FOR UPDATE
      `
    );

    for (const reservation of expiredReservations.rows) {
      await client.query(
        `
        UPDATE products
        SET available_quantity = available_quantity + $1,
            updated_at = NOW()
        WHERE id = $2
        `,
        [reservation.quantity, reservation.product_id]
      );

      await client.query(
        `
        UPDATE reservations
        SET status = 'EXPIRED',
            updated_at = NOW()
        WHERE id = $1
        `,
        [reservation.id]
      );
      await publishEvent(
        'reservation.expired',
        reservation
      );

      console.log(
        `Expired reservation processed: ${reservation.id}`
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Expiry job failed:', error);
  } finally {
    client.release();
  }
}