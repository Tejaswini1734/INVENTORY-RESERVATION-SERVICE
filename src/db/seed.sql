BEGIN;

INSERT INTO products (
    id,
    name,
    total_quantity,
    available_quantity
)
VALUES (
    'product-1',
    'Test Product',
    10,
    10
)
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    total_quantity = EXCLUDED.total_quantity,
    available_quantity = EXCLUDED.available_quantity,
    updated_at = NOW();

COMMIT;