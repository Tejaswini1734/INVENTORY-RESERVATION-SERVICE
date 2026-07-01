BEGIN;

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_reservations_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT chk_reservations_status_valid
        CHECK (status IN ('ACTIVE', 'RELEASED', 'EXPIRED'))
);

CREATE TRIGGER trg_reservations_set_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_reservations_product_id
    ON reservations(product_id);

CREATE INDEX IF NOT EXISTS idx_reservations_active_expires_at
    ON reservations(expires_at)
    WHERE status = 'ACTIVE';

COMMIT;