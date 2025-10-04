#!/usr/bin/env node

const { Pool } = require('pg');
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not found, using environment variables directly');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createMerchantCategoriesTable() {
    console.log('🚀 Creating merchant_categories table...');

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS merchant_categories (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                merchant VARCHAR(500) NOT NULL,
                category VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, merchant)
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_merchant_categories_user_merchant
            ON merchant_categories(user_id, merchant);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_merchant_categories_user_id
            ON merchant_categories(user_id);
        `);

        console.log('✅ merchant_categories table created successfully!');

    } catch (error) {
        console.error('❌ Error creating merchant_categories table:', error);
        process.exit(1);
    }
}

async function main() {
    try {
        console.log('🔧 Starting merchant categories cache migration...');

        await createMerchantCategoriesTable();

        console.log('🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);

    } finally {
        await pool.end();
    }
}

main();