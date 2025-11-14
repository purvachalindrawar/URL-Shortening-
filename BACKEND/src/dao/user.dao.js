import { query } from "../config/db.js";

export const findUserByEmail = async (email) => {
    const { rows } = await query(
        "SELECT id, name, email, avatar FROM users WHERE email = $1",
        [email]
    );
    return rows[0] || null;
}

export const findUserByEmailByPassword = async (email) => {
    const { rows } = await query(
        "SELECT id, name, email, password, avatar FROM users WHERE email = $1",
        [email]
    );
    return rows[0] || null;
}

export const findUserById = async (id) => {
    const { rows } = await query(
        "SELECT id, name, email, avatar FROM users WHERE id = $1",
        [id]
    );
    return rows[0] || null;
}

export const createUser = async (name, email, passwordHashed) => {
    const { rows } = await query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar",
        [name, email, passwordHashed]
    );
    return rows[0];
}

export const getAllUserUrlsDao = async (userId) => {
    const { rows } = await query(
        "SELECT id, full_url, short_url, clicks FROM short_urls WHERE user_id = $1 ORDER BY id DESC",
        [userId]
    );
    return rows;
}