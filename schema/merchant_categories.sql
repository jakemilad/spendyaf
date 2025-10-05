-- Merchant categories caching table
CREATE TABLE IF NOT EXISTS merchant_categories (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    merchant VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, merchant)
);
-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_merchant_categories_user_merchant ON merchant_categories(user_id, merchant);
-- Index for user-based queries
CREATE INDEX IF NOT EXISTS idx_merchant_categories_user_id ON merchant_categories(user_id);