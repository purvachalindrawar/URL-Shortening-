import { query } from "../config/db.js";
import { ConflictError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId, { expires_at = null, password_hash = null, project_id = null } = {}) => {
    try {
        await query(
            `INSERT INTO short_urls (full_url, short_url, user_id, expires_at, password_hash, project_id, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
            [longUrl, shortUrl, userId ?? null, expires_at, password_hash, project_id]
        );
    } catch (err) {
        // Unique violation
        if (err && err.code === '23505') {
            throw new ConflictError("Short URL already exists");
        }
        throw err;
    }
};

export const getShortUrl = async (shortUrl, clickMeta = null) => {
    if (clickMeta) {
        const client = await query(`SELECT 1`); // ensures pool initialized
        // increment clicks and capture id
        const { rows } = await query(
            `UPDATE short_urls SET clicks = clicks + 1 WHERE short_url = $1 RETURNING id, full_url, short_url, clicks, user_id, expires_at, is_active, password_hash`,
            [shortUrl]
        );
        const row = rows[0];
        if (!row) return null;
        // log click
        await query(
            `INSERT INTO link_clicks (short_url_id, ua, referrer, ip) VALUES ($1, $2, $3, $4)`,
            [row.id, clickMeta.ua || null, clickMeta.referrer || null, clickMeta.ip || null]
        );
        return row;
    } else {
        const { rows } = await query(
            `SELECT id, full_url, short_url, clicks, user_id, expires_at, is_active, password_hash FROM short_urls WHERE short_url = $1`,
            [shortUrl]
        );
        return rows[0] || null;
    }
}

export const getCustomShortUrl = async (slug) => {
    const { rows } = await query(
        `SELECT id, full_url, short_url, clicks, user_id, expires_at, is_active, password_hash FROM short_urls WHERE short_url = $1`,
        [slug]
    );
    return rows[0] || null;
}

export const getLinkById = async (id) => {
    const { rows } = await query(
        `SELECT id, full_url, short_url, clicks, user_id, expires_at, is_active, password_hash FROM short_urls WHERE id = $1`,
        [id]
    );
    return rows[0] || null;
}

export const getClicksByLinkId = async (id) => {
    const { rows } = await query(
        `SELECT id, ts, ua, referrer, ip FROM link_clicks WHERE short_url_id = $1 ORDER BY ts DESC`,
        [id]
    );
    return rows;
}

export const cleanupExpired = async () => {
    const { rowCount } = await query(
        `UPDATE short_urls SET is_active = FALSE WHERE is_active = TRUE AND expires_at IS NOT NULL AND NOW() > expires_at`
    );
    return rowCount;
}