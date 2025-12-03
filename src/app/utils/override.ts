import pool from "@/lib/db";
import logger from "@/lib/logger";

export async function getAllCachedMerchantCategories(userId: string): Promise<Record<string, string>> {
    try {
        if (!userId) return {};
        const cached: Record<string, string> = {};
        const res = await pool.query(
            'SELECT merchant, category FROM merchant_categories WHERE user_id = $1',
            [userId]
        );
        logger.info(`Fetched ${res.rows.length} cached merchant categories for user: ${userId}`);
        res.rows.forEach(row => {
            cached[row.merchant] = row.category;
        })
        return cached;
    } catch (error) {
        logger.error(`Error fetching all cached merchant categories: ${JSON.stringify(error, null, 2)}`);
        return {} as Record<string, string>;
    }
}

export async function applyOverride(userId: string, merchant: string, category: string) {
    try {
        if (!userId || !merchant || !category) return;
        await pool.query(
            'UPDATE merchant_categories SET category = $1 WHERE user_id = $2 AND merchant = $3',
            [category, userId, merchant]
        );
        logger.info(`Applied override for merchant: ${merchant} to category: ${category} for user: ${userId}`);
        return { success: true, message: 'Override applied successfully' };
    } catch (error) {
        logger.error(`Error applying override: ${JSON.stringify(error, null, 2)}`);
    }
}

export async function applyAllOverrides(userId: string, overrides: Record<string, string>) {
    try {
        const oldCached: Record<string, string> | undefined = await getAllCachedMerchantCategories(userId);
        if (!userId || !overrides) return;
        for (const [merchant, category] of Object.entries(overrides)) {
            await applyOverride(userId, merchant, category);
        }
        const newCached = await getAllCachedMerchantCategories(userId);
        const overridesApplied = Object.keys(overrides).filter(merchant => oldCached[merchant as keyof typeof oldCached] !== newCached[merchant as keyof typeof newCached]);
        logger.info(`Overrides applied: ${JSON.stringify(overridesApplied, null, 2)}`);
        return { success: true, message: 'All overrides applied successfully', overridesApplied: overridesApplied };
    } catch (error) {
        logger.error(`Error applying all overrides: ${JSON.stringify(error, null, 2)}`);
    }
}