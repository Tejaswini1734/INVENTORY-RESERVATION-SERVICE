import { pool } from '../db/pool.js';

export async function getAvailabilityHandler(request, reply) {
  const result = await pool.query(
    `
    SELECT id, available_quantity
    FROM products
    WHERE id = $1
    `,
    [request.params.productId]
  );

  if (result.rows.length === 0) {
    return reply.code(404).send({
      error: 'Product not found',
    });
  }

  return reply.send(result.rows[0]);
}