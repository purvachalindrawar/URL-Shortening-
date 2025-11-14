import { generateNanoId } from "../utils/helper.js"
import { getCustomShortUrl, saveShortUrl } from "../dao/short_url.js"
import bcrypt from "bcryptjs"

const RESERVED_SLUGS = new Set(['api','admin','auth','login','signup','healthz','static','assets'])
const isValidSlug = (s) => /^[a-zA-Z0-9-_]{3,64}$/.test(s)

const normalizeUrl = (u) => {
    try {
        const fixed = new URL(u)
        return fixed.href
    } catch {
        throw new Error("Invalid URL")
    }
}

export const createShortUrlWithoutUser = async (url, options = {}) => {
    const shortUrl = generateNanoId(7)
    if(!shortUrl) throw new Error("Short URL not generated")
    const full = normalizeUrl(url)
    const payload = await buildOptions(options)
    await saveShortUrl(shortUrl, full, null, payload)
    return shortUrl
}

export const createShortUrlWithUser = async (url,userId,slug=null, options = {}) => {
    const full = normalizeUrl(url)
    let shortUrl = slug || generateNanoId(7)
    if (slug) {
        if (RESERVED_SLUGS.has(slug.toLowerCase())) throw new Error("This slug is reserved")
        if (!isValidSlug(slug)) throw new Error("Invalid slug format")
        const exists = await getCustomShortUrl(slug)
        if(exists) throw new Error("This custom url already exists")
    }
    const payload = await buildOptions(options)
    await saveShortUrl(shortUrl, full, userId, payload)
    return shortUrl
}

const buildOptions = async ({ password, expiresAt, ttlHours, projectId } = {}) => {
    let expires_at = null
    if (expiresAt) {
        const d = new Date(expiresAt)
        if (isNaN(d.getTime())) throw new Error("Invalid expiresAt")
        expires_at = d.toISOString()
    } else if (ttlHours) {
        const h = Number(ttlHours)
        if (!isFinite(h) || h <= 0) throw new Error("Invalid ttlHours")
        expires_at = new Date(Date.now() + h*3600*1000).toISOString()
    }
    let password_hash = null
    if (password) {
        password_hash = await bcrypt.hash(password, 10)
    }
    const project_id = projectId ?? null
    return { expires_at, password_hash, project_id }
}