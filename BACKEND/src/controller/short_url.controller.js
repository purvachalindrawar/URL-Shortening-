import { getShortUrl } from "../dao/short_url.js"
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import { getCustomShortUrl, getClicksByLinkId, getLinkById, cleanupExpired } from "../dao/short_url.js"
import bcrypt from "bcryptjs"
import { stringify } from "csv-stringify"
import PDFDocument from "pdfkit"
import wrapAsync from "../utils/tryCatchWrapper.js"

export const createShortUrl = wrapAsync(async (req,res)=>{
    const data = req.body
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url,req.user.id,data.slug, {
            password: data.password,
            expiresAt: data.expiresAt,
            ttlHours: data.ttlHours,
            projectId: data.projectId,
        })
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url, {
            password: data.password,
            expiresAt: data.expiresAt,
            ttlHours: data.ttlHours,
        })
    }
    const base = (process.env.APP_URL || "").replace(/\/$/, "")
    res.status(200).json({shortUrl : `${base}/${shortUrl}`})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await getCustomShortUrl(id)
    if(!url) throw new Error("Short URL not found")
    if (url.is_active === false) return res.status(410).send("This short link has expired.")
    if (url.expires_at && new Date(url.expires_at) < new Date()) return res.status(410).send("This short link has expired.")
    if (url.password_hash) {
        res.setHeader('Content-Type','text/html; charset=utf-8')
        return res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Protected Link</title></head><body style="font-family:system-ui;background:#0b1220;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;"><form method="POST" action="/api/create/${id}/unlock" style="background:#111827;padding:24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.4)"><h1 style="margin:0 0 12px">Enter Password</h1><input type="password" name="password" placeholder="Password" style="padding:10px;border-radius:8px;border:1px solid #374151;background:#0f172a;color:#e5e7eb;width:100%"><button type="submit" style="margin-top:12px;background:#2563eb;color:white;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;width:100%">Unlock</button></form></body></html>`)
    }
    const meta = { ua: req.headers['user-agent'], referrer: req.headers['referer'], ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress }
    const updated = await getShortUrl(id, meta)
    return res.redirect(updated.full_url)
})

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    const {url,slug} = req.body
    const shortUrl = req.user
        ? await createShortUrlWithUser(url, req.user.id, slug, req.body)
        : await createShortUrlWithUser(url, null, slug, req.body)
    const base = (process.env.APP_URL || "").replace(/\/$/, "")
    res.status(200).json({shortUrl : `${base}/${shortUrl}`})
})

export const unlockProtected = wrapAsync(async (req, res) => {
    const { id } = req.params
    const { password } = req.body
    const url = await getCustomShortUrl(id)
    if(!url) return res.status(404).send("Not found")
    if (!url.password_hash) return res.redirect(`/${id}`)
    const ok = await bcrypt.compare(password || "", url.password_hash)
    if (!ok) return res.status(401).send("Invalid password")
    const meta = { ua: req.headers['user-agent'], referrer: req.headers['referer'], ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress }
    const updated = await getShortUrl(id, meta)
    return res.redirect(updated.full_url)
})

export const exportCsv = wrapAsync(async (req, res) => {
    const { id } = req.params
    const link = await getLinkById(id)
    if (!link) return res.status(404).json({ message: "Not found" })
    if (!req.user || (link.user_id && req.user.id !== link.user_id)) return res.status(403).json({ message: "Forbidden" })
    const clicks = await getClicksByLinkId(id)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="link_${id}_clicks.csv"`)
    const stringifier = stringify({ header: true, columns: ['id','ts','ua','referrer','ip'] })
    stringifier.pipe(res)
    clicks.forEach(r => stringifier.write(r))
    stringifier.end()
})

export const exportPdf = wrapAsync(async (req, res) => {
    const { id } = req.params
    const link = await getLinkById(id)
    if (!link) return res.status(404).json({ message: "Not found" })
    if (!req.user || (link.user_id && req.user.id !== link.user_id)) return res.status(403).json({ message: "Forbidden" })
    const clicks = await getClicksByLinkId(id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="link_${id}_clicks.pdf"`)
    const doc = new PDFDocument({ margin: 40 })
    doc.pipe(res)
    doc.fontSize(18).text(`Clicks Report for ${link.short_url}`, { underline: true })
    doc.moveDown()
    doc.fontSize(12)
    clicks.forEach(c => {
        doc.text(`${c.ts} | ${c.ip || ''} | ${c.referrer || ''}`)
    })
    doc.end()
})

export const adminCleanupExpired = wrapAsync(async (req, res) => {
    const auth = req.headers['authorization'] || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth
    if (!process.env.RENDER_ADMIN_TOKEN || token !== process.env.RENDER_ADMIN_TOKEN) return res.status(401).json({ message: 'Unauthorized' })
    const affected = await cleanupExpired()
    res.status(200).json({ message: 'ok', affected })
})