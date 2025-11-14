import { query } from "../config/db.js";
import { ConflictError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId) => {
    try {
        await query(
            `INSERT INTO short_urls (full_url, short_url, user_id) VALUES ($1, $2, $3)`,
            [longUrl, shortUrl, userId ?? null]
        );
    } catch (err) {
        // Unique violation
        if (err && err.code === '23505') {
            throw new ConflictError("Short URL already exists");
        }
        throw err;
    }
};

export const getShortUrl = async (shortUrl) => {
    const { rows } = await query(
        `UPDATE short_urls SET clicks = clicks + 1 WHERE short_url = $1 RETURNING id, full_url, short_url, clicks, user_id`,
        [shortUrl]
    );
    return rows[0] || null;
}

export const getCustomShortUrl = async (slug) => {
    const { rows } = await query(
        `SELECT id, full_url, short_url, clicks, user_id FROM short_urls WHERE short_url = $1`,
        [slug]
    );
    return rows[0] || null;
}