export class ProductNotFoundError extends Error {
  constructor(productId) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
    this.productId = productId;
  }
}

export class InsufficientInventoryError extends Error {
  constructor(productId, requested, available) {
    super(
      `Insufficient inventory for product ${productId}: requested ${requested}, available ${available}`
    );

    this.name = 'InsufficientInventoryError';
    this.productId = productId;
    this.requested = requested;
    this.available = available;
  }
}